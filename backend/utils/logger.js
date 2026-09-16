const serialize = (value) => value instanceof Error ? { message: value.message, stack: value.stack } : value;
const write = (level, message, metadata) => { const entry = { timestamp: new Date().toISOString(), level, message: String(message), ...(metadata === undefined ? {} : { metadata: serialize(metadata) }) }; const output = JSON.stringify(entry); if (level === "error") console.error(output); else if (level === "warn") console.warn(output); else console.log(output); return entry; };
const logger = { info: (message, metadata) => write("info", message, metadata), warn: (message, metadata) => write("warn", message, metadata), error: (message, metadata) => write("error", message, metadata), debug: (message, metadata) => process.env.NODE_ENV !== "production" && write("debug", message, metadata) };

module.exports = logger;
