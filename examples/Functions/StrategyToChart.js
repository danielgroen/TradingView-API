const { createLayout } = require('../../main');

if (!process.env.SESSION || !process.env.SIGNATURE) throw Error('Please set your sessionid and signature cookies');

const layoutName = 'Dziwne Me Baby';
const currencyId = 'XTVCUSDT';
const symbol = 'BYBIT:SOLUSDT.P';
const interval = '2h';
const indicatorId = 'PUB;ba5b73720a2246cfa19b240dbfce62e0';
const pineVersion = '1.0';
const indicatorValues = { in_18: 9.9 };

(async () => {
  const layoutUrl = await createLayout(
    layoutName,
    // currencyId,
    undefined,
    symbol,
    interval,
    indicatorId,
    pineVersion,
    indicatorValues,
    process.env.SESSION,
    process.env.SIGNATURE,
  );

  console.log(`https://www.tradingview.com/chart/${layoutUrl}`);
})();
