const { GetDataByChartUrl } = require('../miscRequests');

async function chartToBacktestResult(sessionid, signature, chartUrl, options = {}) {
  const test = GetDataByChartUrl(sessionid, signature, chartUrl, options);
  return test;
}

module.exports = { chartToBacktestResult };
