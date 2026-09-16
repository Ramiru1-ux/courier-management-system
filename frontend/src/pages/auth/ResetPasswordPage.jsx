import React, { useState } from 'react';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ResetPasswordForm from '../../components/auth/ResetPasswordForm';
import authApi from '../../api/authApi';

const styles = `.reset-page{min-height:100vh;display:grid;place-items:center;padding:24px;background:linear-gradient(135deg,#0F1A2F,#12213F 48%,#1B2E5C)}.reset-card{width:min(470px,100%);padding:34px;border-radius:20px;background:#fff;box-shadow:0 20px 40px rgba(18,33,63,.25)}.reset-icon{display:grid;place-items:center;width:42px;height:42px;margin-bottom:18px;border-radius:12px;background:#E8EFFE;color:#2453B8}.reset-title{margin:0;color:#12213F;font:700 24px 'Sora',sans-serif}.reset-copy{margin:9px 0 22px;color:#697086;font-size:13px;line-height:1.55}.reset-back{display:inline-flex;align-items:center;gap:7px;margin-top:18px;color:#3E7BFA;font-size:12px;font-weight:700;text-decoration:none}`;

export default function ResetPasswordPage() {
	const [params] = useSearchParams();
	const navigate = useNavigate();
	const [busy, setBusy] = useState(false);
	const token = params.get('token') || '';

	// The new password is hashed with bcrypt and written to the user document
	// in MongoDB by the backend - see backend/controllers/authController.js.
	const handleSubmit = async ({ password, token: submittedToken }) => {
		if (busy) return;
		setBusy(true);
		try {
			await authApi.resetPassword({ token: submittedToken || token, password });
			toast.success('Password updated. Please sign in with your new password.');
			navigate('/login', { replace: true });
		} catch (error) {
			toast.error(error?.message || 'This reset link is invalid or expired.');
		} finally {
			setBusy(false);
		}
	};

	return (
		<main className="reset-page">
			<style>{styles}</style>
			<section className="reset-card">
				<div className="reset-icon"><LockKeyhole size={20} /></div>
				<h1 className="reset-title">Create a new password</h1>
				<p className="reset-copy">Choose a strong password with at least eight characters to secure your account.</p>
				<ResetPasswordForm token={token} onSubmit={handleSubmit} />
				<Link className="reset-back" to="/login"><ArrowLeft size={14} /> Back to sign in</Link>
			</section>
		</main>
	);
}
