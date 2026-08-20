import { resolveContentBlockDataRequest } from '../ContentBlockDataRequest';
import type { InAppContentBlock } from '../NativeExponea';

const firstBlock: InAppContentBlock = {
  id: 'first',
  name: 'First',
  placeholders: [],
};
const secondBlock: InAppContentBlock = {
  id: 'second',
  name: 'Second',
  placeholders: [],
};
const serializedBlocks = JSON.stringify([
  JSON.stringify(firstBlock),
  JSON.stringify(secondBlock),
]);

test('returns a tokenized filter response for its matching native request', () => {
  const filter = jest.fn((blocks) => [blocks[1]]);

  const result = resolveContentBlockDataRequest(
    'filter|filter-token',
    serializedBlocks,
    filter
  );

  expect(filter).toHaveBeenCalledWith([firstBlock, secondBlock]);
  expect(result).toEqual({
    requestKind: 'filter',
    requestToken: 'filter-token',
    inputCount: 2,
    outputCount: 1,
    responsePayload: JSON.stringify({
      token: 'filter-token',
      data: [JSON.stringify(secondBlock)],
    }),
  });
});

test('returns a tokenized sort response while preserving the custom order', () => {
  const sort = jest.fn((blocks) => [blocks[1], blocks[0]]);

  const result = resolveContentBlockDataRequest(
    'sort|sort-token',
    serializedBlocks,
    undefined,
    sort
  );

  expect(sort).toHaveBeenCalledWith([firstBlock, secondBlock]);
  expect(result).toEqual({
    requestKind: 'sort',
    requestToken: 'sort-token',
    inputCount: 2,
    outputCount: 2,
    responsePayload: JSON.stringify({
      token: 'sort-token',
      data: [JSON.stringify(secondBlock), JSON.stringify(firstBlock)],
    }),
  });
});

test('keeps the legacy array response format for untokenized filter requests', () => {
  const result = resolveContentBlockDataRequest(
    'filter',
    serializedBlocks,
    () => [firstBlock]
  );

  expect(result.responsePayload).toBe(
    JSON.stringify([JSON.stringify(firstBlock)])
  );
});
