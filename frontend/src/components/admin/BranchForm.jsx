import React, { useState } from 'react';

const styles = `
	.branch-form { padding: 20px; border: 1px solid #E3E7EF; border-radius: 14px; background: #fff; }
	.branch-form h2 { margin: 0 0 18px; color: #12213F; font: 700 15px 'Sora', sans-serif; }
	.branch-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
	.branch-field { display: grid; gap: 7px; }
	.branch-field.full { grid-column: 1 / -1; }
	.branch-field label { color: #697086; font-size: 11px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
	.branch-field input, .branch-field select, .branch-field textarea { width: 100%; border: 1px solid #E3E7EF; border-radius: 10px; background: #F9FAFC; color: #12213F; padding: 10px 12px; font-size: 13px; outline: none; }
	.branch-field textarea { min-height: 72px; resize: vertical; }
	.branch-field input:focus, .branch-field select:focus, .branch-field textarea:focus { border-color: #3E7BFA; box-shadow: 0 0 0 3px rgba(62,123,250,.12); }
	.branch-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; }
	.branch-actions button { border: 1px solid #E3E7EF; border-radius: 10px; padding: 10px 14px; font-size: 12px; font-weight: 700; cursor: pointer; }
	.branch-cancel { background: #fff; color: #12213F; }
	.branch-save { background: #12213F; color: #fff; border-color: #12213F !important; }
	@media (max-width: 560px) { .branch-grid { grid-template-columns: 1fr; } .branch-field.full { grid-column: auto; } }
`;

const emptyBranch = { name: '', code: '', manager: '', city: 'Colombo', status: 'Active', address: '' };

export default function BranchForm({ initialValues = emptyBranch, onSubmit = () => {}, onCancel = () => {} }) {
	const [values, setValues] = useState({ ...emptyBranch, ...initialValues });
	const update = (event) => setValues((current) => ({ ...current, [event.target.name]: event.target.value }));

	return (
		<div className="branch-form">
			<style>{styles}</style>
			<h2>Branch details</h2>
			<form onSubmit={(event) => { event.preventDefault(); onSubmit(values); }}>
				<div className="branch-grid">
					<div className="branch-field"><label htmlFor="branch-name">Branch name</label><input id="branch-name" name="name" value={values.name} onChange={update} placeholder="Colombo Central" required /></div>
					<div className="branch-field"><label htmlFor="branch-code">Branch code</label><input id="branch-code" name="code" value={values.code} onChange={update} placeholder="CMB-01" required /></div>
					<div className="branch-field"><label htmlFor="branch-manager">Branch manager</label><input id="branch-manager" name="manager" value={values.manager} onChange={update} placeholder="Manager name" /></div>
					<div className="branch-field"><label htmlFor="branch-city">City</label><select id="branch-city" name="city" value={values.city} onChange={update}><option>Colombo</option><option>Kandy</option><option>Galle</option><option>Negombo</option><option>Jaffna</option></select></div>
					<div className="branch-field"><label htmlFor="branch-status">Status</label><select id="branch-status" name="status" value={values.status} onChange={update}><option>Active</option><option>Maintenance</option><option>Inactive</option></select></div>
					<div className="branch-field full"><label htmlFor="branch-address">Address</label><textarea id="branch-address" name="address" value={values.address} onChange={update} placeholder="Branch address" /></div>
				</div>
				<div className="branch-actions"><button type="button" className="branch-cancel" onClick={onCancel}>Cancel</button><button type="submit" className="branch-save">Save branch</button></div>
			</form>
		</div>
	);
}
