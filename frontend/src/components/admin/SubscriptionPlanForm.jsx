import React, { useState } from 'react';

const styles = `
	.plan-form { padding: 20px; border: 1px solid #E3E7EF; border-radius: 14px; background: #fff; }
	.plan-form h2 { margin: 0 0 18px; color: #12213F; font: 700 15px 'Sora', sans-serif; }
	.plan-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; } .plan-field { display: grid; gap: 7px; } .plan-field.full { grid-column: 1 / -1; } .plan-field label { color: #697086; font-size: 11px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; } .plan-field input, .plan-field select, .plan-field textarea { width: 100%; border: 1px solid #E3E7EF; border-radius: 10px; background: #F9FAFC; color: #12213F; padding: 10px 12px; font-size: 13px; outline: none; } .plan-field textarea { min-height: 72px; resize: vertical; } .plan-field input:focus, .plan-field select:focus, .plan-field textarea:focus { border-color: #3E7BFA; box-shadow: 0 0 0 3px rgba(62,123,250,.12); }
	.feature-list { display: grid; gap: 9px; } .feature-item { display: flex; align-items: center; gap: 8px; color: #12213F; font-size: 12.5px; font-weight: 600; } .feature-item input { width: 16px; height: 16px; accent-color: #12213F; } .plan-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; } .plan-actions button { border: 1px solid #E3E7EF; border-radius: 10px; padding: 10px 14px; font-size: 12px; font-weight: 700; cursor: pointer; } .plan-cancel { background: #fff; color: #12213F; } .plan-save { background: #12213F; color: #fff; border-color: #12213F !important; }
	@media (max-width: 560px) { .plan-grid { grid-template-columns: 1fr; } .plan-field.full { grid-column: auto; } }
`;

const features = ['Shipment tracking', 'COD reconciliation', 'Driver management', 'Analytics and reports', 'Priority support'];

export default function SubscriptionPlanForm({ initialValues = {}, onSubmit = () => {}, onCancel = () => {} }) {
	const [values, setValues] = useState({ name: initialValues.name || 'Business', price: initialValues.price || '24900', interval: initialValues.interval || 'Monthly', shipmentLimit: initialValues.shipmentLimit || '5,000', description: initialValues.description || 'For growing delivery operations.', features: initialValues.features || features.slice(0, 4) });
	const update = (event) => setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
	const toggle = (feature) => setValues((current) => ({ ...current, features: current.features.includes(feature) ? current.features.filter((item) => item !== feature) : [...current.features, feature] }));

	return <div className="plan-form"><style>{styles}</style><h2>Subscription plan</h2><form onSubmit={(event) => { event.preventDefault(); onSubmit(values); }}><div className="plan-grid">
		<div className="plan-field"><label htmlFor="plan-name">Plan name</label><input id="plan-name" name="name" value={values.name} onChange={update} required /></div>
		<div className="plan-field"><label htmlFor="plan-interval">Billing interval</label><select id="plan-interval" name="interval" value={values.interval} onChange={update}><option>Monthly</option><option>Quarterly</option><option>Yearly</option></select></div>
		<div className="plan-field"><label htmlFor="plan-price">Price (LKR)</label><input id="plan-price" name="price" type="number" min="0" value={values.price} onChange={update} required /></div>
		<div className="plan-field"><label htmlFor="plan-limit">Shipment limit</label><input id="plan-limit" name="shipmentLimit" value={values.shipmentLimit} onChange={update} /></div>
		<div className="plan-field full"><label htmlFor="plan-description">Description</label><textarea id="plan-description" name="description" value={values.description} onChange={update} /></div>
		<div className="plan-field full"><label>Included features</label><div className="feature-list">{features.map((feature) => <label key={feature} className="feature-item"><input type="checkbox" checked={values.features.includes(feature)} onChange={() => toggle(feature)} />{feature}</label>)}</div></div>
	</div><div className="plan-actions"><button type="button" className="plan-cancel" onClick={onCancel}>Cancel</button><button type="submit" className="plan-save">Save plan</button></div></form></div>;
}
