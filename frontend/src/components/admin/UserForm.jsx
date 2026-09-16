import React, { useState } from 'react';

const styles = `
  .user-form-panel {
    background: #fff;
    border: 1px solid #E3E7EF;
    border-radius: 14px;
    padding: 20px;
  }

  .form-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 18px;
  }

  .form-title {
    margin: 0;
    color: #12213F;
    font-family: 'Sora', sans-serif;
    font-size: 15px;
    font-weight: 700;
  }

  .status-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 9px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    background: #E4F7F4;
    color: #0C8C6B;
  }

  .status-chip::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #0C8C6B;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .field {
    display: grid;
    gap: 7px;
  }

  .field.full {
    grid-column: 1 / -1;
  }

  .field label {
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    color: #697086;
  }

  .field input, .field select, .field textarea {
    width: 100%;
    border: 1px solid #E3E7EF;
    background: #F9FAFC;
    color: #12213F;
    border-radius: 10px;
    padding: 10px 12px;
    font-size: 13px;
    outline: none;
  }

  .field textarea {
    min-height: 80px;
    resize: vertical;
  }

  .field input:focus, .field select:focus, .field textarea:focus {
    border-color: #3E7BFA;
    box-shadow: 0 0 0 3px rgba(62, 123, 250, 0.12);
  }

  .form-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 18px;
  }

  .secondary-btn, .primary-btn {
    border: 1px solid #E3E7EF;
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 12.5px;
    font-weight: 700;
    cursor: pointer;
  }

  .secondary-btn {
    background: #fff;
    color: #12213F;
  }

  .primary-btn {
    background: #12213F;
    color: #fff;
    border-color: #12213F;
  }
`;

const defaultValues = {
  name: '',
  email: '',
  phone: '',
  role: 'Operations Admin',
  branch: 'Colombo Hub',
  status: 'Active',
  notes: '',
};

export default function UserForm({ initialValues = defaultValues, onSubmit = () => {}, onCancel = () => {} }) {
  const [formState, setFormState] = useState(initialValues);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formState);
  };

  return (
    <div className="user-form-panel">
      <style>{styles}</style>

      <div className="form-header">
        <h3 className="form-title">Create or edit user</h3>
        <span className="status-chip">{formState.status}</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="field full">
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" value={formState.name} onChange={handleFieldChange} placeholder="Enter full name" />
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={formState.email} onChange={handleFieldChange} placeholder="name@egotech.com" />
          </div>

          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" value={formState.phone} onChange={handleFieldChange} placeholder="07x xxx xxxx" />
          </div>

          <div className="field">
            <label htmlFor="role">Role</label>
            <select id="role" name="role" value={formState.role} onChange={handleFieldChange}>
              <option>Operations Admin</option>
              <option>Dispatch Manager</option>
              <option>Finance Controller</option>
              <option>Support Lead</option>
              <option>Driver Supervisor</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="branch">Branch</label>
            <select id="branch" name="branch" value={formState.branch} onChange={handleFieldChange}>
              <option>Colombo Hub</option>
              <option>Kandy Hub</option>
              <option>Galle Hub</option>
              <option>Negombo Hub</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" value={formState.status} onChange={handleFieldChange}>
              <option>Active</option>
              <option>Pending</option>
              <option>Suspended</option>
            </select>
          </div>

          <div className="field full">
            <label htmlFor="notes">Notes</label>
            <textarea id="notes" name="notes" value={formState.notes} onChange={handleFieldChange} placeholder="Add account notes or admin comments" />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="secondary-btn" onClick={onCancel}>Cancel</button>
          <button type="submit" className="primary-btn">Save user</button>
        </div>
      </form>
    </div>
  );
}
