import NativeExponea from '../NativeExponea';
import { Exponea } from '../ExponeaImpl';
import EventType from '../EventType';

jest.mock('../NativeExponea', () => ({
  __esModule: true,
  default: {
    anonymize: jest.fn(() => Promise.resolve()),
  },
}));

const mockAnonymize = NativeExponea.anonymize as ReturnType<typeof jest.fn>;

const PROJECT_TOKEN = 'mock-project-token';
const AUTH_TOKEN = 'mock-authorization-token';
const STREAM_ID = 'mock-stream-id';

beforeEach(() => {
  mockAnonymize.mockClear();
});

test('anonymize warns when StreamConfig is used with integrationRouteMap', async () => {
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

  await Exponea.anonymize(
    { streamId: STREAM_ID },
    {
      [EventType.BANNER]: [
        { projectToken: PROJECT_TOKEN, authorizationToken: AUTH_TOKEN },
      ],
    }
  );

  expect(warnSpy).toHaveBeenCalledWith(
    "'integrationRouteMap' is not supported with 'StreamConfig' and will be ignored."
  );
  warnSpy.mockRestore();
});

test('anonymize does not warn when ProjectConfig is used with integrationRouteMap', async () => {
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

  await Exponea.anonymize(
    { projectToken: PROJECT_TOKEN, authorizationToken: AUTH_TOKEN },
    {
      [EventType.BANNER]: [
        { projectToken: PROJECT_TOKEN, authorizationToken: AUTH_TOKEN },
      ],
    }
  );

  expect(warnSpy).not.toHaveBeenCalled();
  warnSpy.mockRestore();
});

test('anonymize does not warn when StreamConfig is used without integrationRouteMap', async () => {
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

  await Exponea.anonymize({ streamId: STREAM_ID });

  expect(warnSpy).not.toHaveBeenCalled();
  warnSpy.mockRestore();
});

test('anonymize passes args through to native unchanged', async () => {
  const routeMap = {
    [EventType.BANNER]: [
      { projectToken: PROJECT_TOKEN, authorizationToken: AUTH_TOKEN },
    ],
  };
  const integrationConfig = {
    projectToken: PROJECT_TOKEN,
    authorizationToken: AUTH_TOKEN,
  };

  await Exponea.anonymize(integrationConfig, routeMap);

  expect(mockAnonymize).toHaveBeenCalledWith(integrationConfig, routeMap);
});
