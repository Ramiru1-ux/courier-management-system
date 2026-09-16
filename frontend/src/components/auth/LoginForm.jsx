import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';

const styles = `
  .login-form-shell {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .field label {
    font-size: 12px;
    font-weight: 600;
    color: #697086;
  }

  .field input {
    width: 100%;
    border: 1.5px solid #E3E7EF;
    border-radius: 9px;
    padding: 10px 12px;
    font-size: 13px;
    color: #151A2E;
    background: #fff;
    height: 48px;
  }

  .field input::placeholder {
    color: #9AA1B4;
  }

  .password-input {
    position: relative;
  }

  .password-input input {
    padding-right: 42px;
  }

  .password-toggle {
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translateY(-50%);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    background: transparent;
    color: #697086;
    cursor: pointer;
    padding: 4px;
  }

  .password-toggle:focus-visible {
    outline: 2px solid #F5A524;
    outline-offset: 2px;
    border-radius: 4px;
  }

  .login-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    font-size: 13px;
    color: #697086;
  }

  .remember {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .remember input {
    accent-color: #F5A524;
  }

  .login-link {
    color: #3E7BFA;
    font-weight: 600;
    text-decoration: none;
  }

  .login-button {
    font-family: 'Sora', sans-serif;
    font-weight: 600;
    font-size: 13.5px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 13px 20px;
    transition: transform 0.2s ease;
    width: 100%;
  }

  .login-button:hover {
    transform: translateY(-1px);
  }

  .login-button-primary {
    background: #F5A524;
    color: #211200;
  }

  .login-button-secondary {
    background: #fff;
    color: #12213F;
    border: 1.5px solid #E3E7EF;
  }
`;

export default function LoginForm({ onSubmit, onDemoClick, onForgotPassword }) {
  const [form, setForm] = useState({
    email: 'admin@egotechworld.com',
    password: '',
    remember: true,
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (onSubmit) {
      onSubmit(form);
    }
  };

  return (
    <form className="login-form-shell" onSubmit={handleSubmit}>
      <style>{styles}</style>

      <div className="field">
        <label htmlFor="login-email">Email address</label>
        <input
          id="login-email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="admin@egotechworld.com"
        />
      </div>

      <div className="field">
        <label htmlFor="login-password">Password</label>
        <div className="password-input">
          <input
            id="login-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>

      <div className="login-row">
        <label className="remember">
          <input
            type="checkbox"
            name="remember"
            checked={form.remember}
            onChange={handleChange}
          />
          Remember me
        </label>

        <button
          type="button"
          className="login-link"
          onClick={onForgotPassword}
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
            font: 'inherit',
            cursor: 'pointer',
          }}
        >
          Forgot password?
        </button>
      </div>

      <button type="submit" className="login-button login-button-primary">
        Sign in
        <ArrowRight size={16} />
      </button>

      <button type="button" className="login-button login-button-secondary" onClick={onDemoClick}>
        Use demo account
      </button>
    </form>
  );
}
