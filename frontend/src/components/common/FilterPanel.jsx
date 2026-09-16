import React from 'react';
import { ChevronDown } from 'lucide-react';

const styles = `
  .filter-panel {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .filter-pill {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: #fff;
    border: 1px solid #E3E7EF;
    border-radius: 9px;
    padding: 8px 12px;
    font-size: 12.5px;
    font-weight: 500;
    color: #697086;
    transition: all 0.2s ease;
    cursor: pointer;
    user-select: none;
  }

  .filter-pill strong,
  .filter-pill b {
    color: #151A2E;
    font-weight: 600;
  }

  .filter-pill:hover {
    border-color: #D5DBEA;
  }

  .filter-pill.active {
    background: #F7F8FC;
    border-color: #D8E2FF;
    color: #12213F;
  }
`;

export default function FilterPanel({
  filters = [],
  activeFilter = null,
  onSelect,
  className = '',
  style = {},
}) {
  const items = filters.length
    ? filters
    : [
        { label: 'All', value: 'all', active: true },
        { label: 'Status', value: 'status' },
        { label: 'Zone', value: 'zone' },
        { label: 'Date range', value: 'date' },
      ];

  const renderFilter = (filter) => {
    const isActive = activeFilter !== null ? activeFilter === filter.value : Boolean(filter.active);

    return (
      <button
        key={filter.value || filter.label}
        type="button"
        className={`filter-pill ${isActive ? 'active' : ''}`.trim()}
        onClick={() => onSelect && onSelect(filter.value || filter.label)}
        style={{
          background: isActive ? '#F7F8FC' : '#fff',
          ...style,
        }}
      >
        {filter.label === 'All' || filter.active ? <strong>{filter.label}</strong> : filter.label}
        {filter.showArrow !== false ? <ChevronDown size={14} /> : null}
      </button>
    );
  };

  return (
    <div className={`filter-panel ${className}`.trim()}>
      <style>{styles}</style>
      {items.map(renderFilter)}
    </div>
  );
}
