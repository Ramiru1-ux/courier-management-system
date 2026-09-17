// import React from 'react';
// import toast from 'react-hot-toast';
// import PortalLayout from '../../components/layout/PortalLayout';
// import Table from '../../components/common/Table';
// import Button from '../../components/common/Button';
// import StatusBadge from '../../components/common/StatusBadge';
// import useStore from '../../hooks/useStore';
// import { formatLKR } from '../../utils/shipmentStatus';

// export default function ActiveDriversPage() {
//   const { drivers, toggleDriverAvailability } = useStore();

//   const handleToggle = (driver) => {
//     if (driver.status === 'Delivering') {
//       toast.error(`${driver.name} is currently delivering and cannot be changed`);
//       return;
//     }
//     toggleDriverAvailability(driver.id);
//     toast.success(`${driver.name} is now ${driver.status === 'Offline' ? 'available' : 'offline'}`);
//   };

//   const columns = [
//     { key: 'name', label: 'Driver' },
//     { key: 'branch', label: 'Branch' },
//     { key: 'vehicle', label: 'Vehicle' },
//     { key: 'deliveries', label: "Today's deliveries" },
//     { key: 'cod', label: 'COD collected' },
//     { key: 'status', label: 'Status' },
//     { key: 'actions', label: '' },
//   ];

//   return (
//     <PortalLayout>
//       <div style={{ marginBottom: 20 }}>
//         <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Dispatcher / <b style={{ color: '#697086' }}>Active drivers</b></div>
//         <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Active drivers</h1>
//         <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>Monitor driver availability and daily performance.</div>
//       </div>

//       <Table
//         columns={columns}
//         data={drivers}
//         rowKey="id"
//         emptyMessage="No drivers registered."
//         renderRow={(driver) => (
//           <tr key={driver.id}>
//             <td>
//               <div style={{ fontWeight: 600, color: '#12213F' }}>{driver.name}</div>
//               <div style={{ fontSize: 11, color: '#9AA1B4' }}>{driver.phone}</div>
//             </td>
//             <td>{driver.branch}</td>
//             <td>{driver.vehicle}</td>
//             <td>{driver.todayDeliveries}</td>
//             <td>{formatLKR(driver.codCollectedToday)}</td>
//             <td><StatusBadge status={driver.status} tone={driver.status === 'Available' ? 'teal' : driver.status === 'Delivering' ? 'amber' : 'neutral'} /></td>
//             <td style={{ textAlign: 'right' }}>
//               <Button size="small" variant="secondary" onClick={() => handleToggle(driver)} disabled={driver.status === 'Delivering'}>
//                 {driver.status === 'Offline' ? 'Set available' : driver.status === 'Available' ? 'Set offline' : 'Delivering'}
//               </Button>
//             </td>
//           </tr>
//         )}
//       />
//     </PortalLayout>
//   );
// }



import React from 'react';
import PortalLayout from '../../components/layout/PortalLayout';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import useStore from '../../hooks/useStore';
import { formatLKR } from '../../utils/shipmentStatus';

export default function ActiveDriversPage() {
  const { drivers } = useStore();

  const columns = [
    { key: 'name', label: 'Driver' },
    { key: 'branch', label: 'Branch' },
    { key: 'vehicle', label: 'Vehicle' },
    { key: 'deliveries', label: "Today's deliveries" },
    { key: 'cod', label: 'COD collected' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <PortalLayout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Dispatcher / <b style={{ color: '#697086' }}>Active drivers</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Active drivers</h1>
        <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>
          Monitor driver availability and daily performance. Drivers set themselves Available or Offline from the driver app - offline drivers cannot be assigned.
        </div>
      </div>

      <Table
        columns={columns}
        data={drivers}
        rowKey="id"
        emptyMessage="No drivers registered."
        renderRow={(driver) => (
          <tr key={driver.id}>
            <td>
              <div style={{ fontWeight: 600, color: '#12213F' }}>{driver.name}</div>
              <div style={{ fontSize: 11, color: '#9AA1B4' }}>{driver.phone}</div>
            </td>
            <td>{driver.branch}</td>
            <td>{driver.vehicle}</td>
            <td>{driver.todayDeliveries}</td>
            <td>{formatLKR(driver.codCollectedToday)}</td>
            <td><StatusBadge status={driver.status} tone={driver.status === 'Available' ? 'teal' : driver.status === 'Delivering' ? 'amber' : 'neutral'} /></td>
          </tr>
        )}
      />
    </PortalLayout>
  );
}