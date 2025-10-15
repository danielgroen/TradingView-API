const { createLayout, deleteLayout } = require('../../main');

if (!process.env.SESSION || !process.env.SIGNATURE) throw Error('Please set your sessionid and signature cookies');

const layoutName = 'Dziwne Me Baby';
const symbol = 'BYBIT:SOLUSDT.P';
const interval = '2H';
const indicatorId = 'STD;RSI%1Strategy';
const pineVersion = '30.0';
const inputs = {
  __profile: false,
  in_0: 14,
  in_1: 30,
  in_10: 'NONE',
  in_11: 0,
  in_12: 'percent',
  in_13: 0,
  in_14: false,
  in_15: 'FIFO',
  in_16: 100,
  in_17: 100,
  in_18: 2,
  in_19: false,
  in_2: 70,
  in_20: false,
  in_21: 'BACKTEST',
  in_22: '',
  in_23: 'order_fills',
  in_24: '',
  in_25: true,
  in_26: '',
  in_3: 1,
  in_4: false,
  in_5: false,
  in_6: 0,
  in_7: 'fixed',
  in_8: 1,
  in_9: 1000000,
  pineFeatures: '{"strategy":1,"ta":1}',
  pineId: '',
  pineVersion: '',
  text: 'bmI9Ks46_pKyMrXKdWqFJw8YUAs5Kyw==_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',
};

(async () => {
  const layoutUrl = await createLayout(
    layoutName,
    symbol,
    interval,
    indicatorId,
    pineVersion,
    inputs,
    process.env.SESSION,
    process.env.SIGNATURE,
  );

  console.log(`https://www.tradingview.com/chart/${layoutUrl}`);

  await deleteLayout(layoutUrl, process.env.SESSION, process.env.SIGNATURE);
})();
