import React from 'react';

const styles = `
  .common-card { border: 1px solid #E3E7EF; border-radius: 14px; background: #fff; overflow: hidden; }
  .common-card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 18px 20px 0; }
  .common-card-title { margin: 0; color: #12213F; font: 700 14.5px 'Sora', sans-serif; }
  .common-card-description { margin: 5px 0 0; color: #697086; font-size: 12px; line-height: 1.45; }
  .common-card-body { padding: 18px 20px; }
  .common-card-header + .common-card-body { padding-top: 16px; }
  .common-card-footer { padding: 0 20px 18px; }
`;

export default function Card({ title, description, action, children, footer, className = '', ...props }) {
  return <section className={`common-card ${className}`.trim()} {...props}><style>{styles}</style>{title || description || action ? <header className="common-card-header"><div>{title ? <h2 className="common-card-title">{title}</h2> : null}{description ? <p className="common-card-description">{description}</p> : null}</div>{action}</header> : null}<div className="common-card-body">{children}</div>{footer ? <footer className="common-card-footer">{footer}</footer> : null}</section>;
}