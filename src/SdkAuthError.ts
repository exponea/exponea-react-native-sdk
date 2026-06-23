/**
 * Reason the SDK requested a new auth token, or rejected the supplied one.
 */
export enum SdkAuthErrorCode {
  TOKEN_ABOUT_TO_EXPIRE = 'TOKEN_ABOUT_TO_EXPIRE',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_REJECTED = 'TOKEN_REJECTED',
  TOKEN_NOT_PROVIDED = 'TOKEN_NOT_PROVIDED',
  /** iOS only — Android never emits this. */
  TOKEN_INSUFFICIENT = 'TOKEN_INSUFFICIENT',
}

/**
 * Auth error delivered to the callback registered via `setSdkAuthErrorCallback`.
 */
export interface SdkAuthError {
  errorCode: SdkAuthErrorCode;
  customerIds: Record<string, string>;
}

export type { SdkAuthError as default };
