import {JsonObject} from './Json';

export interface AppInboxMessage {
  id: string;
  type: string;
  is_read?: boolean;
  create_time?: number;
  content?: JsonObject;
}
