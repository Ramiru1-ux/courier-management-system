const { toCsv } = require("../utils/serviceHelpers");
const exportRecords = (records = [], format = "json") => format.toLowerCase() === "csv" ? toCsv(records) : records;
module.exports = { exportRecords, toCsv, exportToCsv: toCsv, exportToJson: (records) => JSON.stringify(records, null, 2) };
