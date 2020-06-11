export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export type JsonObject = {[member: string]: JsonValue};
export type JsonArray = Array<JsonValue>;
