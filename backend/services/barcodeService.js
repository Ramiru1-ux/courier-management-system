const normalizeBarcode = (value) => String(value ?? "").trim().toUpperCase();
const createBarcodeValue = (prefix, id) => `${String(prefix || "PKG").toUpperCase()}-${normalizeBarcode(id)}`;
const parseBarcode = (value) => { const [prefix, ...rest] = normalizeBarcode(value).split("-"); return { prefix, value: rest.join("-") }; };
module.exports = { normalizeBarcode, createBarcodeValue, parseBarcode, generateBarcode: createBarcodeValue };
