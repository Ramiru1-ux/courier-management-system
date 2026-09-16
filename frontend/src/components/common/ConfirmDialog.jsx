import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({ open = false, title = 'Confirm action', message = 'Are you sure you want to continue?', confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = false, loading = false, onConfirm = () => {}, onCancel = () => {} }) {
	return <Modal open={open} onClose={onCancel} title={title} description={message} footer={<><Button variant="secondary" onClick={onCancel}>{cancelLabel}</Button><Button variant={danger ? 'danger' : 'primary'} loading={loading} onClick={onConfirm}>{confirmLabel}</Button></>}><div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, background: danger ? '#FDE9E7' : '#E8EFFE', color: danger ? '#B23528' : '#2453B8', fontSize: 12, fontWeight: 600 }}><AlertTriangle size={18} /> This action may affect active shipment or account data.</div></Modal>;
}
