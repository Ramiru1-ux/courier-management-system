import React, { useState } from 'react';

const styles = `
  .role-form-panel {
    background: #fff;
    border: 1px solid #E3E7EF;
    border-radius: 14px;
    padding: 20px;
  }

  .role-form-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 18px;
  }

  .role-form-title {
    margin: 0;
    color: #12213F;
    font-family: 'Sora', sans-serif;
    font-size: 15px;
    font-weight: 700;
  }

  .role-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #EEECFE;
    color: #5445D6;
    padding: 5px 9px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
  }

  .form-grid {
    display: grid;
    gap: 14px;
  }

  .field {
    display: grid;
    gap: 7px;
  }

  .field label {
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    color: #697086;
  }

  .field input, .field textarea, .field select {
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
    min-height: 90px;
    resize: vertical;
  }

  .field input:focus, .field select:focus, .field textarea:focus {
    border-color: #3E7BFA;
    box-shadow: 0 0 0 3px rgba(62, 123, 250, 0.12);
  }

  .check-list {
    display: grid;
    gap: 10px;
    margin-top: 4px;
  }

  .check-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border: 1px solid #E3E7EF;
    border-radius: 10px;
    background: #FAFBFF;
    color: #12213F;
    font-size: 12.5px;
    font-weight: 600;
  }

  .check-item input {
    accent-color: #12213F;
    width: 16px;
    height: 16px;
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

const permissionGroups = [
  'Shipments',
  'Tracking',
  'Drivers',
  'Finance',
  'Support',
  'System settings',
];

export default function RoleForm({ initialValues = {}, onSubmit = () => {}, onCancel = () => {} }) {
  const [formState, setFormState] = useState({
    name: initialValues.name || 'Operations Admin',
    department: initialValues.department || 'Operations',
    description: initialValues.description || 'Full access to dispatch and routing management tasks.',
    groupAccess: initialValues.groupAccess || permissionGroups,
  });

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  };

  const handleToggle = (value) => {
    setFormState((current) => {
      const nextAccess = current.groupAccess.includes(value)
        ? current.groupAccess.filter((item) => item !== value)
        : [...current.groupAccess, value];

      return { ...current, groupAccess: nextAccess };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formState);
  };

  return (
    <div className="role-form-panel">
      <style>{styles}</style>

      <div className="role-form-header">
        <h3 className="role-form-title">Role definition</h3>
        <span className="role-badge">Access scope</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="name">Role name</label>
            <input id="name" name="name" value={formState.name} onChange={handleFieldChange} />
          </div>

          <div className="field">
            <label htmlFor="department">Department</label>
            <select id="department" name="department" value={formState.department} onChange={handleFieldChange}>
              <option>Operations</option>
              <option>Finance</option>
              <option>Customer support</option>
              <option>Administration</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" value={formState.description} onChange={handleFieldChange} />
          </div>

          <div className="field">
            <label>Permission groups</label>
            <div className="check-list">
              {permissionGroups.map((group) => (
                <label key={group} className="check-item">
                  <input
                    type="checkbox"
                    checked={formState.groupAccess.includes(group)}
                    onChange={() => handleToggle(group)}
                  />
                  {group}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="secondary-btn" onClick={onCancel}>Cancel</button>
          <button type="submit" className="primary-btn">Save role</button>
        </div>
      </form>
    </div>
  );
}
