import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';
import authApi from '../../api/authApi';

const styles = `.auth-simple{min-height:100vh;display:grid;place-items:center;padding:24px;background:linear-gradient(135deg,#0F1A2F,#12213F 48%,#1B2E5C)}.auth-simple-card{width:min(470px,100%);padding:34px;border-radius:20px;background:#fff;box-shadow:0 20px 40px rgba(18,33,63,.25)}.auth-simple-icon{display:grid;place-items:center;width:42px;height:42px;margin-bottom:18px;border-radius:12px;background:#FCEFD6;color:#8A5A05}.auth-simple-title{margin:0;color:#12213F;font:700 24px 'Sora',sans-serif}.auth-simple-copy{margin:9px 0 22px;color:#697086;font-size:13px;line-height:1.55}.auth-back{display:inline-flex;align-items:center;gap:7px;margin-top:18px;color:#3E7BFA;font-size:12px;font-weight:700;text-decoration:none}.auth-note{margin-top:16px;padding:11px 13px;border-radius:9px;background:#E4F7F4;color:#087367;font-size:12px;line-height:1.5}`;

export default function ForgotPasswordPage() {
	const navigate = useNavigate();
	const [busy, setBusy] = useState(false);

	// The backend looks the email up in MongoDB and stores a hashed,
	// 15-minute reset token on that user. No SMTP provider is configured in
	// this build, so the token comes back in the response and we go straight
	// to the reset screen instead of pretending an email was sent.
	const handleSubmit = async ({ email }) => {
		if (busy) return;
		setBusy(true);
		try {
			const response = await authApi.forgotPassword(String(email).trim().toLowerCase());
			if (response?.token) {
				toast.success('Reset link created. Continue to set a new password.');
				navigate(`/reset-password?token=${encodeURIComponent(response.token)}`);
			} else {
				toast.success(response?.message || 'If that email has an account, a reset link has been created.');
			}
		} catch (error) {
			toast.error(error?.message || 'Could not create a reset link.');
		} finally {
			setBusy(false);
		}
	};

	return (
		<main className="auth-simple">
			<style>{styles}</style>
			<section className="auth-simple-card">
				<div className="auth-simple-icon"><KeyRound size={20} /></div>
				<h1 className="auth-simple-title">Forgot your password?</h1>
				<p className="auth-simple-copy">Enter the email linked to your account and we will create instructions to reset your password.</p>
				<ForgotPasswordForm onSubmit={handleSubmit} />
				<div className="auth-note">No email provider is configured, so the reset link opens directly instead of arriving in your inbox.</div>
				<Link className="auth-back" to="/login"><ArrowLeft size={14} /> Back to sign in</Link>
			</section>
		</main>
	);
}
