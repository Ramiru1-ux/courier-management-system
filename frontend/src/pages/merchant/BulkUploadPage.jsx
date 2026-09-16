import React, { useState } from 'react';
import Papa from 'papaparse';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Upload } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import useStore from '../../hooks/useStore';
import useAuth from '../../hooks/useAuth';

const SAMPLE_CSV = 'recipientName,recipientPhone,recipientAddress,recipientCity,weight,codAmount\nJohn Perera,0771234567,21 Temple Road,Kandy,2.5,4500\nSaman Kumara,0779988771,45 Lake Road,Galle,1.2,0';

export default function BulkUploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { branches, createShipment } = useStore();
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState('');

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const cleaned = results.data.filter((r) => r.recipientName);
        setRows(cleaned);
        toast.success(`Parsed ${cleaned.length} row(s) from ${file.name}`);
      },
      error: () => toast.error('Could not parse that CSV file'),
    });
  };

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bulk-shipments-sample.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateAll = () => {
    if (rows.length === 0) return;
    rows.forEach((row) => {
      createShipment({
        senderName: user?.merchantName || 'Urban Mart',
        senderPhone: '',
        senderAddress: '',
        branch: branches[0]?.name || '',
        recipientName: row.recipientName,
        recipientPhone: row.recipientPhone,
        recipientAddress: row.recipientAddress,
        recipientCity: row.recipientCity,
        serviceType: 'Standard',
        weight: row.weight,
        codAmount: row.codAmount,
      });
    });
    toast.success(`${rows.length} shipment(s) created`);
    navigate('/merchant/shipments');
  };

  return (
    <PortalLayout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#9AA1B4', fontWeight: 500, marginBottom: 6 }}>Merchant / <b style={{ color: '#697086' }}>Bulk upload</b></div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: '#12213F', margin: 0 }}>Bulk upload shipments</h1>
        <div style={{ fontSize: 13, color: '#697086', marginTop: 4 }}>Upload a CSV to create many shipments at once.</div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #E3E7EF', borderRadius: 14, padding: 22, marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 16px', borderRadius: 10, background: '#F5A524', color: '#211200', fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            <Upload size={15} /> Choose CSV file
            <input type="file" accept=".csv" onChange={handleFile} style={{ display: 'none' }} />
          </label>
          <Button variant="secondary" onClick={handleDownloadSample}>Download sample CSV</Button>
          {fileName && <span style={{ fontSize: 12.5, color: '#697086' }}>{fileName}</span>}
        </div>
        <p style={{ fontSize: 11.5, color: '#9AA1B4', marginTop: 12 }}>
          Expected columns: recipientName, recipientPhone, recipientAddress, recipientCity, weight, codAmount
        </p>
      </div>

      {rows.length > 0 && (
        <>
          <Table
            columns={[{ key: 'name', label: 'Recipient' }, { key: 'phone', label: 'Phone' }, { key: 'city', label: 'City' }, { key: 'weight', label: 'Weight' }, { key: 'cod', label: 'COD' }]}
            data={rows}
            rowKey="recipientPhone"
            renderRow={(row, i) => (
              <tr key={i}>
                <td>{row.recipientName}</td>
                <td>{row.recipientPhone}</td>
                <td>{row.recipientCity}</td>
                <td>{row.weight} kg</td>
                <td>{row.codAmount || 0}</td>
              </tr>
            )}
          />
          <div style={{ marginTop: 16 }}>
            <Button variant="accent" icon={CheckCircle2} onClick={handleCreateAll}>Create {rows.length} shipment(s)</Button>
          </div>
        </>
      )}
    </PortalLayout>
  );
}
