/**
 * Type declarations for React Native Codegen types
 * These are used by Fabric native components but don't have exported TypeScript declarations
 */

declare module 'react-native/Libraries/Types/CodegenTypes' {
  export type Double = number;
  export type Float = number;
  export type Int32 = number;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export type WithDefault<T, V = unknown> = T;
  export type BubblingEventHandler<T> = (event: { nativeEvent: T }) => void;
  export type DirectEventHandler<T> = (event: { nativeEvent: T }) => void;
  export type Stringish = string;
  export type UnsafeObject = object;
}

declare module 'react-native/Libraries/Utilities/codegenNativeComponent' {
  import type { HostComponent } from 'react-native';
  export default function codegenNativeComponent<T>(
    componentName: string
  ): HostComponent<T>;
}
