import {NativeModules, NativeEventEmitter, Platform} from 'react-native';
import ExponeaType, {OpenedPush} from './ExponeaType';
import ExponeaProject from './ExponeaProject';
import EventType from './EventType';
import {JsonObject} from './Json';
import Consent from './Consent';
import {RecommendationOptions, Recommendation} from './Recommendation';

/*
React native bridge doesn't like optional parameters, we have to implement it ourselves.
Parameters that are null/undefined are ignored and the bridge looks for a method with one less parameter(and fails).
When calling native methods we pass each optional parameter as an object with key equal to parameter name
*/

const Exponea: ExponeaType = {
  configure: NativeModules.Exponea.configure,

  isConfigured: NativeModules.Exponea.isConfigured,

  getCustomerCookie: NativeModules.Exponea.getCustomerCookie,

  checkPushSetup: NativeModules.Exponea.checkPushSetup,

  getFlushMode: NativeModules.Exponea.getFlushMode,

  setFlushMode: NativeModules.Exponea.setFlushMode,

  getFlushPeriod: NativeModules.Exponea.getFlushPeriod,

  setFlushPeriod: NativeModules.Exponea.setFlushPeriod,

  getLogLevel: NativeModules.Exponea.getLogLevel,

  setLogLevel: NativeModules.Exponea.setLogLevel,

  async getDefaultProperties(): Promise<JsonObject> {
    return JSON.parse(await NativeModules.Exponea.getDefaultProperties());
  },

  setDefaultProperties: NativeModules.Exponea.setDefaultProperties,

  anonymize(
    exponeaProject?: ExponeaProject,
    projectMapping?: {[key in EventType]?: Array<ExponeaProject>},
  ): Promise<void> {
    return NativeModules.Exponea.anonymize({exponeaProject}, {projectMapping});
  },

  identifyCustomer: NativeModules.Exponea.identifyCustomer,

  flushData: NativeModules.Exponea.flushData,

  trackEvent(
    eventName: string,
    properties: JsonObject,
    timestamp?: number,
  ): Promise<void> {
    return NativeModules.Exponea.trackEvent(eventName, properties, {timestamp});
  },

  trackSessionStart(timestamp?: number): Promise<void> {
    return NativeModules.Exponea.trackSessionStart({timestamp});
  },

  trackSessionEnd(timestamp?: number): Promise<void> {
    return NativeModules.Exponea.trackSessionEnd({timestamp});
  },

  async fetchConsents(): Promise<Array<Consent>> {
    return JSON.parse(await NativeModules.Exponea.fetchConsents());
  },

  async fetchRecommendations(
    options: RecommendationOptions,
  ): Promise<Array<Recommendation>> {
    return JSON.parse(
      await NativeModules.Exponea.fetchRecommendations(options),
    );
  },

  setPushOpenedListener(listener: (openedPush: OpenedPush) => void): void {
    pushOpenedUserListener = listener;
    NativeModules.Exponea.onPushOpenedListenerSet();
  },

  removePushOpenedListener(): void {
    pushOpenedUserListener = null;
    NativeModules.Exponea.onPushOpenedListenerRemove();
  },

  setPushReceivedListener(listener: (data: JsonObject) => void): void {
    pushReceivedUserListener = listener;
    NativeModules.Exponea.onPushReceivedListenerSet();
  },

  removePushReceivedListener(): void {
    pushReceivedUserListener = null;
    NativeModules.Exponea.onPushReceivedListenerRemove();
  },

  async requestIosPushAuthorization(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      throw new Error('requestIosPushAuthorization is only available on iOS!');
    }
    return NativeModules.Exponea.requestPushAuthorization();
  },
};

let pushOpenedUserListener: ((openedPush: OpenedPush) => void) | null = null;
let pushReceivedUserListener: ((data: JsonObject) => void) | null = null;

const eventEmitter = new NativeEventEmitter(NativeModules.Exponea);

eventEmitter.addListener('pushOpened', (pushOpened: string) => {
  pushOpenedUserListener && pushOpenedUserListener(JSON.parse(pushOpened));
});

eventEmitter.addListener('pushReceived', (data: string) => {
  pushReceivedUserListener && pushReceivedUserListener(JSON.parse(data));
});

export default Exponea;
