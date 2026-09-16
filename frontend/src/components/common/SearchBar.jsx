import React from 'react';
import { Search } from 'lucide-react';

const styles = `
  .searchbar-shell {
    display: flex;
    align-items: center;
    gap: 9px;
    background: #F3F5F9;
    border: 1px solid #E3E7EF;
    border-radius: 10px;
    padding: 9px 14px;
    color: #9AA1B4;
    font-size: 13px;
    width: 100%;
    min-height: 42px;
    box-sizing: border-box;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .searchbar-shell:focus-within {
    border-color: #F5A524;
    box-shadow: 0 0 0 4px rgba(245, 165, 36, 0.08);
  }

  .searchbar-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #9AA1B4;
    flex-shrink: 0;
  }

  .searchbar-input {
    border: none;
    outline: none;
    background: transparent;
    width: 100%;
    color: #151A2E;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
  }

  .searchbar-input::placeholder {
    color: #9AA1B4;
  }
`;

export default function SearchBar({
  value = '',
  onChange,
  onSubmit,
  placeholder = 'Search shipment, route, customer…',
  className = '',
  width,
  style = {},
  name = 'search',
}) {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && onSubmit) {
      onSubmit(event);
    }
  };

  return (
    <div
      className={`searchbar-shell ${className}`.trim()}
      style={{ width: width || '100%', ...style }}
    >
      <style>{styles}</style>

      <span className="searchbar-icon">
        <Search size={15} />
      </span>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="searchbar-input"
        aria-label="Search"
      />
    </div>
  );
}
