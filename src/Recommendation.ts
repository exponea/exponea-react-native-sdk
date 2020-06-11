import {JsonObject} from './Json';

export interface RecommendationOptions {
  id: string;
  fillWithRandom: boolean;
  size?: number;
  items?: Record<string, string>;
  noTrack?: boolean;
  catalogAttributesWhitelist?: Array<string>;
}

export interface Recommendation {
  engineName: string;
  itemId: string;
  recommendationId: string;
  recommendationVariantId: string;
  data: JsonObject;
}
