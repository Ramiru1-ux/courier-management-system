const escapePdfText = (value) => String(value ?? "").replace(/[()\\]/g, "\\$&").replace(/[\r\n]+/g, " ");

const generatePdf = async ({ title = "Document", lines = [] } = {}) => {
	const content = [`BT`, `/F1 18 Tf`, `50 780 Td`, `(${escapePdfText(title)}) Tj`, `/F1 11 Tf`, ...lines.map((line) => `0 -20 Td (${escapePdfText(line)}) Tj`), `ET`].join("\n");
	const objects = [`1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj`, `2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj`, `3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>endobj`, `4 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj`, `5 0 obj<< /Length ${Buffer.byteLength(content)} >>stream\n${content}\nendstream endobj`];
	let pdf = "%PDF-1.4\n"; const offsets = [];
	for (const object of objects) { offsets.push(Buffer.byteLength(pdf)); pdf += `${object}\n`; }
	const xref = Buffer.byteLength(pdf); pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("")}trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
	return Buffer.from(pdf);
};

module.exports = { generatePdf, createPdf: generatePdf };
