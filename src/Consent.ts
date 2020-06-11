interface Consent {
  id: string;
  legitimateInterest: boolean;
  sources: ConsentSources;
  translations: Record<string, Record<string, string>>;
}

export interface ConsentSources {
  createdFromCRM: boolean;
  imported: boolean;
  fromConsentPage: boolean;
  privateAPI: boolean;
  publicAPI: boolean;
  trackedFromScenario: boolean;
}

export default Consent;
