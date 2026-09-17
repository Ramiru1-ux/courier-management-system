import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Info, Moon, Save, ShieldCheck, Sun, UserRound } from 'lucide-react';
import PortalLayout from '../components/layout/PortalLayout';
import Button from '../components/common/Button';
import useAuth from '../hooks/useAuth';
import { useThemeContext } from '../context/ThemeContext';

const ROLE_LABELS = { admin: 'Admin', finance: 'Finance', dispatcher: 'Dispatcher', driver: 'Driver', merchant: 'Merchant', customer: 'Customer', branch: 'Branch Manager', counter: 'Counter Staff' };

// Frontend-only preferences (Appearance excepted - that already had its own
// localStorage key in ThemeContext.js). Nothing here calls a backend
// endpoint or touches MongoDB - see the component doc comment below for why.
const NOTIFICATION_PREFS_KEY = 'cms_notification_prefs';
const DEFAULT_NOTIFICATION_PREFS = { notifications: true, shipmentUpdates: true, assignmentUpdates: true, financeUpdates: true, complaintUpdates: true };

function loadPrefs(key, defaults) {
	try {
		const raw = localStorage.getItem(key);
		return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
	} catch {
		return defaults;
	}
}

function ToggleSwitch({ checked, onChange, dark }) {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			onClick={() => onChange(!checked)}
			style={{
				width: 42, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0,
				background: checked ? '#0EA394' : dark ? '#334066' : '#CBD3E2', transition: 'background .15s',
			}}
		>
			<span style={{ position: 'absolute', top: 3, left: checked ? 21 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .15s', boxShadow: '0 1px 3px rgba(0,0,0,.25)' }} />
		</button>
	);
}

/**
 * The application's Settings page - reached from the account icon in
 * PortalLayout's header (shared across every role). Section by section:
 *
 * - Profile: unchanged, pre-existing functionality (name/phone editable via
 *   useAuth().updateProfile(), which already persists to MongoDB through
 *   the real authController.js endpoint - see that hook for details).
 * - Appearance: wired to the pre-existing ThemeContext.js (light/dark
 *   already had a working localStorage-backed mechanism; "system" is a
 *   small, backward-compatible addition to that same context). Restyles
 *   this page and the shared navigation shell (PortalLayout.jsx) for dark
 *   mode; the rest of the application's pages keep their current light
 *   card styling either way - retrofitting every existing page's styling
 *   was out of scope for a zero-regression change.
 * - Notifications: there is no existing backend mechanism for per-user
 *   notification preferences, and adding one was explicitly out of scope
 *   for this pass. This is honestly a frontend-only, per-browser preference
 *   (localStorage) - not sent to the server, not stored in MongoDB. It
 *   exists so a user's stated UI preference survives a refresh on the same
 *   device, nothing more.
 */
export default function ProfilePage() {
	const { user, updateProfile } = useAuth();
	const { theme, resolvedTheme, setTheme } = useThemeContext();
	const [name, setName] = useState(user?.name || '');
	const [phone, setPhone] = useState(user?.phone || '');
	const [saving, setSaving] = useState(false);
	const [notificationPrefs, setNotificationPrefs] = useState(() => loadPrefs(NOTIFICATION_PREFS_KEY, DEFAULT_NOTIFICATION_PREFS));

	useEffect(() => { localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(notificationPrefs)); }, [notificationPrefs]);

	const dark = resolvedTheme === 'dark';
	const palette = {
		cardBg: dark ? '#141F38' : '#fff',
		cardBorder: dark ? '#243256' : '#E3E7EF',
		text: dark ? '#ECF1FF' : '#12213F',
		textMute: dark ? '#A6AFC7' : '#697086',
		textFaint: dark ? '#7C87A3' : '#9AA1B4',
		inputBg: dark ? '#0F1830' : '#fff',
		rowBorder: dark ? '#1E2A47' : '#F0F1F5',
	};
	const cardStyle = { background: palette.cardBg, border: `1px solid ${palette.cardBorder}`, borderRadius: 14, padding: 22 };
	const labelStyle = { fontSize: 12, fontWeight: 600, color: palette.textMute, display: 'block', marginBottom: 6 };
	const inputStyle = { width: '100%', border: `1.5px solid ${palette.cardBorder}`, borderRadius: 9, padding: '10px 12px', fontSize: 13, background: palette.inputBg, color: palette.text };
	const sectionTitleStyle = { fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 14.5, color: palette.text, marginBottom: 4 };
	const sectionSubStyle = { fontSize: 11.5, color: palette.textMute, marginBottom: 16 };

	const readOnlyFields = [
		['Email', user?.email],
		['Role', ROLE_LABELS[user?.role] || user?.role],
		...(user?.branch ? [['Branch', user.branch]] : []),
		...(user?.merchantName ? [['Merchant', user.merchantName]] : []),
		...(user?.driverId ? [['Driver ID', user.driverId]] : []),
	];

	const initials = (user?.name || '?').trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || '?';

	const handleSubmit = async (event) => {
		event.preventDefault();
		if (!name.trim()) {
			toast.error('Name cannot be empty');
			return;
		}
		setSaving(true);
		try {
			await updateProfile({ name, phone });
			toast.success('Profile updated');
		} catch (error) {
			toast.error(error.message || 'Could not update your profile');
		} finally {
			setSaving(false);
		}
	};

	const toggleNotification = (key, label) => {
		const next = !notificationPrefs[key];
		setNotificationPrefs((current) => ({ ...current, [key]: next }));
		toast.success(`${label} ${next ? 'enabled' : 'disabled'}`);
	};

	return (
		<PortalLayout>
			<div style={{ marginBottom: 20 }}>
				<div style={{ fontSize: 12, color: palette.textFaint, fontWeight: 500, marginBottom: 6 }}>Account / <b style={{ color: palette.textMute }}>Settings</b></div>
				<h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 21, color: palette.text, margin: 0, display: 'flex', alignItems: 'center', gap: 9 }}><UserRound size={20} /> Settings</h1>
				<div style={{ fontSize: 13, color: palette.textMute, marginTop: 4 }}>Manage your profile and application preferences.</div>
			</div>

			<div style={{ display: 'grid', gap: 16, maxWidth: 900 }}>
				{/* PROFILE */}
				<div style={cardStyle}>
					<div style={sectionTitleStyle}>Profile</div>
					<div style={sectionSubStyle}>Your account details.</div>
					<div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,420px) minmax(0,1fr)', gap: 16, alignItems: 'flex-start' }}>
						<form onSubmit={handleSubmit}>
							<div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
								<div style={{ width: 56, height: 56, borderRadius: '50%', background: dark ? '#2A3B66' : '#FCEFD6', color: dark ? '#F5A524' : '#8A5A05', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 19, flexShrink: 0 }}>
									{initials}
								</div>
								<div>
									<div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 15, color: palette.text }}>{user?.name}</div>
									<div style={{ fontSize: 11.5, color: palette.textMute }}>{ROLE_LABELS[user?.role] || user?.role}</div>
								</div>
							</div>

							<label style={labelStyle}>Full name</label>
							<input value={name} onChange={(e) => setName(e.target.value)} style={{ ...inputStyle, marginBottom: 16 }} />

							<label style={labelStyle}>Phone number</label>
							<input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="e.g. 0771234567" inputMode="numeric" maxLength={10} style={{ ...inputStyle, marginBottom: 20 }} />

							<Button type="submit" variant="accent" icon={Save} disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</Button>
						</form>

						<div>
							<div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 13, color: palette.text, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}><ShieldCheck size={15} color="#0C8C6B" /> Account details</div>
							<div style={{ fontSize: 11, color: palette.textFaint, marginBottom: 14 }}>Managed by an administrator - cannot be changed here.</div>
							<div style={{ display: 'grid', gap: 10 }}>
								{readOnlyFields.map(([label, value]) => (
									<div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, borderBottom: `1px solid ${palette.rowBorder}`, paddingBottom: 8 }}>
										<span style={{ fontSize: 11.5, color: palette.textFaint }}>{label}</span>
										<strong style={{ fontSize: 12.5, color: palette.text, textAlign: 'right' }}>{value || 'Not set'}</strong>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* APPEARANCE */}
				<div style={cardStyle}>
					<div style={sectionTitleStyle}>Appearance</div>
					<div style={sectionSubStyle}>Choose how the application looks on this device.</div>
					<div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
						{[
							{ value: 'light', label: 'Light', icon: Sun },
							{ value: 'dark', label: 'Dark', icon: Moon },
						].map((option) => {
							const isCurrent = theme === option.value;
							const Icon = option.icon;
							return (
								<button
									key={option.value}
									type="button"
									onClick={() => setTheme(option.value)}
									style={{
										flex: '1 1 140px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
										padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
										border: isCurrent ? '2px solid #F5A524' : `1.5px solid ${palette.cardBorder}`,
										background: isCurrent ? (dark ? '#2A2107' : '#FCEFD6') : palette.inputBg,
										color: isCurrent ? '#F5A524' : palette.text,
										fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 12.5,
									}}
								>
									<Icon size={15} /> {option.label}
								</button>
							);
						})}
					</div>
				</div>

				{/* NOTIFICATIONS */}
				<div style={cardStyle}>
					<div style={sectionTitleStyle}>Notifications</div>
					<div style={sectionSubStyle}>Manage your notification preferences on this device.</div>
					<div style={{ display: 'grid', gap: 4 }}>
						{[
							['notifications', 'Notifications'],
							['shipmentUpdates', 'Shipment Updates'],
							['assignmentUpdates', 'Assignment Updates'],
							['financeUpdates', 'Payment / Finance Updates'],
							['complaintUpdates', 'Complaint / Support Updates'],
						].map(([key, label]) => (
							<div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 2px', borderBottom: `1px solid ${palette.rowBorder}` }}>
								<span style={{ fontSize: 13, color: palette.text }}>{label}</span>
								<ToggleSwitch checked={Boolean(notificationPrefs[key])} onChange={() => toggleNotification(key, label)} dark={dark} />
							</div>
						))}
					</div>
				</div>

				{/* ABOUT */}
				<div style={cardStyle}>
					<div style={{ ...sectionTitleStyle, display: 'flex', alignItems: 'center', gap: 8 }}><Info size={15} /> About</div>
					<div style={{ display: 'grid', gap: 10 }}>
						<div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${palette.rowBorder}`, paddingBottom: 8 }}>
							<span style={{ fontSize: 11.5, color: palette.textFaint }}>Application</span>
							<strong style={{ fontSize: 12.5, color: palette.text }}>Courier Management System</strong>
						</div>
						<div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${palette.rowBorder}`, paddingBottom: 8 }}>
							<span style={{ fontSize: 11.5, color: palette.textFaint }}>Version</span>
							<strong style={{ fontSize: 12.5, color: palette.text }}>1.0.0</strong>
						</div>
						<div style={{ display: 'flex', justifyContent: 'space-between' }}>
							<span style={{ fontSize: 11.5, color: palette.textFaint }}>Support</span>
							<strong style={{ fontSize: 12.5, color: palette.text, textAlign: 'right' }}>info@egotechworld.com · +94 74 312 6123 · +01 234 567 89</strong>
						</div>
					</div>
				</div>
			</div>
		</PortalLayout>
	);
}
