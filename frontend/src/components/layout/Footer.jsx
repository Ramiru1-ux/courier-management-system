import React from 'react';
import { ExternalLink, Globe } from 'lucide-react';

const COMPANY = {
  brand: 'EgoTECHWORLD',
  legalName: 'EGOTECHWORLD (PVT) LTD',
  country: 'Sri Lanka',
  website: 'https://www.egotechworld.com/',
  websiteLabel: 'egotechworld.com',
};

const LINKS = [
  { label: 'Privacy Policy', href: 'https://www.egotechworld.com/privacy.php' },
  { label: 'Terms of Service', href: 'https://www.egotechworld.com/terms.php' },
  { label: 'Contact Us', href: 'https://www.egotechworld.com/contact.php' },
];

const styles = `
  .cms-footer { border-top: 1px solid #E3E7EF; background: #fff; color: #697086; font-family: 'Inter', sans-serif; font-size: 12px; }
  .cms-footer-inner { display: flex; align-items: center; justify-content: space-between; gap: 14px 24px; flex-wrap: wrap; padding: 16px 28px; }
  .cms-footer-brand { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .cms-footer-mark { width: 28px; height: 28px; flex-shrink: 0; display: grid; place-items: center; border-radius: 8px; background: linear-gradient(135deg, #F5A524, #D9860F); color: #211200; font: 800 12px 'Sora', sans-serif; }
  .cms-footer-brand strong { display: block; color: #12213F; font: 700 13px 'Sora', sans-serif; }
  .cms-footer-brand small { display: block; margin-top: 2px; color: #9AA1B4; font-size: 11px; }
  .cms-footer-links { display: flex; align-items: center; gap: 8px 18px; flex-wrap: wrap; }
  .cms-footer-links a { display: inline-flex; align-items: center; gap: 5px; color: #697086; font-weight: 600; text-decoration: none; transition: color .15s; }
  .cms-footer-links a:hover { color: #2453B8; }
  .cms-footer-links a.cms-footer-site { color: #D9860F; }
  .cms-footer-links a.cms-footer-site:hover { color: #B26D08; }
  .cms-footer-bottom { padding: 10px 28px 14px; border-top: 1px solid #F0F2F7; color: #9AA1B4; font-size: 11px; text-align: center; }
  @media (max-width: 640px) {
    .cms-footer-inner { flex-direction: column; align-items: flex-start; padding: 14px 18px; }
    .cms-footer-bottom { padding: 10px 18px 14px; text-align: left; }
  }
  [data-theme="dark"] .cms-footer { background: #0F1729; border-top-color: #1E2A44; color: #9AA7C7; }
  [data-theme="dark"] .cms-footer-brand strong { color: #E7ECFB; }
  [data-theme="dark"] .cms-footer-links a { color: #9AA7C7; }
  [data-theme="dark"] .cms-footer-bottom { border-top-color: #1E2A44; }
`;

/** Company footer shown at the bottom of every page. */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="cms-footer">
      <style>{styles}</style>

      <div className="cms-footer-inner">
        <div className="cms-footer-brand">
          <span className="cms-footer-mark">E</span>
          <div>
            <strong>{COMPANY.brand}</strong>
            <small>Courier Management System · by {COMPANY.legalName}, {COMPANY.country}</small>
          </div>
        </div>

        <nav className="cms-footer-links" aria-label="Company links">
          <a className="cms-footer-site" href={COMPANY.website} target="_blank" rel="noopener noreferrer">
            <Globe size={13} /> {COMPANY.websiteLabel}
          </a>
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
              {link.label} <ExternalLink size={11} />
            </a>
          ))}
        </nav>
      </div>

      <div className="cms-footer-bottom">
        © {year} {COMPANY.legalName}. All rights reserved.
      </div>
    </footer>
  );
}