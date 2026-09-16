const startOfDay = (value = new Date()) => { const date = new Date(value); date.setHours(0, 0, 0, 0); return date; };
const endOfDay = (value = new Date()) => { const date = startOfDay(value); date.setDate(date.getDate() + 1); date.setMilliseconds(-1); return date; };
const addDays = (value, days) => { const date = new Date(value); date.setDate(date.getDate() + Number(days)); return date; };
const isExpired = (value, now = new Date()) => Boolean(value) && new Date(value).getTime() <= new Date(now).getTime();
const formatDate = (value, locale = "en-LK", options = {}) => new Intl.DateTimeFormat(locale, { dateStyle: "medium", ...options }).format(new Date(value));

module.exports = { startOfDay, endOfDay, addDays, isExpired, formatDate };
