const alertToBacktest = require('./alertToBacktest');
const strategyToCsv = require('./strategyToCsv');
const strategyHelpers = require('./strategyHelpers');
const chartToBacktestResult = require('./chartToBacktestResult');

module.exports = {
  ...alertToBacktest,
  ...strategyHelpers,
  ...strategyToCsv,
  ...chartToBacktestResult,
};
