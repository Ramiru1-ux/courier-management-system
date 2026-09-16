import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button';

const styles = `.common-empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:42px 20px;border:1px dashed #D8DDE8;border-radius:12px;background:#FAFBFD;text-align:center}.common-empty-icon{display:grid;place-items:center;width:44px;height:44px;margin-bottom:13px;border-radius:12px;background:#E8EFFE;color:#2453B8}.common-empty-title{margin:0;color:#12213F;font:700 15px 'Sora',sans-serif}.common-empty-description{max-width:360px;margin:7px 0 16px;color:#697086;font-size:12px;line-height:1.5}.common-empty-action{display:inline-flex}`;

export default function EmptyState({ title = 'Nothing here yet', description = 'There are no records to display at the moment.', actionLabel, onAction, icon: Icon = Inbox }) {
	return <div className="common-empty-state"><style>{styles}</style><div className="common-empty-icon"><Icon size={21} /></div><h2 className="common-empty-title">{title}</h2><p className="common-empty-description">{description}</p>{actionLabel && onAction ? <div className="common-empty-action"><Button size="small" onClick={onAction}>{actionLabel}</Button></div> : null}</div>;
}
