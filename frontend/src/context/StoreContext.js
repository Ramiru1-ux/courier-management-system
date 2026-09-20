import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import useAuth from '../hooks/useAuth';
import appDataApi from '../api/appDataApi';
import toast from 'react-hot-toast';

const StoreContext = createContext(null);

// Offline mirror only. MongoDB is the real store - this copy is what keeps
// the UI usable if the backend is not running, and it is pushed up to the
// server as soon as the connection comes back.
const STORE_BACKUP_KEY = 'cms_store_backup_v3';

// Changes are batched for this long before being written to MongoDB, so
// typing in a form does not fire one request per keystroke.
const SAVE_DEBOUNCE_MS = 700;

function nowISO() {
  return new Date().toISOString();
}

function friendlyTime() {
  return new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function friendlyDate(date = new Date()) {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// "2026-09" for a shipment's date - the billing period an invoice covers.
function monthKey(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString().slice(0, 7) : date.toISOString().slice(0, 7);
}

// Stable, sortable key for "which day's cash is this" - the displayed date is
// for people, this is what the code matches on.
function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function seedData() {
  const addresses = [
    { id: 'ADDR-01', merchant: 'Urban Mart', label: 'Main warehouse', address: 'No. 5, Union Place', city: 'Colombo 2', contact: 'Store Manager', phone: '011 234 5566' },
  ];

  const branches = [
    { id: 'BR-01', name: 'Colombo Central', city: 'Colombo', manager: 'Nadeesha Perera', phone: '011 234 5678', status: 'Active' },
    { id: 'BR-02', name: 'Kandy Hub', city: 'Kandy', manager: 'Ruwan Silva', phone: '081 223 1190', status: 'Active' },
    { id: 'BR-03', name: 'Galle Branch', city: 'Galle', manager: 'Chamari Fernando', phone: '091 223 4455', status: 'Active' },
    { id: 'BR-04', name: 'Jaffna Branch', city: 'Jaffna', manager: 'Kavindu Raj', phone: '021 222 8890', status: 'Inactive' },
  ];

  const drivers = [
    { id: 'DRV-01', name: 'Kasun Jayawardena', email: 'driver@egotechworld.com', phone: '077 112 3344', branch: 'Colombo Central', vehicle: 'LK-1738', vehicleType: 'Motorbike', vehicleCapacity: '20 kg', insuranceExpiry: '15 Dec 2026', status: 'Delivering', accountStatus: 'Active', todayDeliveries: 18, codCollectedToday: 45500 },
    { id: 'DRV-02', name: 'Amila Fernando', email: 'amila.fernando@egotechworld.com', phone: '071 554 2233', branch: 'Colombo Central', vehicle: 'LK-2290', vehicleType: 'Three-wheeler', vehicleCapacity: '150 kg', insuranceExpiry: '02 Nov 2026', status: 'Delivering', accountStatus: 'Active', todayDeliveries: 12, codCollectedToday: 28900 },
    { id: 'DRV-03', name: 'Nimal Bandara', email: 'nimal.bandara@egotechworld.com', phone: '076 887 1122', branch: 'Kandy Hub', vehicle: 'LK-3391', vehicleType: 'Van', vehicleCapacity: '900 kg', insuranceExpiry: '20 Sep 2026', status: 'Available', accountStatus: 'Active', todayDeliveries: 9, codCollectedToday: 15200 },
    { id: 'DRV-04', name: 'Sajini Kumari', email: 'sajini.kumari@egotechworld.com', phone: '070 445 9981', branch: 'Galle Branch', vehicle: 'LK-4471', vehicleType: 'Motorbike', vehicleCapacity: '20 kg', insuranceExpiry: '30 Sep 2026', status: 'Offline', accountStatus: 'Active', todayDeliveries: 0, codCollectedToday: 0 },
    { id: 'DRV-05', name: 'Roshan Perera', email: 'roshan.perera@egotechworld.com', phone: '075 662 3390', branch: 'Kandy Hub', vehicle: 'LK-5521', vehicleType: 'Three-wheeler', vehicleCapacity: '150 kg', insuranceExpiry: '11 Jan 2027', status: 'Delivering', accountStatus: 'Active', todayDeliveries: 14, codCollectedToday: 33100 },
  ];

  const shipments = [
    { id: 'SH-1001', trackingNumber: 'EGW-2026-00001245', senderName: 'Sanduni Traders', senderPhone: '077 112 3344', senderAddress: 'No. 8, Galle Road, Colombo 3', recipientName: 'John Perera', recipientPhone: '077 998 2231', recipientAddress: '21 Temple Road', recipientCity: 'Kandy', branch: 'Colombo Central', serviceType: 'Priority', weight: 2.5, codAmount: 4500, status: 'OUT_FOR_DELIVERY', driverId: 'DRV-02', createdAt: nowISO(), history: [{ label: 'Shipment created', time: '2 days ago' }, { label: 'Picked up by courier', time: '2 days ago' }, { label: 'Out for delivery', time: 'Today, 9:10 AM' }] },
    { id: 'SH-1002', trackingNumber: 'EGW-2026-00001246', senderName: 'Urban Mart', senderPhone: '011 234 5566', senderAddress: 'No. 5, Union Place, Colombo 2', recipientName: 'Pasan Perera', recipientPhone: '071 554 2233', recipientAddress: 'Pitakotte', recipientCity: 'Colombo', branch: 'Colombo Central', serviceType: 'Standard', weight: 1.8, codAmount: 1250, status: 'DELIVERED', driverId: 'DRV-01', createdAt: nowISO(), history: [{ label: 'Shipment created', time: '3 days ago' }, { label: 'Delivered', time: 'Yesterday, 4:12 PM' }] },
    { id: 'SH-1003', trackingNumber: 'EGW-2026-00001247', senderName: 'FreshCart', senderPhone: '011 887 2231', senderAddress: 'Nawala Road, Colombo 5', recipientName: 'Nimal Silva', recipientPhone: '077 221 8890', recipientAddress: 'Matara Road', recipientCity: 'Galle', branch: 'Galle Branch', serviceType: 'Same-Day', weight: 3.2, codAmount: 980, status: 'DELIVERY_FAILED', driverId: 'DRV-04', createdAt: nowISO(), history: [{ label: 'Shipment created', time: '2 days ago' }, { label: 'Out for delivery', time: 'Today, 8:00 AM' }, { label: 'Delivery failed - customer unavailable', time: 'Today, 11:40 AM' }] },
    { id: 'SH-1004', trackingNumber: 'EGW-2026-00001248', senderName: 'DrugCart', senderPhone: '011 556 9021', senderAddress: 'Kollupitiya, Colombo 3', recipientName: 'Sajini Fernando', recipientPhone: '070 112 8830', recipientAddress: 'Kurunegala Town', recipientCity: 'Kurunegala', branch: 'Colombo Central', serviceType: 'Express', weight: 0.9, codAmount: 1420, status: 'AT_ORIGIN_BRANCH', driverId: null, createdAt: nowISO(), history: [{ label: 'Shipment created', time: 'Today, 6:45 AM' }, { label: 'Arrived at origin branch', time: 'Today, 7:20 AM' }] },
    { id: 'SH-1005', trackingNumber: 'EGW-2026-00001249', senderName: 'Pasan Perera', senderPhone: '071 554 2233', senderAddress: 'Pitakotte, Colombo 5', recipientName: 'Kavindu Raj', recipientPhone: '076 887 1122', recipientAddress: 'Point Pedro Road', recipientCity: 'Jaffna', branch: 'Colombo Central', serviceType: 'Standard', weight: 4.1, codAmount: 1890, status: 'CREATED', driverId: null, createdAt: nowISO(), history: [{ label: 'Shipment created', time: 'Today, 9:50 AM' }] },
    { id: 'SH-1006', trackingNumber: 'EGW-2026-00001250', senderName: 'Lanka Pharmacy', senderPhone: '011 220 9981', senderAddress: 'Wellawatte, Colombo 6', recipientName: 'Themiya Wickram', recipientPhone: '075 662 1129', recipientAddress: 'Batticaloa Road', recipientCity: 'Anuradhapura', branch: 'Kandy Hub', serviceType: 'Regional', weight: 2.2, codAmount: 1050, status: 'OUT_FOR_DELIVERY', driverId: 'DRV-05', createdAt: nowISO(), history: [{ label: 'Shipment created', time: 'Today, 7:00 AM' }, { label: 'Out for delivery', time: 'Today, 9:30 AM' }] },
    { id: 'SH-1007', trackingNumber: 'EGW-2026-00001251', senderName: 'Mithuru Foods', senderPhone: '011 990 1123', senderAddress: 'Rajagiriya', recipientName: 'Achini Rathnayake', recipientPhone: '077 445 6612', recipientAddress: 'Peradeniya Road', recipientCity: 'Kandy', branch: 'Kandy Hub', serviceType: 'Standard', weight: 1.4, codAmount: 0, status: 'DELIVERED', driverId: 'DRV-03', createdAt: nowISO(), history: [{ label: 'Shipment created', time: '4 days ago' }, { label: 'Delivered', time: '3 days ago' }] },
    { id: 'SH-1008', trackingNumber: 'EGW-2026-00001252', senderName: 'Urban Mart', senderPhone: '011 234 5566', senderAddress: 'No. 5, Union Place, Colombo 2', recipientName: 'Dinuka Senanayake', recipientPhone: '070 887 4432', recipientAddress: 'Matara Fort', recipientCity: 'Matara', branch: 'Galle Branch', serviceType: 'Standard', weight: 2.0, codAmount: 2300, status: 'RTO', driverId: 'DRV-04', createdAt: nowISO(), history: [{ label: 'Shipment created', time: '5 days ago' }, { label: 'Delivery failed - refused', time: '4 days ago' }, { label: 'Returned to origin', time: '2 days ago' }] },
    { id: 'SH-1009', trackingNumber: 'EGW-2026-00001253', senderName: 'FreshCart', senderPhone: '011 887 2231', senderAddress: 'Nawala Road, Colombo 5', recipientName: 'Harsha Gunasekara', recipientPhone: '077 220 1198', recipientAddress: 'Negombo Road', recipientCity: 'Negombo', branch: 'Colombo Central', serviceType: 'Same-Day', weight: 1.1, codAmount: 560, status: 'OUT_FOR_DELIVERY', driverId: 'DRV-01', createdAt: nowISO(), history: [{ label: 'Shipment created', time: 'Today, 8:10 AM' }, { label: 'Picked up by courier', time: 'Today, 8:55 AM' }, { label: 'Out for delivery', time: 'Today, 9:40 AM' }] },
    { id: 'SH-1010', trackingNumber: 'EGW-2026-00001254', senderName: 'Pasan Perera', senderPhone: '071 554 2233', senderAddress: 'Pitakotte, Colombo 5', recipientName: 'Ishara Madushani', recipientPhone: '071 990 2276', recipientAddress: 'Ampara Town', recipientCity: 'Ampara', branch: 'Colombo Central', serviceType: 'Regional', weight: 3.6, codAmount: 1750, status: 'DELIVERED', driverId: 'DRV-03', createdAt: nowISO(), history: [{ label: 'Shipment created', time: '2 days ago' }, { label: 'Delivered', time: 'Today, 10:05 AM' }] },
  ];

  const settlements = [
    { id: 'SET-4402', merchant: 'Urban Mart', reference: 'EGW-2026-00001246', due: 'Today', expected: 88000, collected: 88000, status: 'Cleared' },
    { id: 'SET-4415', merchant: 'FreshCart', reference: 'EGW-2026-00001253', due: 'Tomorrow', expected: 62400, collected: 58900, status: 'Review required' },
    { id: 'SET-4429', merchant: 'DrugCart', reference: 'EGW-2026-00001248', due: 'Today', expected: 51200, collected: 51200, status: 'Cleared' },
    { id: 'SET-4436', merchant: 'Lanka Pharmacy', reference: 'EGW-2026-00001250', due: 'Today', expected: 34800, collected: 0, status: 'Pending' },
    { id: 'SET-4441', merchant: 'City Mart', reference: 'EGW-2026-00001254', due: 'Friday', expected: 42600, collected: 42600, status: 'Cleared' },
    { id: 'SET-4448', merchant: 'Mithuru Foods', reference: 'EGW-2026-00001251', due: 'Friday', expected: 27900, collected: 0, status: 'Pending' },
  ];

  const driverReconciliation = [
    { id: 'REC-2201', driver: 'Kasun Jayawardena', date: 'Today', expected: 45500, collected: 44500, status: 'Pending' },
    { id: 'REC-2202', driver: 'Amila Fernando', date: 'Today', expected: 28900, collected: 28900, status: 'Reconciled' },
    { id: 'REC-2203', driver: 'Roshan Perera', date: 'Yesterday', expected: 33100, collected: 31600, status: 'Pending' },
    { id: 'REC-2204', driver: 'Nimal Bandara', date: 'Yesterday', expected: 15200, collected: 15200, status: 'Reconciled' },
  ];

  const invoices = [
    { id: 'INV-88201', merchant: 'Urban Mart', amount: 145000, date: '01 Sep 2026', dueDate: '08 Sep 2026', status: 'Paid' },
    { id: 'INV-88202', merchant: 'FreshCart', amount: 98500, date: '03 Sep 2026', dueDate: '10 Sep 2026', status: 'Unpaid' },
    { id: 'INV-88203', merchant: 'DrugCart', amount: 76200, date: '05 Sep 2026', dueDate: '12 Sep 2026', status: 'Unpaid' },
    { id: 'INV-88204', merchant: 'City Mart', amount: 54300, date: '28 Aug 2026', dueDate: '04 Sep 2026', status: 'Overdue' },
  ];

  const payments = [
    { id: 'PAY-77011', reference: 'EGW-2026-00001246', method: 'COD', amount: 1250, status: 'Completed', date: 'Today' },
    { id: 'PAY-77012', reference: 'EGW-2026-00001248', method: 'Card', amount: 1420, status: 'Completed', date: 'Today' },
    { id: 'PAY-77013', reference: 'EGW-2026-00001253', method: 'COD', amount: 560, status: 'Pending', date: 'Today' },
    { id: 'PAY-77014', reference: 'EGW-2026-00001252', method: 'Bank Transfer', amount: 2300, status: 'Failed', date: 'Yesterday' },
  ];

  const refunds = [
    { id: 'REF-6601', reference: 'EGW-2026-00001247', customer: 'Nimal Silva', amount: 980, reason: 'Delivery failed - customer refused', status: 'Pending', date: 'Today' },
    { id: 'REF-6602', reference: 'EGW-2026-00001252', customer: 'Dinuka Senanayake', amount: 2300, reason: 'Return to origin', status: 'Pending', date: 'Yesterday' },
    { id: 'REF-6603', reference: 'EGW-2026-00001251', customer: 'Achini Rathnayake', amount: 300, reason: 'Overcharged delivery fee', status: 'Approved', date: '3 days ago' },
  ];

  const users = [
    { id: 'USR-001', name: 'Admin User', email: 'admin@egotechworld.com', role: 'admin', branch: 'Colombo Central', status: 'Active', lastLogin: 'Today, 08:12 AM' },
    { id: 'USR-002', name: 'Fathima Rizwan', email: 'finance@egotechworld.com', role: 'finance', branch: 'Colombo Central', status: 'Active', lastLogin: 'Today, 07:40 AM' },
    { id: 'USR-003', name: 'Dilshan Karunaratne', email: 'dispatcher@egotechworld.com', role: 'dispatcher', branch: 'Colombo Central', status: 'Active', lastLogin: 'Today, 06:55 AM' },
    { id: 'USR-004', name: 'Hiruni Jayasuriya', email: 'hiruni@egotechworld.com', role: 'finance', branch: 'Kandy Hub', status: 'Active', lastLogin: 'Yesterday, 5:10 PM' },
    { id: 'USR-005', name: 'Malith Weerasinghe', email: 'malith@egotechworld.com', role: 'dispatcher', branch: 'Galle Branch', status: 'Suspended', lastLogin: '3 days ago' },
  ];

  const auditLogs = [
    { id: 'AUD-9001', user: 'admin@egotechworld.com', action: 'User created', detail: 'Created user Hiruni Jayasuriya (finance)', timestamp: friendlyTime() },
    { id: 'AUD-9002', user: 'dispatcher@egotechworld.com', action: 'Driver assigned', detail: 'Assigned Amila Fernando to EGW-2026-00001245', timestamp: friendlyTime() },
    { id: 'AUD-9003', user: 'finance@egotechworld.com', action: 'Settlement cleared', detail: 'Cleared SET-4402 for Urban Mart', timestamp: friendlyTime() },
  ];

  const vehicles = [
    { id: 'VEH-01', registrationNumber: 'LK-1738', type: 'Motorbike', model: 'Honda Dio', capacity: '20 kg', fuelType: 'Petrol', mileage: 18420, insuranceExpiry: '15 Dec 2026', status: 'Active', driver: 'Kasun Jayawardena' },
    { id: 'VEH-02', registrationNumber: 'LK-2290', type: 'Three-wheeler', model: 'Bajaj RE', capacity: '150 kg', fuelType: 'Petrol', mileage: 42100, insuranceExpiry: '02 Nov 2026', status: 'Active', driver: 'Amila Fernando' },
    { id: 'VEH-03', registrationNumber: 'LK-3391', type: 'Van', model: 'Toyota HiAce', capacity: '900 kg', fuelType: 'Diesel', mileage: 88250, insuranceExpiry: '20 Sep 2026', status: 'Active', driver: 'Nimal Bandara' },
    { id: 'VEH-04', registrationNumber: 'LK-4471', type: 'Motorbike', model: 'TVS XL100', capacity: '20 kg', fuelType: 'Petrol', mileage: 25640, insuranceExpiry: '30 Sep 2026', status: 'Maintenance', driver: 'Sajini Kumari' },
    { id: 'VEH-05', registrationNumber: 'LK-5521', type: 'Three-wheeler', model: 'Bajaj RE', capacity: '150 kg', fuelType: 'Petrol', mileage: 51900, insuranceExpiry: '11 Jan 2027', status: 'Active', driver: 'Roshan Perera' },
  ];

  const manifests = [
    { id: 'MF-7001', originBranch: 'Colombo Central', destinationBranch: 'Kandy Hub', vehicle: 'LK-3391', driver: 'Nimal Bandara', shipmentIds: ['EGW-2026-00001250'], status: 'In Transit', createdAt: friendlyTime() },
  ];

  const pricingRules = [
    { id: 'PR-01', label: '0 - 1 kg', minWeight: 0, maxWeight: 1, price: 350, serviceType: 'Standard' },
    { id: 'PR-02', label: '1 - 2 kg', minWeight: 1, maxWeight: 2, price: 450, serviceType: 'Standard' },
    { id: 'PR-03', label: '2 - 5 kg', minWeight: 2, maxWeight: 5, price: 650, serviceType: 'Standard' },
    { id: 'PR-04', label: '5 - 10 kg', minWeight: 5, maxWeight: 10, price: 900, serviceType: 'Standard' },
    { id: 'PR-05', label: '0 - 2 kg', minWeight: 0, maxWeight: 2, price: 750, serviceType: 'Express' },
    { id: 'PR-06', label: '0 - 2 kg', minWeight: 0, maxWeight: 2, price: 950, serviceType: 'Same-Day' },
  ];

  const zones = [
    { id: 'ZN-01', name: 'Zone A - Colombo Central', province: 'Western', serviceability: 'SERVICEABLE', status: 'Active' },
    { id: 'ZN-02', name: 'Zone B - Greater Colombo', province: 'Western', serviceability: 'SERVICEABLE', status: 'Active' },
    { id: 'ZN-03', name: 'Zone C - Kandy / Central', province: 'Central', serviceability: 'SERVICEABLE', status: 'Active' },
    { id: 'ZN-04', name: 'Zone D - Galle / Southern', province: 'Southern', serviceability: 'SERVICEABLE', status: 'Active' },
    { id: 'ZN-05', name: 'Zone E - Jaffna / Northern', province: 'Northern', serviceability: 'LIMITED SERVICE', status: 'Active' },
    { id: 'ZN-06', name: 'Zone F - Remote areas', province: 'Various', serviceability: 'PICKUP ONLY', status: 'Inactive' },
  ];

  const notificationTemplates = [
    { id: 'NT-01', name: 'Shipment created', channel: 'SMS', trigger: 'shipment.created', body: 'Dear {{customer_name}}, your shipment {{tracking_number}} has been created and will be picked up soon.' },
    { id: 'NT-02', name: 'Out for delivery', channel: 'SMS', trigger: 'shipment.out_for_delivery', body: 'Dear {{customer_name}}, your shipment {{tracking_number}} is out for delivery with {{courier_name}}. Expected by {{delivery_date}}.' },
    { id: 'NT-03', name: 'Delivered', channel: 'Email', trigger: 'shipment.delivered', body: 'Dear {{customer_name}}, your shipment {{tracking_number}} has been delivered. Thank you for using EgoTECHWORLD.' },
    { id: 'NT-04', name: 'Delivery failed', channel: 'SMS', trigger: 'shipment.failed', body: 'Dear {{customer_name}}, we were unable to deliver shipment {{tracking_number}}. We will retry shortly.' },
  ];

  const supportTickets = [
    { id: 'TKT-5501', customer: 'Nimal Silva', reference: 'EGW-2026-00001247', category: 'Late delivery', priority: 'High', status: 'OPEN', createdAt: '2 hours ago' },
    { id: 'TKT-5502', customer: 'Dinuka Senanayake', reference: 'EGW-2026-00001252', category: 'Return status', priority: 'Medium', status: 'IN_PROGRESS', createdAt: 'Yesterday' },
    { id: 'TKT-5503', customer: 'Achini Rathnayake', reference: 'EGW-2026-00001251', category: 'Billing question', priority: 'Low', status: 'RESOLVED', createdAt: '3 days ago' },
  ];

  const complaints = [
    { id: 'CMP-3301', reference: 'EGW-2026-00001247', customer: 'Nimal Silva', category: 'Late delivery', description: 'Package arrived two days after the promised window.', status: 'OPEN', createdAt: 'Today' },
    { id: 'CMP-3302', reference: 'EGW-2026-00001252', customer: 'Dinuka Senanayake', category: 'Wrong delivery', description: 'Recipient reported package sent to old address.', status: 'INVESTIGATING', createdAt: 'Yesterday' },
    { id: 'CMP-3303', reference: 'EGW-2026-00001246', customer: 'Pasan Perera', category: 'Driver behavior', description: 'Driver was reported as rude during delivery.', status: 'RESOLVED', createdAt: '4 days ago' },
  ];

  const podRecords = [];
  const ratings = [
    { id: 'RTG-01', shipmentId: 'SH-1002', driverId: 'DRV-01', stars: 5, comment: 'Delivered right on time, very courteous.', createdAt: 'Yesterday' },
    { id: 'RTG-02', shipmentId: 'SH-1007', driverId: 'DRV-03', stars: 4, comment: 'Good service overall.', createdAt: '3 days ago' },
  ];

  const notificationsOutbox = [];

  const apiKeys = [
    { id: 'KEY-01', label: 'Urban Mart - production', keyMasked: 'egw_live_••••••••kL9x', keyFull: 'egw_live_7f3ac9de0b8e4c1a9f2dkL9x', status: 'Active', createdAt: '12 Aug 2026' },
  ];

  const webhooks = [
    { id: 'WH-01', url: 'https://urbanmart.example.com/webhooks/egotechworld', events: ['shipment.created', 'shipment.delivered'], status: 'Active', lastDelivery: null },
  ];

  const organizations = [
    { id: 'ORG-001', name: 'EgoTECHWORLD Logistics', plan: 'Professional', branches: 4, drivers: 5, status: 'Active' },
    { id: 'ORG-002', name: 'QuickShip Lanka (Pty)', plan: 'Starter', branches: 1, drivers: 2, status: 'Trial' },
  ];

  const subscriptionPlans = [
    { id: 'starter', name: 'Starter', price: 'Rs 9,900/mo', driverLimit: 5, features: ['Basic tracking', 'Up to 5 drivers', 'Email support'] },
    { id: 'professional', name: 'Professional', price: 'Rs 34,900/mo', driverLimit: 50, features: ['Unlimited drivers', 'Route optimization', 'Customer notifications', 'Priority support'] },
    { id: 'enterprise', name: 'Enterprise', price: 'Custom', driverLimit: 999999, features: ['Custom integrations', 'Dedicated API limits', 'Dedicated support', 'SLA guarantee'] },
  ];

  return { addresses, branches, drivers, shipments, settlements, driverReconciliation, invoices, payments, refunds, users, auditLogs, vehicles, manifests, pricingRules, zones, notificationTemplates, supportTickets, complaints, podRecords, ratings, notificationsOutbox, apiKeys, webhooks, organizations, subscriptionPlans };
}

/**
 * Merges what MongoDB returned with the expected shape, so a list that does
 * not exist on the server yet can never crash a page. A missing/omitted key
 * is treated as genuinely empty - NEVER replaced with the demo seed data.
 *
 * This used to fall back to the seed for a missing key, on the theory that
 * "missing" only ever meant "the server predates this collection." That is
 * no longer true: the backend now scopes GET /api/app-data per role
 * (merchant/driver/customer only ever get their own data - see
 * backend/utils/roleScope.js), which means most of the 25 keys are
 * legitimately absent from a non-staff response. Falling back to the seed
 * here would silently show that role fabricated demo records for every
 * list scoped away from them - exactly the "frontend displays fake data"
 * outcome this store's whole design is meant to avoid. A brand-new,
 * genuinely empty database is handled separately by the caller (see the
 * `isEmpty` check in loadFromServer, driven by the server's own
 * system-wide `empty` flag, not by inspecting individual keys here).
 */
function mergeWithShape(remote) {
  const base = seedData();
  const merged = {};
  for (const key of Object.keys(base)) {
    merged[key] = Array.isArray(remote?.[key]) ? remote[key] : [];
  }
  return merged;
}

// The mirror is stored per user. Data is role-scoped on the server, so one
// shared copy would let the next person to sign in on this browser see the
// previous person's records while their own data is still loading.
function backupKey(userId) {
  return `${STORE_BACKUP_KEY}:${userId}`;
}

function readBackup(userId) {
  if (typeof window === 'undefined' || !userId) return null;
  try {
    const raw = window.localStorage.getItem(backupKey(userId));
    return raw ? mergeWithShape(JSON.parse(raw)) : null;
  } catch (error) {
    return null;
  }
}

function writeBackup(data, userId) {
  if (typeof window === 'undefined' || !userId || !data) return;
  try {
    window.localStorage.setItem(backupKey(userId), JSON.stringify(data));
  } catch (error) {
    // storage may be full or unavailable - MongoDB is the real store
  }
}

/**
 * The lists in `snapshot` whose content differs from what was last confirmed
 * saved, as a payload holding only those keys. `lastByKey` maps each key to
 * the JSON of the value the server last accepted for it.
 *
 * A save carrying all 25 lists made the server rewrite all 25 collections
 * however small the edit, which is the bulk of what a save costs against a
 * remote database. Nothing is lost by sending less: a key left out is simply
 * not touched by that save (saveAppData skips keys the request does not
 * carry), and any key that is still unsaved - including after a failed
 * request, since `lastByKey` only advances on success - is still different
 * here and goes out with the next one.
 */
function changedLists(snapshot, lastByKey) {
  const payload = {};
  if (!snapshot) return payload;
  for (const [key, list] of Object.entries(snapshot)) {
    if (!Array.isArray(list)) continue;
    if (JSON.stringify(list) !== lastByKey[key]) payload[key] = list;
  }
  return payload;
}

/** Records an entire snapshot as saved, for `changedLists` to diff against. */
function markAllSaved(snapshot) {
  const byKey = {};
  if (!snapshot) return byKey;
  for (const [key, list] of Object.entries(snapshot)) {
    if (Array.isArray(list)) byKey[key] = JSON.stringify(list);
  }
  return byKey;
}

function nextId(prefix, list) {
  const nums = list.map((item) => parseInt(String(item.id).replace(/[^0-9]/g, ''), 10)).filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 1000;
  // The random suffix matters now that some lists (shipments, apiKeys,
  // addresses, support tickets, complaints, ratings) are loaded role-scoped
  // from the server - a merchant or customer only ever sees their OWN rows,
  // so "the next number" computed from `list` is only ever a guess at the
  // true global max, not a fact. Two different merchants creating a record
  // at the same time could otherwise land on the exact same id and
  // silently overwrite each other's document in MongoDB (ids are unique
  // per collection). The suffix makes that collision practically
  // impossible without needing a server round-trip before the id can be
  // used (e.g. to navigate to the new shipment immediately after creating it).
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${prefix}-${max + 1}-${suffix}`;
}

// Tracks the last seed nextTrackingNumber() handed out, so a tight
// synchronous loop (BulkUploadPage.jsx creates every CSV row's shipment via
// one `rows.forEach(row => createShipment(...))`, with no `await` between
// iterations) can never see Date.now() return the same millisecond twice in
// a row and hand out a duplicate. The backend now rejects the entire save
// if any two shipments in it share a tracking number (see
// validators/shipmentDataValidator.js), so a real collision here would not
// just be a cosmetic duplicate - it would make an entire bulk upload fail
// to persist while the UI had already optimistically shown it as created.
let lastTrackingSeed = 0;
function nextTrackingNumber() {
  // Used to be "highest visible tracking number + 1", but a role-scoped
  // shipments list (a merchant now only ever sees their own shipments)
  // makes "the highest number I can see" meaningless as a global sequence -
  // two different merchants creating a shipment around the same time could
  // otherwise be handed the exact same tracking number. That number is the
  // public, customer-facing lookup key, so a collision must never happen.
  // Seeding from Date.now() keeps it unique system-wide across different
  // sessions without needing visibility into every other merchant's
  // shipments; forcing the seed to strictly increase on top of that keeps
  // it unique within THIS session even when called faster than the clock
  // advances.
  lastTrackingSeed = Math.max(Date.now(), lastTrackingSeed + 1);
  const unique = lastTrackingSeed % 100000000;
  return `EGW-2026-${String(unique).padStart(8, '0')}`;
}

/**
 * The courier's own fee, charged to the merchant, expressed as a share of the
 * COD it handled for them. COD itself is the customer's money passing
 * through - this is the only part the courier actually earns, and it is what
 * merchant invoices bill for. One constant so the rate can be changed in a
 * single place.
 */
const COURIER_FEE_RATE = 0.05;

/**
 * A completed COD delivery is a financial event, and these are the records it
 * produces. Each one is added only if it is missing, matched on the
 * shipment's tracking number, which is what makes every function here safe to
 * call repeatedly - from the delivery paths as they happen, and from the
 * backfill on load for deliveries that happened before any of this existed.
 *
 *   - a merchant settlement - money now owed to whoever sent the parcel.
 *     `collected` starts at 0 because the cash is still in the driver's
 *     pocket; it only becomes collected once finance reconciles it.
 *   - a driver reconciliation entry - cash that driver is holding and has to
 *     hand in. One entry per driver per day, so a driver finishing six COD
 *     deliveries owes one summed amount rather than six separate rows.
 *   - a payment - the customer's side of the same event, which is what makes
 *     the money show up as received rather than only as a debt.
 */
function bookCodSettlement(current, shipment, cod, reference) {
  if (current.settlements.some((s) => s.reference === reference)) return current;

  const settlement = {
    id: nextId('SET', current.settlements),
    merchant: shipment.senderName || 'Unknown sender',
    reference,
    due: friendlyDate(),
    expected: cod,
    collected: 0,
    status: 'Pending',
  };

  let driverReconciliation = current.driverReconciliation;
  const driver = current.drivers.find((d) => d.id === shipment.driverId);
  if (driver) {
    const key = todayKey();
    const openEntry = driverReconciliation.find((r) => r.driver === driver.name && r.dateKey === key);
    driverReconciliation = openEntry
      ? driverReconciliation.map((r) => (r === openEntry ? { ...r, expected: (Number(r.expected) || 0) + cod } : r))
      : [{
        id: nextId('REC', driverReconciliation),
        driver: driver.name,
        date: friendlyDate(),
        dateKey: key,
        expected: cod,
        collected: 0,
        status: 'Pending',
      }, ...driverReconciliation];
  }

  return { ...current, settlements: [settlement, ...current.settlements], driverReconciliation };
}

function bookCodPayment(current, shipment, cod, reference) {
  if (current.payments.some((p) => p.reference === reference && p.method === 'COD')) return current;
  return {
    ...current,
    payments: [{
      id: nextId('PAY', current.payments),
      reference,
      method: 'COD',
      amount: cod,
      status: 'Completed',
      date: friendlyDate(),
    }, ...current.payments],
  };
}

/**
 * A parcel the courier lost or damaged is money it owes the customer, so it
 * raises a refund for finance to approve or reject. Only these two outcomes
 * do: a failed or returned delivery moves no money at all under COD - the
 * customer never paid - so raising a refund for one would overstate what is
 * owed.
 */
function bookLossRefund(current, shipment, reference) {
  if (current.refunds.some((r) => r.reference === reference)) return current;
  const amount = Number(shipment.codAmount) || 0;
  if (amount <= 0) return current;
  return {
    ...current,
    refunds: [{
      id: nextId('REF', current.refunds),
      reference,
      customer: shipment.recipientName || 'Unknown recipient',
      amount,
      reason: shipment.status === 'LOST' ? 'Parcel lost in transit' : 'Parcel damaged in transit',
      status: 'Pending',
      date: friendlyDate(),
    }, ...current.refunds],
  };
}

/**
 * Rebuilds the merchant invoices for the courier fee (COURIER_FEE_RATE above),
 * one per merchant per calendar month of delivered COD.
 *
 * Recomputed rather than only appended to, so a second delivery in the same
 * month raises that month's bill instead of creating a duplicate invoice. An
 * invoice already marked Paid is never touched - money that has changed hands
 * must not be rewritten underneath finance.
 */
function rebuildInvoices(current) {
  const codByMerchantMonth = new Map();
  for (const shipment of current.shipments || []) {
    if (shipment?.status !== 'DELIVERED') continue;
    const cod = Number(shipment.codAmount) || 0;
    if (cod <= 0) continue;
    const key = `${shipment.senderName || 'Unknown sender'}|${monthKey(shipment.createdAt)}`;
    codByMerchantMonth.set(key, (codByMerchantMonth.get(key) || 0) + cod);
  }

  let invoices = current.invoices;
  for (const [key, codTotal] of codByMerchantMonth) {
    const separator = key.lastIndexOf('|');
    const merchant = key.slice(0, separator);
    const period = key.slice(separator + 1);
    const amount = Math.round(codTotal * COURIER_FEE_RATE);
    const existing = invoices.find((inv) => inv.merchant === merchant && inv.period === period);

    if (!existing) {
      const start = new Date(`${period}-01T00:00:00Z`);
      const due = new Date(start);
      due.setUTCDate(due.getUTCDate() + 7);
      invoices = [{
        id: nextId('INV', invoices),
        merchant,
        period,
        amount,
        date: friendlyDate(start),
        dueDate: friendlyDate(due),
        status: 'Unpaid',
      }, ...invoices];
    } else if (existing.status !== 'Paid' && existing.amount !== amount) {
      invoices = invoices.map((inv) => (inv === existing ? { ...inv, amount } : inv));
    }
  }

  return invoices === current.invoices ? current : { ...current, invoices };
}

/** Every finance record one shipment owes, in its current state. */
function bookFinanceForShipment(current, shipment) {
  const reference = shipment?.trackingNumber;
  if (!reference) return current;

  let next = current;
  const cod = Number(shipment.codAmount) || 0;

  if (shipment.status === 'DELIVERED' && cod > 0) {
    next = bookCodSettlement(next, shipment, cod, reference);
    next = bookCodPayment(next, shipment, cod, reference);
  }
  if (shipment.status === 'LOST' || shipment.status === 'DAMAGED') {
    next = bookLossRefund(next, shipment, reference);
  }
  return rebuildInvoices(next);
}

/**
 * Books every shipment that reached a financial outcome before these rules
 * existed. Without it the dashboard would stay at Rs 0 until the next
 * delivery, while money genuinely collected stayed invisible. Idempotent, so
 * running it on every load only ever fills in what is missing.
 */
function backfillFinanceRecords(data) {
  let next = data;
  for (const shipment of data.shipments || []) {
    next = bookFinanceForShipment(next, shipment);
  }
  return next;
}

// Same keys as seedData(), all empty. Used only while signed out, so pages
// rendered without a session (login, public tracking, forgot/reset
// password) get a defined-but-inert store instead of a null one, without
// ever calling the now-authenticated /api/app-data.
function emptyShape() {
  const base = seedData();
  const empty = {};
  for (const key of Object.keys(base)) empty[key] = [];
  return empty;
}

export function StoreProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  // Never null: a reload renders straight away from this user's cached copy
  // (or an empty shape on a cold cache) and loadFromServer() swaps in the real
  // data once MongoDB answers, instead of blocking the whole app on a spinner.
  const [data, setData] = useState(() => (isAuthenticated ? (readBackup(user?.id) || emptyShape()) : emptyShape()));
  const [storeStatus, setStoreStatus] = useState(isAuthenticated ? 'loading' : 'ready'); // loading | ready | offline
  const [saveState, setSaveState] = useState('idle');        // idle | saving | saved | error
  const [storeError, setStoreError] = useState('');

  const latestRef = useRef(null);
  const lastSavedRef = useRef('');
  // Per-list JSON of what the server last accepted, so a save can send only
  // the lists that actually changed. See changedLists() above.
  const lastSavedByKeyRef = useRef({});
  const saveTimerRef = useRef(null);
  // Server time this snapshot was read, refreshed after every successful
  // save. Sent back with each save so the server can keep records this
  // session is too old to speak for - see reconcileShipmentWrite() in
  // backend/controllers/appDataController.js. Without it, saving a snapshot
  // loaded minutes ago reverted other people's shipment status changes.
  const asOfRef = useRef('');
  const userIdRef = useRef(user?.id);
  userIdRef.current = user?.id;
  const userRoleRef = useRef(user?.role);
  userRoleRef.current = user?.role;
  const storeStatusRef = useRef(storeStatus);
  storeStatusRef.current = storeStatus;

  /**
   * Loads every list from MongoDB (GET /api/app-data). On a completely empty
   * database the demo seed is written up to the server once, so the very
   * first run still has data to show - and that data now lives in MongoDB.
   */
  const loadFromServer = useCallback(async () => {
    setStoreStatus('loading');
    setStoreError('');
    try {
      const response = await appDataApi.getAll();
      asOfRef.current = response?.asOf || '';
      const remote = response?.data || {};
      const isEmpty = response?.empty === true
        || Object.keys(remote).length === 0
        || Object.values(remote).every((list) => !Array.isArray(list) || list.length === 0);

      // On a completely empty database the seed is what gets shown AND what
      // gets written up; otherwise show exactly what the server returned.
      const next = isEmpty ? seedData() : mergeWithShape(remote);

      // Deliveries completed before COD was booked automatically still need
      // their settlement and reconciliation records. Only admin and finance
      // do this: they are the only roles the server accepts settlement and
      // reconciliation writes from (FINANCE_WRITE_KEYS in
      // backend/controllers/appDataController.js), and they are the only
      // roles given the full, unscoped shipments list to work them out from.
      // Anyone else would compute records from their own narrow slice of the
      // data, show them on screen, and have every one of them refused.
      const canBookCod = ['admin', 'finance'].includes(String(userRoleRef.current || '').toLowerCase());
      const booked = canBookCod ? backfillFinanceRecords(next) : next;

      // Recorded as the server's state, NOT as `booked` - anything the
      // backfill just added is genuinely unsaved, so leaving it out here is
      // what makes the normal debounced save pick it up and persist it.
      lastSavedRef.current = JSON.stringify(next);
      lastSavedByKeyRef.current = markAllSaved(next);
      latestRef.current = booked;
      writeBackup(booked, userIdRef.current);
      setData(booked);
      setStoreStatus('ready');
      setSaveState('saved');

      // Seeding is the ONLY reason to write on load - it is the one case
      // where the server does not already hold this data.
      //
      // Every load used to also save the snapshot straight back, to populate
      // legacy/domain collections added after the cms_* ones existed. That is
      // a full 25-collection rewrite of data the server had just handed over,
      // and against a remote Atlas cluster (~186ms per round trip, measured)
      // it regularly ran past the client's 20s request timeout - which is
      // what put "Not connected to the database" on screen after a reload.
      // Only `users` is still mirrored (LEGACY_COLLECTIONS in
      // backend/models/appData.js) and every real edit to that list already
      // goes through the normal debounced save below, so nothing needs the
      // rewrite to happen on load.
      if (isEmpty) {
        const seeded = await appDataApi.saveAll(next, asOfRef.current);
        if (seeded?.savedAt) asOfRef.current = seeded.savedAt;
      }
    } catch (error) {
      // Backend unreachable: keep the app usable from the local mirror and
      // show a banner instead of a blank screen.
      const fallback = readBackup(userIdRef.current) || seedData();
      latestRef.current = fallback;
      // Nothing is known to be on the server, so the next successful save
      // sends every list rather than a diff against a stale record.
      lastSavedRef.current = '';
      lastSavedByKeyRef.current = {};
      setData(fallback);
      setStoreStatus('offline');
      setStoreError(error?.message || 'Could not reach the server');
    }
  }, []);

  // /api/app-data now requires a signed-in session (see backend/routes/
  // appDataRoutes.js), so it must never be called while signed out. Pages
  // that render without a session - /login, /track, /forgot-password,
  // /reset-password - don't read from this store at all, so an empty,
  // never-saved stub is enough to let them render without tripping the
  // "offline"/"not connected" banner with a misleading 401.
  useEffect(() => {
    if (!isAuthenticated) {
      window.clearTimeout(saveTimerRef.current);
      latestRef.current = null;
      lastSavedRef.current = '';
      lastSavedByKeyRef.current = {};
      setData(emptyShape());
      setStoreStatus('ready');
      setSaveState('idle');
      setStoreError('');
      return undefined;
    }
    loadFromServer();
    return undefined;
  }, [isAuthenticated, loadFromServer]);

  // Any change made anywhere in the app is written to MongoDB.
  useEffect(() => {
    if (!data) return undefined;
    if (!isAuthenticated) return undefined;
    latestRef.current = data;
    // Not while loading: `data` is still the cached/empty placeholder then,
    // and writing an empty shape would wipe the cache the next reload needs.
    if (storeStatus !== 'loading') writeBackup(data, userIdRef.current);

    const serialised = JSON.stringify(data);
    if (serialised === lastSavedRef.current) return undefined;
    if (storeStatus === 'loading') return undefined;

    setSaveState('saving');
    window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(async () => {
      // Only the lists that actually changed are sent. Every save used to
      // carry all 25 lists, so editing one shipment rewrote all 25
      // collections - 25 bulk writes against a remote Atlas cluster for one
      // changed row. The server already handles a partial payload: it walks
      // its own key list and skips any key the request does not carry (see
      // saveAppData in backend/controllers/appDataController.js).
      // Pinned before the request so that a change made while it is in flight
      // is never mistakenly marked as saved - it stays different from what
      // was sent, so the next save picks it up.
      const snapshot = latestRef.current;
      const payload = changedLists(snapshot, lastSavedByKeyRef.current);
      const sentKeys = Object.keys(payload);
      if (sentKeys.length === 0) {
        lastSavedRef.current = JSON.stringify(snapshot);
        setSaveState('saved');
        return;
      }
      try {
        const response = await appDataApi.saveAll(payload, asOfRef.current);
        // Only the keys actually sent are marked saved.
        sentKeys.forEach((key) => {
          lastSavedByKeyRef.current[key] = JSON.stringify(payload[key]);
        });
        lastSavedRef.current = JSON.stringify(snapshot);
        if (response?.savedAt) asOfRef.current = response.savedAt;
        setSaveState('saved');
        setStoreError('');
        if (storeStatus === 'offline') setStoreStatus('ready');
        // The server kept its own, newer copy of one or more shipments
        // because this screen had gone stale (someone else moved them on
        // while it sat open). Pull the real state in so the lists show what
        // actually happened instead of what this tab still believed.
        if (Array.isArray(response?.stale) && response.stale.length > 0) {
          loadFromServer();
        }
      } catch (error) {
        // 409 = the server refused the change because this screen was out of
        // date (e.g. the chosen driver has gone offline). Show why, then load
        // fresh data so the refused change is undone and the lists update.
        if (error?.status === 409) {
          toast.error(error.message || 'This change is out of date. Reloading the latest data.', { id: 'store-conflict' });
          loadFromServer();
          return;
        }
        setSaveState('error');
        setStoreStatus('offline');
        setStoreError(error?.message || 'Could not save to the server');
      }
    }, SAVE_DEBOUNCE_MS);

    return () => window.clearTimeout(saveTimerRef.current);
  }, [data, storeStatus, isAuthenticated]);

  // Writes anything still queued before the tab closes.
  useEffect(() => {
    const flush = () => {
      // lastSavedRef is only '' before the first server load (or when offline
      // with nothing saved); latestRef is then just the cached/empty placeholder.
      if (!lastSavedRef.current && storeStatusRef.current === 'loading') return;
      if (JSON.stringify(latestRef.current) === lastSavedRef.current) return;
      writeBackup(latestRef.current, userIdRef.current);
    };
    window.addEventListener('beforeunload', flush);
    return () => window.removeEventListener('beforeunload', flush);
  }, []);

  const reloadStore = useCallback(() => loadFromServer(), [loadFromServer]);

  const logAction = useCallback((action, detail) => {
    setData((current) => ({
      ...current,
      auditLogs: [
        { id: nextId('AUD', current.auditLogs), user: user?.email || 'system', action, detail, timestamp: friendlyTime() },
        ...current.auditLogs,
      ].slice(0, 100),
    }));
  }, [user]);

  // Persists a real, event-triggered notification record (this part was
  // always real - see appDataController.js, cms_notifications_outbox is one
  // of the 25 authoritative MongoDB collections), then fires a best-effort,
  // non-blocking attempt at REAL external delivery through whichever
  // SMS/Email/WhatsApp provider is configured via environment variables
  // (services/notificationDispatcher.js, wired to the genuine Twilio/MSG91/
  // TextLocal/SMTP/Meta integrations that already existed in this codebase).
  // No provider is configured in this environment, so that attempt honestly
  // resolves to "Not configured" rather than a fabricated delivery - this
  // never blocks or fails shipment creation/status updates either way.
  const pushNotification = useCallback((trigger, to, variables = {}) => {
    let entry = null;
    setData((current) => {
      const template = current.notificationTemplates.find((t) => t.trigger === trigger);
      if (!template) return current;
      const body = template.body.replace(/{{\s*(\w+)\s*}}/g, (match, key) => (variables[key] !== undefined ? variables[key] : match));
      entry = {
        id: nextId('OUT', current.notificationsOutbox),
        channel: template.channel,
        to,
        trigger,
        templateName: template.name,
        body,
        status: 'Sent',
        createdAt: friendlyTime(),
      };
      return { ...current, notificationsOutbox: [entry, ...current.notificationsOutbox].slice(0, 200) };
    });
    if (entry) {
      // Fire-and-forget: the outbox entry only exists in local state until
      // the next debounced save reaches MongoDB, so this waits a moment
      // before asking the backend to dispatch it by id - a dispatch attempt
      // against an id MongoDB doesn't have yet would just 404 harmlessly,
      // but waiting avoids that noise.
      const entryId = entry.id;
      window.setTimeout(() => { appDataApi.dispatchNotification(entryId).catch(() => {}); }, 1200);
    }
  }, []);

  const createShipment = useCallback((input) => {
    let created = null;
    setData((current) => {
      const trackingNumber = nextTrackingNumber();
      created = {
        id: nextId('SH', current.shipments),
        trackingNumber,
        senderName: input.senderName || '',
        senderPhone: input.senderPhone || '',
        senderAddress: input.senderAddress || '',
        recipientName: input.recipientName || '',
        recipientPhone: input.recipientPhone || '',
        recipientAddress: input.recipientAddress || '',
        recipientCity: input.recipientCity || '',
        branch: input.branch || current.branches[0]?.name || '',
        serviceType: input.serviceType || 'Standard',
        weight: Number(input.weight) || 0,
        codAmount: Number(input.codAmount) || 0,
        status: 'CREATED',
        driverId: null,
        createdAt: nowISO(),
        history: [{ label: 'Shipment created', time: friendlyTime() }],
      };
      return { ...current, shipments: [created, ...current.shipments] };
    });
    logAction('Shipment created', `New shipment for ${input.recipientName || 'recipient'} to ${input.recipientCity || ''}`);
    if (created) {
      pushNotification('shipment.created', created.recipientPhone || created.recipientName, {
        customer_name: created.recipientName,
        tracking_number: created.trackingNumber,
      });
    }
    return created;
  }, [logAction, pushNotification]);

  const STATUS_TRIGGERS = {
    OUT_FOR_DELIVERY: 'shipment.out_for_delivery',
    DELIVERED: 'shipment.delivered',
    DELIVERY_FAILED: 'shipment.failed',
  };

  const updateShipmentStatus = useCallback((shipmentId, status, note) => {
    let targetShipment = null;
    setData((current) => {
      const shipments = current.shipments.map((shipment) => {
        if (shipment.id !== shipmentId) return shipment;
        // A DELIVERED shipment keeps the driver who delivered it. Clearing
        // it here erased the only record of who did the job: the delivery
        // then showed as "Unassigned" on every staff screen, and - because
        // the server scopes a driver to shipments carrying their own id
        // (scopeSnapshotForRead in backend/utils/roleScope.js) - it vanished
        // from the driver's own portal the moment they completed it. The
        // driver is still released back to Available below, which depends on
        // the shipment's STATUS, not on wiping its driverId.
        const releaseDriver = ['DELIVERY_FAILED', 'RTO', 'CANCELLED', 'DAMAGED', 'LOST'].includes(status);
        targetShipment = shipment;
        return {
          ...shipment,
          status,
          driverId: releaseDriver ? null : shipment.driverId,
          history: [...shipment.history, { label: note || `Status updated to ${status}`, time: friendlyTime() }],
        };
      });
      const changed = current.shipments.find((s) => s.id === shipmentId);
      let drivers = current.drivers;
      // A driver can legitimately be working several shipments at once
      // (e.g. Shipments 1-6 all assigned to the same driver) - completing
      // ONE of them must only release the driver back to 'Available' once
      // NONE of their other shipments are still OUT_FOR_DELIVERY. `shipments`
      // above already reflects the just-applied update, and the one just
      // finished no longer has status OUT_FOR_DELIVERY, so it is excluded by
      // the status test regardless of whether it kept its driverId.
      if (changed && changed.driverId && ['DELIVERED', 'DELIVERY_FAILED', 'RTO', 'CANCELLED', 'DAMAGED', 'LOST'].includes(status)) {
        const stillHasActiveWork = shipments.some((s) => s.driverId === changed.driverId && s.status === 'OUT_FOR_DELIVERY');
        if (!stillHasActiveWork) {
          drivers = current.drivers.map((driver) => (driver.id === changed.driverId && driver.status === 'Delivering' ? { ...driver, status: 'Available' } : driver));
        }
      }
      const next = { ...current, shipments, drivers };
      // Reaching DELIVERED, LOST or DAMAGED is a financial event, not just a
      // status change - see bookFinanceForShipment above.
      const updated = shipments.find((s) => s.id === shipmentId);
      return updated ? bookFinanceForShipment(next, updated) : next;
    });
    logAction('Shipment status updated', `${shipmentId} -> ${status}`);
    const trigger = STATUS_TRIGGERS[status];
    if (trigger && targetShipment) {
      pushNotification(trigger, targetShipment.recipientPhone || targetShipment.recipientName, {
        customer_name: targetShipment.recipientName,
        tracking_number: targetShipment.trackingNumber,
        courier_name: 'EgoTECHWORLD Courier',
        delivery_date: friendlyTime(),
      });
    }
  }, [logAction, pushNotification]);

  // Caches a real, backend-geocoded delivery point onto its shipment record
  // (driver/RouteViewPage.jsx calls this after a successful lookup via
  // api/geocodeApi.js) so the same address is never re-geocoded on every
  // page visit. Persists through the normal autosave like any other
  // shipment field edit - a driver already has write access to their own
  // assigned shipment's full record (see SCOPED_OWNERSHIP.shipments in
  // backend/utils/roleScope.js), so no new backend endpoint was needed for
  // this part.
  const setShipmentCoordinates = useCallback((shipmentId, coordinates) => {
    setData((current) => ({
      ...current,
      shipments: current.shipments.map((shipment) => (shipment.id === shipmentId ? { ...shipment, deliveryCoordinates: coordinates } : shipment)),
    }));
  }, []);

  const assignDriver = useCallback((shipmentId, driverId) => {
    setData((current) => {
      const shipments = current.shipments.map((shipment) => (shipment.id === shipmentId
        ? { ...shipment, driverId, status: 'OUT_FOR_DELIVERY', history: [...shipment.history, { label: 'Driver assigned - out for delivery', time: friendlyTime() }] }
        : shipment));
      const drivers = current.drivers.map((driver) => (driver.id === driverId ? { ...driver, status: 'Delivering' } : driver));
      return { ...current, shipments, drivers };
    });
    logAction('Driver assigned', `${driverId} assigned to ${shipmentId}`);
  }, [logAction]);

  const toggleDriverAvailability = useCallback((driverId) => {
    setData((current) => ({
      ...current,
      drivers: current.drivers.map((driver) => {
        if (driver.id !== driverId) return driver;
        if (driver.status === 'Delivering') return driver;
        return { ...driver, status: driver.status === 'Offline' ? 'Available' : 'Offline' };
      }),
    }));
  }, []);

  const addDriver = useCallback((input) => {
    setData((current) => ({
      ...current,
      drivers: [...current.drivers, {
        id: nextId('DRV', current.drivers),
        status: 'Offline',
        accountStatus: 'Active',
        todayDeliveries: 0,
        codCollectedToday: 0,
        ...input,
      }],
      vehicles: input.vehicle
        ? [...current.vehicles, { id: nextId('VEH', current.vehicles), registrationNumber: input.vehicle, type: input.vehicleType || 'Motorbike', model: input.vehicleModel || 'Not specified', capacity: input.vehicleCapacity || 'Not specified', fuelType: input.fuelType || 'Petrol', insuranceExpiry: input.insuranceExpiry || 'Not specified', status: 'Active', mileage: 0, driver: input.name }]
        : current.vehicles,
    }));
    logAction('Driver created', `Created driver ${input.name}`);
  }, [logAction]);

  const setDriverAccountStatus = useCallback((driverId, accountStatus) => {
    setData((current) => ({
      ...current,
      drivers: current.drivers.map((driver) => (driver.id === driverId ? { ...driver, accountStatus } : driver)),
    }));
    logAction('Driver account status changed', `${driverId} -> ${accountStatus}`);
  }, [logAction]);

  const removeDriver = useCallback((driverId) => {
    let removedVehicle = '';
    setData((current) => ({
      ...current,
      drivers: current.drivers.filter((driver) => {
        if (driver.id === driverId) removedVehicle = driver.vehicle;
        return driver.id !== driverId;
      }),
      vehicles: current.vehicles.map((vehicle) => (vehicle.registrationNumber === removedVehicle ? { ...vehicle, driver: '' } : vehicle)),
      shipments: current.shipments.map((shipment) => (shipment.driverId === driverId ? { ...shipment, driverId: null } : shipment)),
    }));
    logAction('Driver removed', driverId);
  }, [logAction]);

  const addUser = useCallback((input) => {
    setData((current) => ({
      ...current,
      users: [...current.users, { id: nextId('USR', current.users), status: 'Active', lastLogin: 'Never', ...input }],
    }));
    logAction('User created', `Created user ${input.name} (${input.role})`);
  }, [logAction]);

  const setUserStatus = useCallback((userId, status) => {
    setData((current) => ({
      ...current,
      users: current.users.map((u) => (u.id === userId ? { ...u, status } : u)),
    }));
    logAction('User status changed', `${userId} -> ${status}`);
  }, [logAction]);

  const removeUser = useCallback((userId) => {
    setData((current) => ({ ...current, users: current.users.filter((u) => u.id !== userId) }));
    logAction('User removed', userId);
  }, [logAction]);

  const addBranch = useCallback((input) => {
    setData((current) => ({
      ...current,
      branches: [...current.branches, { id: nextId('BR', current.branches), status: 'Active', ...input }],
    }));
    logAction('Branch created', input.name);
  }, [logAction]);

  const addAddress = useCallback((merchant, input) => {
    setData((current) => ({
      ...current,
      addresses: [...current.addresses, { id: nextId('ADDR', current.addresses), merchant, ...input }],
    }));
  }, []);

  const removeAddress = useCallback((addressId) => {
    setData((current) => ({
      ...current,
      addresses: current.addresses.filter((address) => address.id !== addressId),
    }));
  }, []);

  const toggleBranchStatus = useCallback((branchId) => {
    setData((current) => ({
      ...current,
      branches: current.branches.map((b) => (b.id === branchId ? { ...b, status: b.status === 'Active' ? 'Inactive' : 'Active' } : b)),
    }));
  }, []);

  const createSettlement = useCallback((input) => {
    setData((current) => ({
      ...current,
      settlements: [{ id: nextId('SET', current.settlements), status: 'Pending', collected: 0, ...input }, ...current.settlements],
    }));
    logAction('Settlement created', `${input.merchant} - ${input.reference}`);
  }, [logAction]);

  const markSettlementCleared = useCallback((settlementId) => {
    setData((current) => ({
      ...current,
      settlements: current.settlements.map((s) => (s.id === settlementId ? { ...s, collected: s.expected, status: 'Cleared' } : s)),
    }));
    logAction('Settlement cleared', settlementId);
  }, [logAction]);

  const markSettlementReview = useCallback((settlementId) => {
    setData((current) => ({
      ...current,
      settlements: current.settlements.map((s) => (s.id === settlementId ? { ...s, status: 'Review required' } : s)),
    }));
  }, []);

  const reconcileDriverEntry = useCallback((entryId, status) => {
    setData((current) => ({
      ...current,
      driverReconciliation: current.driverReconciliation.map((r) => (r.id === entryId ? { ...r, status } : r)),
    }));
    logAction('Driver reconciliation updated', `${entryId} -> ${status}`);
  }, [logAction]);

  const payInvoice = useCallback((invoiceId) => {
    setData((current) => ({
      ...current,
      invoices: current.invoices.map((inv) => (inv.id === invoiceId ? { ...inv, status: 'Paid' } : inv)),
    }));
    logAction('Invoice paid', invoiceId);
  }, [logAction]);

  /**
   * Raises a refund by hand from the Refunds page.
   *
   * Refunds appear on their own when a parcel is marked lost or damaged, but
   * that is an operations action: the buttons for it are admin/dispatcher
   * only, and the server refuses a shipments write from finance
   * (FINANCE_EXCLUDED_WRITE_KEYS in backend/controllers/appDataController.js).
   * Without this, a finance officer could approve or reject refunds but had
   * no way to raise one - so every other adjustment they legitimately deal
   * with (an overcharge, a goodwill credit, a part refund) had nowhere to go.
   */
  const addRefund = useCallback((input) => {
    setData((current) => ({
      ...current,
      refunds: [{
        id: nextId('REF', current.refunds),
        status: 'Pending',
        date: friendlyDate(),
        ...input,
      }, ...current.refunds],
    }));
    logAction('Refund raised', `${input.reference} - ${input.reason || 'no reason given'}`);
  }, [logAction]);

  const decideRefund = useCallback((refundId, decision) => {
    setData((current) => ({
      ...current,
      refunds: current.refunds.map((r) => (r.id === refundId ? { ...r, status: decision } : r)),
    }));
    logAction('Refund decision', `${refundId} -> ${decision}`);
  }, [logAction]);

  const reportDamage = useCallback((shipmentId, note) => {
    updateShipmentStatus(shipmentId, 'DAMAGED', note || 'Package reported damaged');
  }, [updateShipmentStatus]);

  const markLost = useCallback((shipmentId, note) => {
    updateShipmentStatus(shipmentId, 'LOST', note || 'Shipment reported missing - under investigation');
  }, [updateShipmentStatus]);

  const returnToOrigin = useCallback((shipmentId, reason) => {
    updateShipmentStatus(shipmentId, 'RTO', `Returned to origin - ${reason || 'maximum delivery attempts reached'}`);
  }, [updateShipmentStatus]);

  /**
   * Deletes a shipment outright. Same shape as removeDriver/removeVehicle
   * above: the record goes, and every other list that points at it is tidied
   * up in the same update so nothing is left referring to a shipment that no
   * longer exists - a manifest would otherwise keep counting it (manifests
   * reference shipments by trackingNumber, not id), and a rating or POD
   * record would be stranded against a missing shipment.
   *
   * Financial records (payments, settlements, refunds) are deliberately left
   * alone: they reference a shipment by tracking number but are their own
   * accounting history, not part of the shipment, so deleting a shipment
   * must not quietly erase money that was taken or owed.
   */
  const removeShipment = useCallback((shipmentId) => {
    let removed = null;
    setData((current) => {
      removed = current.shipments.find((s) => s.id === shipmentId) || null;
      if (!removed) return current;
      const trackingNumber = removed.trackingNumber;
      return {
        ...current,
        shipments: current.shipments.filter((s) => s.id !== shipmentId),
        manifests: current.manifests.map((manifest) => (
          Array.isArray(manifest.shipmentIds) && manifest.shipmentIds.includes(trackingNumber)
            ? { ...manifest, shipmentIds: manifest.shipmentIds.filter((t) => t !== trackingNumber) }
            : manifest
        )),
        ratings: current.ratings.filter((rating) => rating.shipmentId !== shipmentId),
        podRecords: current.podRecords.filter((record) => record.shipmentId !== shipmentId),
      };
    });
    logAction('Shipment deleted', removed?.trackingNumber || shipmentId);
  }, [logAction]);

  const addVehicle = useCallback((input) => {
    setData((current) => ({
      ...current,
      vehicles: [...current.vehicles, { id: nextId('VEH', current.vehicles), status: 'Active', mileage: 0, ...input }],
    }));
    logAction('Vehicle added', input.registrationNumber);
  }, [logAction]);

  const setVehicleStatus = useCallback((vehicleId, status) => {
    setData((current) => ({
      ...current,
      vehicles: current.vehicles.map((v) => (v.id === vehicleId ? { ...v, status } : v)),
    }));
    logAction('Vehicle status updated', `${vehicleId} -> ${status}`);
  }, [logAction]);

  const removeVehicle = useCallback((vehicleId) => {
    let registrationNumber = '';
    setData((current) => {
      const vehicle = current.vehicles.find((item) => item.id === vehicleId);
      registrationNumber = vehicle?.registrationNumber || '';
      return {
        ...current,
        vehicles: current.vehicles.filter((item) => item.id !== vehicleId),
        drivers: current.drivers.map((driver) => (driver.vehicle === registrationNumber ? { ...driver, vehicle: '', vehicleType: '', vehicleModel: '', vehicleCapacity: '', insuranceExpiry: '' } : driver)),
        manifests: current.manifests.map((manifest) => (manifest.vehicle === registrationNumber ? { ...manifest, vehicle: '' } : manifest)),
      };
    });
    logAction('Vehicle removed', registrationNumber || vehicleId);
  }, [logAction]);

  const createManifest = useCallback((input) => {
    setData((current) => ({
      ...current,
      manifests: [{ id: nextId('MF', current.manifests), status: 'Preparing', createdAt: friendlyTime(), ...input }, ...current.manifests],
    }));
    logAction('Manifest created', `${input.originBranch} -> ${input.destinationBranch}`);
  }, [logAction]);

  const advanceManifest = useCallback((manifestId, status) => {
    setData((current) => ({
      ...current,
      manifests: current.manifests.map((m) => (m.id === manifestId ? { ...m, status } : m)),
    }));
    logAction('Manifest status updated', `${manifestId} -> ${status}`);
  }, [logAction]);

  const addPricingRule = useCallback((input) => {
    setData((current) => ({
      ...current,
      pricingRules: [...current.pricingRules, { id: nextId('PR', current.pricingRules), ...input }],
    }));
    logAction('Pricing rule added', input.label);
  }, [logAction]);

  const addZone = useCallback((input) => {
    setData((current) => ({
      ...current,
      zones: [...current.zones, { id: nextId('ZN', current.zones), status: 'Active', serviceability: 'SERVICEABLE', ...input }],
    }));
    logAction('Zone added', input.name);
  }, [logAction]);

  const toggleZoneStatus = useCallback((zoneId) => {
    setData((current) => ({
      ...current,
      zones: current.zones.map((z) => (z.id === zoneId ? { ...z, status: z.status === 'Active' ? 'Inactive' : 'Active' } : z)),
    }));
  }, []);

  const updateNotificationTemplate = useCallback((templateId, body) => {
    setData((current) => ({
      ...current,
      notificationTemplates: current.notificationTemplates.map((t) => (t.id === templateId ? { ...t, body } : t)),
    }));
    logAction('Notification template updated', templateId);
  }, [logAction]);

  const setTicketStatus = useCallback((ticketId, status) => {
    setData((current) => ({
      ...current,
      supportTickets: current.supportTickets.map((t) => (t.id === ticketId ? { ...t, status } : t)),
    }));
    logAction('Support ticket updated', `${ticketId} -> ${status}`);
  }, [logAction]);

  const setComplaintStatus = useCallback((complaintId, status) => {
    setData((current) => ({
      ...current,
      complaints: current.complaints.map((c) => (c.id === complaintId ? { ...c, status } : c)),
    }));
    logAction('Complaint updated', `${complaintId} -> ${status}`);
  }, [logAction]);

  const addSupportTicket = useCallback((input) => {
    setData((current) => ({
      ...current,
      supportTickets: [{ id: nextId('TKT', current.supportTickets), status: 'OPEN', createdAt: friendlyTime(), ...input }, ...current.supportTickets],
    }));
    logAction('Support ticket created', input.subject || input.category || '');
  }, [logAction]);

  const addComplaint = useCallback((input) => {
    setData((current) => ({
      ...current,
      complaints: [{ id: nextId('CMP', current.complaints), status: 'OPEN', createdAt: friendlyTime(), ...input }, ...current.complaints],
    }));
    logAction('Complaint filed', input.category || '');
  }, [logAction]);

  const capturePOD = useCallback((shipmentId, pod) => {
    setData((current) => {
      const shipment = current.shipments.find((s) => s.id === shipmentId);
      const record = {
        id: nextId('POD', current.podRecords),
        shipmentId,
        signatureDataUrl: pod.signatureDataUrl || null,
        photoDataUrl: pod.photoDataUrl || null,
        otpVerified: Boolean(pod.otpVerified),
        recipientName: pod.recipientName || shipment?.recipientName || '',
        notes: pod.notes || '',
        capturedAt: friendlyTime(),
      };
      // The shipment keeps its driverId (see updateShipmentStatus above):
      // this is the record of who delivered it, and the driver's own portal
      // is scoped by exactly that field, so wiping it made a delivery they
      // had just completed disappear from their list - and show as
      // "Unassigned" to admin, dispatch and finance.
      const shipments = current.shipments.map((s) => (s.id === shipmentId
        ? { ...s, status: 'DELIVERED', history: [...s.history, { label: `Proof of delivery captured - signed by ${record.recipientName}`, time: friendlyTime() }] }
        : s));
      // Same "don't release a driver who still has other active
      // shipments" rule as updateShipmentStatus() above - a driver working
      // several shipments at once must stay 'Delivering' until every one
      // of them is done, never just the one this POD was captured for.
      let drivers = current.drivers;
      if (shipment?.driverId) {
        const stillHasActiveWork = shipments.some((s) => s.driverId === shipment.driverId && s.status === 'OUT_FOR_DELIVERY');
        if (!stillHasActiveWork) {
          drivers = current.drivers.map((d) => (d.id === shipment.driverId && d.status === 'Delivering' ? { ...d, status: 'Available' } : d));
        }
      }
      // Capturing proof of delivery marks the shipment DELIVERED here rather
      // than going through updateShipmentStatus, so the COD booking has to
      // happen on this path too - a driver completing a round in their own
      // portal is exactly how most COD cash is actually collected.
      const next = { ...current, podRecords: [record, ...current.podRecords], shipments, drivers };
      const delivered = shipments.find((s) => s.id === shipmentId);
      return delivered ? bookFinanceForShipment(next, delivered) : next;
    });
    logAction('Proof of delivery captured', shipmentId);
  }, [logAction]);

  const addRating = useCallback((shipmentId, driverId, stars, comment) => {
    setData((current) => ({
      ...current,
      ratings: [{ id: nextId('RTG', current.ratings), shipmentId, driverId, stars, comment, createdAt: friendlyTime() }, ...current.ratings],
    }));
    logAction('Rating submitted', `${shipmentId} - ${stars} star(s)`);
  }, [logAction]);

  // `merchant` links a merchant-generated key to that merchant so the
  // backend can scope who is allowed to read/revoke it (see
  // backend/utils/roleScope.js) - left undefined for admin-generated
  // system-wide keys (admin/ApiKeysPage.jsx), which stay admin-only.
  const generateApiKey = useCallback((label, merchant) => {
    const raw = `egw_live_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
    setData((current) => ({
      ...current,
      apiKeys: [{ id: nextId('KEY', current.apiKeys), label, ...(merchant ? { merchant } : {}), keyFull: raw, keyMasked: `egw_live_••••••••${raw.slice(-4)}`, status: 'Active', createdAt: friendlyTime() }, ...current.apiKeys],
    }));
    logAction('API key generated', label);
  }, [logAction]);

  const revokeApiKey = useCallback((keyId) => {
    setData((current) => ({
      ...current,
      apiKeys: current.apiKeys.map((k) => (k.id === keyId ? { ...k, status: 'Revoked' } : k)),
    }));
    logAction('API key revoked', keyId);
  }, [logAction]);

  const addWebhook = useCallback((input) => {
    setData((current) => ({
      ...current,
      webhooks: [...current.webhooks, { id: nextId('WH', current.webhooks), status: 'Active', lastDelivery: null, ...input }],
    }));
    logAction('Webhook added', input.url);
  }, [logAction]);

  const toggleWebhookStatus = useCallback((webhookId) => {
    setData((current) => ({
      ...current,
      webhooks: current.webhooks.map((w) => (w.id === webhookId ? { ...w, status: w.status === 'Active' ? 'Disabled' : 'Active' } : w)),
    }));
  }, []);

  // Fires a real outbound HTTP POST at the webhook's configured URL (see
  // POST /api/app-data/webhooks/:id/test in appDataController.js) - this
  // used to be a pure client-side simulation (a timed Math.random() coin
  // flip with no network call at all).
  const testWebhook = useCallback(async (webhookId) => {
    const { result } = await appDataApi.testWebhook(webhookId);
    setData((current) => ({
      ...current,
      webhooks: current.webhooks.map((w) => (w.id === webhookId ? { ...w, lastDelivery: result } : w)),
    }));
    logAction('Webhook test sent', `${webhookId} -> ${result.status}`);
    return result;
  }, [logAction]);

  const setOrgPlan = useCallback((orgId, planId, planName) => {
    setData((current) => ({
      ...current,
      organizations: current.organizations.map((o) => (o.id === orgId ? { ...o, plan: planName } : o)),
    }));
    logAction('Subscription plan changed', `${orgId} -> ${planName}`);
  }, [logAction]);

  // Payment gateway sandbox: no real processor is connected, so this
  // simulates the round trip (network delay + approve/decline) and then
  // records the outcome as a normal Payment, exactly like a real gateway
  // webhook callback would.
  const processSandboxPayment = useCallback((input) => new Promise((resolve) => {
    window.setTimeout(() => {
      const approved = Math.random() > 0.1;
      setData((current) => {
        const payment = {
          id: nextId('PAY', current.payments),
          reference: input.reference,
          method: input.method || 'Card',
          amount: Number(input.amount) || 0,
          status: approved ? 'Completed' : 'Failed',
          date: friendlyTime(),
        };
        return { ...current, payments: [payment, ...current.payments] };
      });
      logAction('Sandbox payment processed', `${input.reference} - ${approved ? 'approved' : 'declined'}`);
      resolve({ approved });
    }, 900);
  }), [logAction]);

  // Rewrites every collection in MongoDB back to the starting data set.
  const resetDemoData = useCallback(() => {
    const fresh = seedData();
    setData(fresh);
    // Deliberately sent with no `asOf`: a reset is meant to replace every
    // collection wholesale, so the per-record merge that protects a normal
    // save from stale data (reconcileShipmentWrite in the backend) must not
    // hold any of the old records back.
    // Sent whole, not as a diff: a reset must replace every collection.
    return appDataApi.saveAll(fresh).then((response) => {
      if (response?.savedAt) asOfRef.current = response.savedAt;
      lastSavedRef.current = JSON.stringify(fresh);
      lastSavedByKeyRef.current = markAllSaved(fresh);
      return response;
    }).catch(() => {});
  }, []);

  const value = useMemo(() => ({
    ...(data || {}),
    storeStatus,
    storeError,
    saveState,
    reloadStore,
    createShipment,
    updateShipmentStatus,
    setShipmentCoordinates,
    assignDriver,
    toggleDriverAvailability,
    addDriver,
    setDriverAccountStatus,
    removeDriver,
    addUser,
    setUserStatus,
    removeUser,
    addBranch,
    toggleBranchStatus,
    addAddress,
    removeAddress,
    createSettlement,
    markSettlementCleared,
    markSettlementReview,
    reconcileDriverEntry,
    payInvoice,
    addRefund,
    decideRefund,
    reportDamage,
    markLost,
    returnToOrigin,
    removeShipment,
    addVehicle,
    setVehicleStatus,
    removeVehicle,
    createManifest,
    advanceManifest,
    addPricingRule,
    addZone,
    toggleZoneStatus,
    updateNotificationTemplate,
    setTicketStatus,
    setComplaintStatus,
    addSupportTicket,
    addComplaint,
    capturePOD,
    addRating,
    generateApiKey,
    revokeApiKey,
    addWebhook,
    toggleWebhookStatus,
    testWebhook,
    setOrgPlan,
    processSandboxPayment,
    pushNotification,
    resetDemoData,
    logAction,
  }), [data, storeStatus, storeError, saveState, reloadStore, createShipment, updateShipmentStatus, setShipmentCoordinates, assignDriver, toggleDriverAvailability, addDriver, setDriverAccountStatus, removeDriver, addUser, setUserStatus, removeUser, addBranch, toggleBranchStatus, addAddress, removeAddress, createSettlement, markSettlementCleared, markSettlementReview, reconcileDriverEntry, payInvoice, addRefund, decideRefund, reportDamage, markLost, returnToOrigin, removeShipment, addVehicle, setVehicleStatus, removeVehicle, createManifest, advanceManifest, addPricingRule, addZone, toggleZoneStatus, updateNotificationTemplate, setTicketStatus, setComplaintStatus, addSupportTicket, addComplaint, capturePOD, addRating, generateApiKey, revokeApiKey, addWebhook, toggleWebhookStatus, testWebhook, setOrgPlan, processSandboxPayment, pushNotification, resetDemoData, logAction]);

  return (
    <StoreContext.Provider value={value}>
      {storeStatus === 'offline' && (
        <div style={{
          position: 'fixed', bottom: 16, left: 16, zIndex: 9999, maxWidth: 360,
          padding: '11px 14px', borderRadius: 10, background: '#FDE9E7', color: '#B23528',
          fontFamily: 'Inter, sans-serif', fontSize: 12.5, fontWeight: 600, lineHeight: 1.45,
          boxShadow: '0 8px 20px rgba(18,33,63,.18)',
        }}>
          Not connected to the database — changes are only kept in this browser.
          {storeError ? <div style={{ fontWeight: 500, marginTop: 4 }}>{storeError}</div> : null}
          <button
            type="button"
            onClick={reloadStore}
            style={{
              marginTop: 8, padding: '6px 11px', borderRadius: 7, cursor: 'pointer',
              border: '1px solid #B23528', background: 'transparent', color: '#B23528',
              fontWeight: 700, fontSize: 12,
            }}
          >
            Retry connection
          </button>
        </div>
      )}
      {children}
    </StoreContext.Provider>
  );
}

export function useStoreContext() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStoreContext must be used inside a StoreProvider');
  return context;
}

