const noop = () => {};
const asyncNoop = () => Promise.resolve();

const Exponea = {
  isConfigured: () => Promise.resolve(false),
  setLogLevel: noop,
  checkPushSetup: noop,
  configure: asyncNoop,
  trackEvent: asyncNoop,
  trackInAppMessageClick: asyncNoop,
  trackInAppMessageClose: asyncNoop,
  setPushOpenedListener: noop,
  setPushReceivedListener: noop,
  setInAppMessageCallback: noop,
  registerSegmentationDataCallback: noop,
  unregisterSegmentationDataCallback: noop,
  setAppInboxProvider: noop,
  stopIntegration: noop,
  fetchRecommendations: async () => [],
};

module.exports = {
  __esModule: true,
  default: Exponea,
  ...Exponea,
};
