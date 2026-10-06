const noop = () => {};
const asyncNoop = () => Promise.resolve();
const React = require('react');

class SegmentationDataCallback {
  constructor(category, includeInAppMessages, callback) {
    this.category = category;
    this.includeInAppMessages = includeInAppMessages;
    this.callback = callback;
  }
}

const Exponea = {
  isConfigured: () => Promise.resolve(false),
  setLogLevel: noop,
  checkPushSetup: noop,
  configure: asyncNoop,
  getCustomerCookie: () => Promise.resolve('mock-cookie'),
  trackEvent: asyncNoop,
  trackInAppMessageClick: asyncNoop,
  trackInAppMessageClose: asyncNoop,
  setPushOpenedListener: noop,
  setPushReceivedListener: noop,
  setInAppMessageCallback: noop,
  removeInAppMessageCallback: noop,
  removeSdkAuthErrorCallback: noop,
  registerSegmentationDataCallback: noop,
  unregisterSegmentationDataCallback: noop,
  registerLoggerCallback: noop,
  unregisterLoggerCallback: noop,
  setAppInboxProvider: noop,
  stopIntegration: noop,
  fetchRecommendations: async () => [],
  AppInboxButton: (props) => React.createElement('AppInboxButton', props),
  SegmentationDataCallback,
};

module.exports = {
  __esModule: true,
  default: Exponea,
  ...Exponea,
};
