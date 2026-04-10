/**
 * Fabric component spec for InAppContentBlocksPlaceholder
 * File MUST be named *NativeComponent.ts for codegen to process it
 */

import type { ViewProps } from 'react-native';
import type {
  DirectEventHandler,
  WithDefault,
  Double,
} from 'react-native/Libraries/Types/CodegenTypes';

import { codegenNativeComponent } from 'react-native';

// Event payload types
type DimensChangedEvent = Readonly<{
  width: Double;
  height: Double;
}>;

type ContentBlockEventData = Readonly<{
  eventType: string;
  placeholderId?: string;
  contentBlock?: string; // JSON string
  contentBlockAction?: string; // JSON string
  errorMessage?: string;
}>;

// Component props
export interface InAppContentBlocksPlaceholderNativeProps extends ViewProps {
  // Required props
  placeholderId: string;

  // Optional props with defaults
  overrideDefaultBehavior?: WithDefault<boolean, false>;

  // Events (DirectEventHandler = non-bubbling)
  onDimensChanged?: DirectEventHandler<DimensChangedEvent>;
  onInAppContentBlockEvent?: DirectEventHandler<ContentBlockEventData>;
}

export default codegenNativeComponent<InAppContentBlocksPlaceholderNativeProps>(
  'InAppContentBlocksPlaceholder'
);
