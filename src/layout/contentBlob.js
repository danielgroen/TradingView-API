const initData = require('./initData.json');

function createEmptyLayoutContentBlob(layoutName, symbol, interval) {
  const [, shortName] = symbol.split(':');

  initData.name = layoutName;
  initData.charts[0].panes[0].sources[0].state.symbol = symbol;
  initData.charts[0].panes[0].sources[0].state.shortName = shortName;
  // initData.charts[0].panes[0].sources[0].state.currencyId = currencyId;
  initData.charts[0].panes[0].sources[0].state.currencyId = undefined; // currencyId;
  initData.charts[0].panes[0].sources[0].state.interval = interval.toUpperCase(); // currencyId;

  return initData;
}

function createStudyMetaInfoMap(rawIndicator) {
  const indicatorScriptId = rawIndicator.metaInfo.id;
  const indicatorScriptVersion = rawIndicator.metaInfo.pine.version;
  const indicatorMetaInfoVersion = rawIndicator.metaInfo._metainfoVersion;

  return {
    [`${indicatorScriptId}[v.${indicatorScriptVersion}]`]: {
      _serverMetaInfoVersion: indicatorMetaInfoVersion,
      fullId: indicatorScriptId,
      shortId: indicatorScriptId.split('@')[0],
      packageId: 'tv-scripting',
      productId: 'tv-scripting',
      version: 101,
      palettes: {},
      graphics: {},
      ...rawIndicator.metaInfo,
    },
  };
}

function createStudyStrategy(rawIndicator, id, type = 'StudyStrategy', parentSources) {
  return {
    type,
    id,
    state: {
      inputs: {
        ...rawIndicator.inputValues,
        pineId: '',
        pineVersion: '',
      },
      styles: rawIndicator.metaInfo.defaults.styles || {},
      bands: rawIndicator.metaInfo.defaults.bands || {},
      graphics: rawIndicator.metaInfo.defaults.graphics || {},
      ohlcPlots: rawIndicator.metaInfo.defaults.ohlcPlots || {},
      palettes: rawIndicator.metaInfo.defaults.palettes || {},
      filledAreasStyle: rawIndicator.metaInfo.defaults.filledAreasStyle || {},
      filledAreas: rawIndicator.metaInfo.defaults.filledAreas || {},
      visible: true,
      showLegendValues: true,
      showLegendInputs: true,
      showLabelsOnPriceScale: true,
      precision: 'default',
      parentSources: [],
      strategy: { orders: { showLabels: true, showQty: true, visible: true } },
    },
    ownerSource: '',
    parentSources,
    zorder: -10000,
    ownFirstValue: null,
    metaInfo: `${rawIndicator.metaInfo.id}[v.${rawIndicator.metaInfo.pine.version}]`,
  };
}

module.exports = class ContentBlob {
  #layoutName;

  #symbol;

  #interval;

  #indicatorId;

  #pineVersion;

  #indicatorValues;

  #session;

  #signature;

  constructor(layoutName, symbol, interval, indicatorId, pineVersion, indicatorValues, session, signature) {
    this.#layoutName = layoutName;
    this.#symbol = symbol;
    this.#interval = interval;
    this.#indicatorId = indicatorId;
    this.#pineVersion = pineVersion;
    this.#indicatorValues = indicatorValues;
    this.#session = session;
    this.#signature = signature;
  }

  /**
   * @function getScriptValues
   */
  async #setScriptValues(blob) {
    // eslint-disable-next-line global-require
    const { getRawIndicator } = require('../miscRequests');
    let [sources, studyMetaInfoMap] = [[...blob.charts[0].panes[0].sources], { ...blob.studyMetaInfoMap }];
    const extIds = [];

    // for (const [i, value] of Object.values(this.#indicatorValues).entries()) {
    for (const [i, [key, value]] of Object.entries(this.#indicatorValues).entries()) {
      // Ext deps
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const studId = `st${i}`;
        extIds.push(studId);

        const rawIndicator = await getRawIndicator(value.pine_id, value.pine_version, this.#session, this.#signature);
        Object.entries(value.inputs).forEach(([k, v]) => rawIndicator.setInputValue(k, v));
        studyMetaInfoMap = { ...studyMetaInfoMap, ...createStudyMetaInfoMap(rawIndicator) };
        await sources.push(createStudyStrategy(rawIndicator, studId, 'Study'));
        this.#indicatorValues[key] = `${studId}$${value.plot_id.split('_')[1]}`;
      }
    }

    // Main strategy
    const rawIndicator = await getRawIndicator(this.#indicatorId, this.#pineVersion, this.#session, this.#signature);
    Object.entries(this.#indicatorValues).forEach(([key, value]) => {
      if (rawIndicator.inputs.find((i) => i.id === key).type === 'color') return true; // skip colors; causing errors
      return rawIndicator.setInputValue(key, value);
    });
    studyMetaInfoMap = { ...studyMetaInfoMap, ...createStudyMetaInfoMap(rawIndicator) };
    sources.push(createStudyStrategy(rawIndicator, 'mainStratId', 'StudyStrategy', extIds));

    return { sources, studyMetaInfoMap };
  }

  /**
   * @function createLayoutContentBlob
   */
  async createLayoutContentBlob() {
    const blob = createEmptyLayoutContentBlob(this.#layoutName, this.#symbol, this.#interval);

    const { sources, studyMetaInfoMap } = await this.#setScriptValues(blob);

    blob.charts[0].panes[0].sources = sources;
    blob.studyMetaInfoMap = studyMetaInfoMap;

    return blob;
  }

  static getStudySourcesFromLayoutContent(layoutContent) {
    return layoutContent.charts.map((chart) => chart.panes.map((pane) => pane.sources.filter((source) => source.type === 'StudyStrategy')).flat()).flat();
  }

  static getMainSeriesSourceFromLayoutContent(layoutContent) {
    const sources = layoutContent.charts.map((chart) => chart.panes.map((pane) => pane.sources.filter((source) => source.type === 'MainSeries')).flat()).flat();
    return sources[0];
  }
};
