/**
 * Non-reactive singleton that stores the last known customer IDs.
 */
let lastCustomerIds: Record<string, string> = {};

const SdkSetupState = {
  get customerIds(): Record<string, string> {
    return lastCustomerIds;
  },

  setCustomerIds(ids: Record<string, string>): void {
    lastCustomerIds = { ...ids };
  },

  reset(): void {
    lastCustomerIds = {};
  },
};

export default SdkSetupState;
