import React from 'react';
import { LogOut } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

/**
 * "Are you sure you want to log out?" pop-up shown before signing out.
 * Pressing Esc, clicking outside the box, the X button or "No" all cancel.
 */
export default function LogoutConfirmDialog({ open = false, userName = '', onConfirm = () => {}, onCancel = () => {} }) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title="Log out"
      description="Are you sure you want to log out?"
      className="logout-confirm-modal"
      footer={(
        <>
          <Button variant="secondary" onClick={onCancel} autoFocus>No, stay signed in</Button>
          <Button variant="danger" icon={LogOut} onClick={onConfirm}>Yes, log out</Button>
        </>
      )}
    >
      <style>{'.logout-confirm-modal{max-width:420px}'}</style>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 14px',
          borderRadius: 10,
          background: '#FDE9E7',
          color: '#B23528',
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        <LogOut size={18} style={{ flexShrink: 0 }} />
        <span>
          {userName ? `You are signed in as ${userName}. ` : ''}
          You will need to sign in again to continue.
        </span>
      </div>
    </Modal>
  );
}