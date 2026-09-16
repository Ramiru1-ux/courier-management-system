import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

// `theme` is the user's PREFERENCE ('light' | 'dark' | 'system'), persisted
// to localStorage exactly as before - this was already the existing
// mechanism (see cms_theme key), just previously stuck at two options with
// nothing reading document.documentElement.dataset.theme anywhere. `system`
// resolves against the OS/browser's prefers-color-scheme and stays in sync
// if that changes while the app is open.
const resolveSystemTheme = () => (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

const ThemeContext = createContext(null);
export function ThemeProvider({ children }) {
	const [theme, setTheme] = useState(() => (typeof window === 'undefined' ? 'light' : localStorage.getItem('cms_theme') || 'light'));
	const [resolvedTheme, setResolvedTheme] = useState(() => (theme === 'system' ? resolveSystemTheme() : theme));

	useEffect(() => {
		if (typeof window === 'undefined') return undefined;
		localStorage.setItem('cms_theme', theme);
		if (theme !== 'system') {
			setResolvedTheme(theme);
			return undefined;
		}
		setResolvedTheme(resolveSystemTheme());
		const media = window.matchMedia('(prefers-color-scheme: dark)');
		const handleChange = () => setResolvedTheme(resolveSystemTheme());
		media.addEventListener?.('change', handleChange);
		return () => media.removeEventListener?.('change', handleChange);
	}, [theme]);

	useEffect(() => {
		if (typeof window !== 'undefined') document.documentElement.dataset.theme = resolvedTheme;
	}, [resolvedTheme]);

	const toggleTheme = () => setTheme((current) => (current === 'light' ? 'dark' : 'light'));
	const value = useMemo(() => ({ theme, resolvedTheme, setTheme, toggleTheme }), [theme, resolvedTheme]);
	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export function useThemeContext() { const context = useContext(ThemeContext); if (!context) throw new Error('useThemeContext must be used inside ThemeProvider'); return context; }
export default ThemeContext;
