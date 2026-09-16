import React, { useState } from 'react';

const styles = `
  .permission-matrix {
    width: 100%;
    overflow-x: auto;
  }

  .perm-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 720px;
  }

  .perm-table th, .perm-table td {
    border: 1px solid #E3E7EF;
    padding: 12px 10px;
    text-align: center;
    font-size: 12px;
  }

  .perm-table th {
    background: #F9FAFC;
    color: #697086;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .perm-table th:first-child, .perm-table td:first-child {
    text-align: left;
    min-width: 180px;
  }

  .module-name {
    font-weight: 700;
    color: #12213F;
  }

  .module-muted {
    display: block;
    margin-top: 4px;
    color: #697086;
    font-size: 11px;
  }

  .check-cell {
    padding: 0;
  }

  .check-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 42px;
  }

  .check-wrap input {
    accent-color: #12213F;
    width: 16px;
    height: 16px;
  }
`;

const initialMatrix = {
  'Shipment management': { create: true, view: true, edit: true, delete: false },
  'Dispatch planning': { create: true, view: true, edit: true, delete: false },
  'Tracking & route': { create: false, view: true, edit: true, delete: false },
  'Driver operations': { create: true, view: true, edit: true, delete: false },
  'COD & finance': { create: true, view: true, edit: true, delete: false },
  'Support tickets': { create: true, view: true, edit: false, delete: false },
  'System settings': { create: false, view: true, edit: true, delete: false },
};

export default function PermissionMatrix() {
  const [matrix, setMatrix] = useState(initialMatrix);

  const handleToggle = (module, action) => {
    setMatrix((current) => ({
      ...current,
      [module]: {
        ...current[module],
        [action]: !current[module][action],
      },
    }));
  };

  return (
    <div className="permission-matrix">
      <style>{styles}</style>

      <table className="perm-table">
        <thead>
          <tr>
            <th>Module</th>
            <th>Create</th>
            <th>View</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(matrix).map(([module, permissions]) => (
            <tr key={module}>
              <td>
                <span className="module-name">{module}</span>
                <span className="module-muted">Operational scope</span>
              </td>
              {Object.entries(permissions).map(([action, enabled]) => (
                <td key={`${module}-${action}`} className="check-cell">
                  <div className="check-wrap">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={() => handleToggle(module, action)}
                    />
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
