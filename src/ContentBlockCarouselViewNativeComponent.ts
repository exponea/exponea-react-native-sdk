/**
 * Fabric component spec for ContentBlockCarouselView
 * More complex: includes commands for bidirectional communication
 */

import type { ViewProps, HostComponent } from 'react-native';
import type {
  Int32,
  DirectEventHandler,
  WithDefault,
  Double,
} from 'react-native/Libraries/Types/CodegenTypes';
import * as React from 'react';

// ✅ Recommended
import { codegenNativeComponent } from 'react-native';
import { codegenNativeCommands } from 'react-native';

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
  index?: Int32;
  count?: Int32;
  contentBlocks?: string; // JSON string (array)
}>;

type ContentBlockDataRequestEvent = Readonly<{
  requestType: string; // "filter" or "sort"
  data: string; // JSON string containing array of content blocks
}>;

// Component props
export interface ContentBlockCarouselViewNativeProps extends ViewProps {
  // Required
  placeholderId: string;

  // Optional configuration
  maxMessagesCount?: Int32;
  scrollDelay?: Int32;
  overrideDefaultBehavior?: WithDefault<boolean, false>;
  trackActions?: WithDefault<boolean, false>;

  // Internal flags (set by wrapper component)
  customFilterActive?: WithDefault<boolean, false>;
  customSortActive?: WithDefault<boolean, false>;

  // Events
  onDimensChanged?: DirectEventHandler<DimensChangedEvent>;
  onContentBlockEvent?: DirectEventHandler<ContentBlockEventData>;
  onContentBlockDataRequestEvent?: DirectEventHandler<ContentBlockDataRequestEvent>;
}

// todo in the future Commands interface
// https://reactnative.dev/docs/next/the-new-architecture/fabric-component-native-commands
// In TypeScript, the React.ElementRef is deprecated.
// The correct type to use is actually React.ComponentRef.
// However, due to a bug in Codegen, using ComponentRef will crash the app.
// We have the fix already, but we need to release a new version of React Native to apply it.
export interface NativeCommands {
  filterResponse: (
    // @ts-ignore @ts-expect-error - React.ElementRef is deprecated but required by RN Codegen
    viewRef: React.ElementRef<
      HostComponent<ContentBlockCarouselViewNativeProps>
    >,
    contentBlocks: string
  ) => void;
  sortResponse: (
    // @ts-ignore  @ts-expect-error - React.ElementRef is deprecated but required by RN Codegen
    viewRef: React.ElementRef<
      HostComponent<ContentBlockCarouselViewNativeProps>
    >,
    contentBlocks: string
  ) => void;
}

// Commands spec
export const Commands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['filterResponse', 'sortResponse'],
});

// Component spec
export default codegenNativeComponent<ContentBlockCarouselViewNativeProps>(
  'ContentBlockCarouselView'
);
