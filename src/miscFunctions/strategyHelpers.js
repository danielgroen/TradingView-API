const calculateLinReg = (data) => {
  const n = data.length;
  const sumX = data.reduce((sum, _, index) => sum + index, 0); // Assuming indices as x values
  const sumY = data.reduce((sum, value) => sum + value, 0);
  const sumXY = data.reduce((sum, value, index) => sum + index * value, 0);
  const sumXX = data.reduce((sum, _, index) => sum + index * index, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
};

const getPnlByDaysAgo = (trades, equity, profit) => {
  const daysInMilliseconds = (days) => Date.now() - days * 24 * 60 * 60 * 1000;

  const targets = {
    7: daysInMilliseconds(7),
    30: daysInMilliseconds(30),
    90: daysInMilliseconds(90),
    180: daysInMilliseconds(180),
    270: daysInMilliseconds(270),
    365: daysInMilliseconds(365),
  };

  const recentTrades = {};
  const pnlAt = {};

  // Start from the oldest
  recentTrades[365] = trades.filter(({ entry }) => entry.time > targets[365]);
  recentTrades[270] = trades.filter(({ entry }) => entry.time > targets[270]);
  recentTrades[180] = trades.filter(({ entry }) => entry.time > targets[180]);
  recentTrades[90] = trades.filter(({ entry }) => entry.time > targets[90]);
  recentTrades[30] = trades.filter(({ entry }) => entry.time > targets[30]);
  recentTrades[7] = trades.filter(({ entry }) => entry.time > targets[7]);

  for (const days of [7, 30, 90, 180, 270, 365]) {
    const list = recentTrades[days];
    pnlAt[days] = list.length ? equity[trades.length - list.length] - 100 : 0;
  }

  const compute = (days) => (pnlAt[days] ? ((profit - pnlAt[days]) / Math.abs(pnlAt[days])) * 100 : 0);

  return {
    pnl7: compute(7),
    pnl30: compute(30),
    pnl90: compute(90),
    pnl180: compute(180),
    pnl270: compute(270),
    pnl365: compute(365),
  };
};

const calculateCGR = (startValue, endValue, periods) => Math.round((Math.pow(endValue / startValue, 1 / periods) - 1) * 100 * 100) / 100;

const calculateRSquared = (actual) => {
  const { slope, intercept } = calculateLinReg(actual);

  const predicted = actual.map((_, index) => slope * index + intercept);
  const meanActual = actual.reduce((sum, value) => sum + value, 0) / actual.length;

  let sse = 0;
  let sst = 0;

  for (let i = 0; i < actual.length; i++) {
    sse += Math.pow(actual[i] - predicted[i], 2);
    sst += Math.pow(actual[i] - meanActual, 2);
  }

  const r2 = 1 - sse / sst;
  return {
    rSquared: r2.toFixed(2),
    predicted: predicted.map((num) => Math.round((num / 100) * 100) / 100),
  };
};

module.exports = {
  getPnlByDaysAgo,
  calculateCGR,
  calculateRSquared,
};
