import {NativeModules} from 'react-native';
import ExponeaType from './ExponeaType';
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
};

// TODO until we have proper ios implementation we also need sample method
interface SampleSDK {
  sampleMethod(
    stringArgument: string,
    numberArgument: number,
    callback: (value: string) => void,
  ): void;
}
((Exponea as unknown) as SampleSDK).sampleMethod =
  NativeModules.Exponea.sampleMethod;

export default Exponea;
