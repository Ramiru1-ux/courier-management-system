const { roundMoney } = require("../utils/serviceHelpers");
const reconcileCOD = ({ expected = 0, collected = 0, settled = 0 } = {}) => ({ expected: roundMoney(expected), collected: roundMoney(collected), settled: roundMoney(settled), variance: roundMoney(Number(collected) - Number(expected)), outstanding: roundMoney(Number(collected) - Number(settled)), reconciled: roundMoney(collected) === roundMoney(expected) });
module.exports = { reconcileCOD, reconcile: reconcileCOD };
