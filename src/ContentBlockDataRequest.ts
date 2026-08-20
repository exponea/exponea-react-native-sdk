import type { InAppContentBlock } from './NativeExponea';

export type ContentBlockTransformer = (
  blocks: InAppContentBlock[]
) => InAppContentBlock[];

export interface ContentBlockDataRequestResult {
  requestKind: string;
  requestToken?: string;
  inputCount: number;
  outputCount?: number;
  responsePayload?: string;
}

/**
 * Applies an optional JavaScript content-block transformer and serializes its
 * response for the native carousel. New native requests carry a token so that
 * overlapping filter/sort requests can be matched with their own response.
 */
export function resolveContentBlockDataRequest(
  requestType: string,
  data: string,
  filterContentBlocks?: ContentBlockTransformer,
  sortContentBlocks?: ContentBlockTransformer
): ContentBlockDataRequestResult {
  const [requestKind = '', requestToken] = String(requestType).split('|');
  const dataArray: string[] = JSON.parse(data);
  const blocks: InAppContentBlock[] = dataArray.map((json: string) =>
    JSON.parse(json)
  );
  const transformer =
    requestKind === 'filter'
      ? filterContentBlocks
      : requestKind === 'sort'
        ? sortContentBlocks
        : undefined;

  if (!transformer) {
    return { requestKind, requestToken, inputCount: blocks.length };
  }

  const transformed = transformer(blocks);
  const responseData = transformed.map((block) => JSON.stringify(block));
  const responsePayload = requestToken
    ? JSON.stringify({ token: requestToken, data: responseData })
    : JSON.stringify(responseData);

  return {
    requestKind,
    requestToken,
    inputCount: blocks.length,
    outputCount: responseData.length,
    responsePayload,
  };
}
