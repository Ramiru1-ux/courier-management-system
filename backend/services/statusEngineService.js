const transitions = { created: ["assigned", "cancelled"], assigned: ["picked_up", "cancelled"], picked_up: ["in_transit", "failed"], in_transit: ["delivered", "failed", "returned"], failed: ["assigned", "returned"], delivered: [], returned: [], cancelled: [] };
const canTransition = (from, to) => (transitions[String(from).toLowerCase()] || []).includes(String(to).toLowerCase());
const transition = (from, to) => { if (!canTransition(from, to)) throw new Error(`Invalid status transition: ${from} -> ${to}`); return to; };
module.exports = { transitions, canTransition, transition, getNextStatuses: (status) => transitions[status] || [] };
