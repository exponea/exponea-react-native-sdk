// Re-export types for backward compatibility with tests
// Import only from type-definition files, not implementation files
export type { ExponeaType } from './index';
export type {
  OpenedPush,
  InAppMessage,
  InAppMessageButton,
  Segment,
  Consent,
  ConsentSources,
  Recommendation,
  RecommendationOptions,
  AppInboxMessage,
  AppInboxAction,
  AppInboxStyle,
  JsonObject,
  ExponeaProject,
  PushAction,
  InAppMessageAction,
  InAppContentBlock,
  InAppContentBlockAction,
} from './NativeExponea';

export type { InAppMessageCallbackImpl as InAppMessageCallback } from './ExponeaListeners';
export { SegmentationDataCallback } from './ExponeaListeners';

// Re-export enums (these are values, not just types)
export { FlushMode, LogLevel, InAppMessageActionType } from './NativeExponea';
export { default as EventType } from './EventType';
