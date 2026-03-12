/**
 * @format
 */

import 'react-native';
jest.mock('react-native-gesture-handler', () =>
  require('react-native-gesture-handler/jestSetup'),
);
import React from 'react';
import {Linking, type EmitterSubscription} from 'react-native';
import App from '../src/App';

// Note: import explicitly to use the types shipped with jest.
import '@jest/globals';

import {act, render} from '@testing-library/react-native';

beforeAll(() => {
  jest
    .spyOn(Linking, 'addEventListener')
    .mockImplementation(
      () => ({remove: jest.fn()} as unknown as EmitterSubscription),
    );
  jest.spyOn(Linking, 'getInitialURL').mockResolvedValue(null);
});

afterAll(() => {
  jest.restoreAllMocks();
});

test('renders correctly', async () => {
  render(<App />);
  await act(async () => {
    await Promise.resolve();
  });
});
