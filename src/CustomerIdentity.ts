/**
 * Customer identification context. Bundles `customerIds` together with an optional
 * SDK auth token (Stream / Data Hub JWT).
 */
export interface CustomerIdentity {
  customerIds: Record<string, string>;
  sdkAuthToken?: string;
}

export type { CustomerIdentity as default };
