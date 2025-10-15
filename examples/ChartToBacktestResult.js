const TradingView = require('../main');

/**
 * This example tests the user login function
 */

if (!process.env.SESSION || !process.env.SIGNATURE) throw Error('Please set your sessionid and signature cookies');
const chartUrl = 'https://www.tradingview.com/chart/UDnIMFqs/';

TradingView.chartToBacktestResult(process.env.SESSION, process.env.SIGNATURE, chartUrl).then((data) => {
  console.log(data);
}).catch((err) => {
  console.error('Login error:', err.message);
});
