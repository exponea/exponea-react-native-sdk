/* eslint-disable @typescript-eslint/no-unused-vars */
import {InAppMessage, InAppMessageButton,} from '../ExponeaType';
import {TestUtils} from "./TestUtils";
import {MockExponea} from "./MockExponea";
import {InAppMessageTestData} from "./InAppMessageTestData";

describe('InApp messages API', () => {
  let mockExponea: MockExponea;
  beforeEach(() => {
    mockExponea = new MockExponea()
  })

  test('track action with nulls - nonrich', async () => {
    await mockExponea.trackInAppMessageClick(
        InAppMessageTestData.buildInAppMessage(),
        undefined,
        undefined
    )
    expect(JSON.parse(mockExponea.lastArgumentsJson)).toStrictEqual(
        JSON.parse(TestUtils.readJsonFile('./src/test_data/in-app-click-nulls.json'))
    );
  });

  test('track action with nulls without consent - nonrich', async () => {
    await mockExponea.trackInAppMessageClickWithoutTrackingConsent(
        InAppMessageTestData.buildInAppMessage(),
        undefined,
        undefined
    )
    expect(JSON.parse(mockExponea.lastArgumentsJson)).toStrictEqual(
        JSON.parse(TestUtils.readJsonFile('./src/test_data/in-app-click-nulls.json'))
    );
  });

  test('track action with action - nonrich', async () => {
    await mockExponea.trackInAppMessageClick(
        InAppMessageTestData.buildInAppMessage(),
        'Click me!',
        'https://example.com'
    )
    expect(JSON.parse(mockExponea.lastArgumentsJson)).toStrictEqual(
        JSON.parse(TestUtils.readJsonFile('./src/test_data/in-app-click-minimal.json'))
    );
  });

  test('track action with action without consent - nonrich', async () => {
    await mockExponea.trackInAppMessageClickWithoutTrackingConsent(
        InAppMessageTestData.buildInAppMessage(),
        'Click me!',
        'https://example.com'
    )
    expect(JSON.parse(mockExponea.lastArgumentsJson)).toStrictEqual(
        JSON.parse(TestUtils.readJsonFile('./src/test_data/in-app-click-minimal.json'))
    );
  });

  test('track close without action - nonrich', async () => {
    await mockExponea.trackInAppMessageClose(
        InAppMessageTestData.buildInAppMessage(),
        undefined,
        false
    )
    expect(JSON.parse(mockExponea.lastArgumentsJson)).toStrictEqual(
        JSON.parse(TestUtils.readJsonFile('./src/test_data/in-app-close-minimal.json'))
    );
  });

  test('track close without action without consent - nonrich', async () => {
    await mockExponea.trackInAppMessageCloseWithoutTrackingConsent(
        InAppMessageTestData.buildInAppMessage(),
        undefined,
        false
    )
    expect(JSON.parse(mockExponea.lastArgumentsJson)).toStrictEqual(
        JSON.parse(TestUtils.readJsonFile('./src/test_data/in-app-close-minimal.json'))
    );
  });

  test('track close with action - nonrich', async () => {
    await mockExponea.trackInAppMessageClose(
        InAppMessageTestData.buildInAppMessage(),
        'Click me!',
        true
    )
    expect(JSON.parse(mockExponea.lastArgumentsJson)).toStrictEqual(
        JSON.parse(TestUtils.readJsonFile('./src/test_data/in-app-close-complete.json'))
    );
  });

  test('track close with action without consent - nonrich', async () => {
    await mockExponea.trackInAppMessageCloseWithoutTrackingConsent(
        InAppMessageTestData.buildInAppMessage(),
        'Click me!',
        true
    )
    expect(JSON.parse(mockExponea.lastArgumentsJson)).toStrictEqual(
        JSON.parse(TestUtils.readJsonFile('./src/test_data/in-app-close-complete.json'))
    );
  });

  test('invoke in-app callback for shown message - nonrich', async () => {
    const messageSlot = TestUtils.captureSlot<InAppMessage>()
    mockExponea.setInAppMessageCallback({
      overrideDefaultBehavior: false,
      trackActions: false,
      inAppMessageClickAction(message: InAppMessage, button: InAppMessageButton): void {
        fail("Invalid callback method has been invoked")
      },
      inAppMessageCloseAction(message: InAppMessage, button: InAppMessageButton | undefined, interaction: boolean): void {
        fail("Invalid callback method has been invoked")
      },
      inAppMessageError(message: InAppMessage | undefined, errorMessage: string): void {
        fail("Invalid callback method has been invoked")
      },
      inAppMessageShown(message: InAppMessage): void {
        messageSlot.capture(message)
      }
    })
    mockExponea.simulateEmit('inAppAction', TestUtils.readJsonFile('./src/test_data/in-app-shown.json'))
    expect(messageSlot.isCaptured).toBe(true)
    expect(messageSlot.captured.id).toBe('5dd86f44511946ea55132f29')
  });

  test('invoke in-app callback for closed message without action - nonrich', async () => {
    const messageSlot = TestUtils.captureSlot<InAppMessage>()
    const buttonSlot = TestUtils.captureSlot<InAppMessageButton|undefined>()
    const interactionSlot = TestUtils.captureSlot<boolean>()
    mockExponea.setInAppMessageCallback({
      overrideDefaultBehavior: false,
      trackActions: false,
      inAppMessageClickAction(message: InAppMessage, button: InAppMessageButton): void {
        fail("Invalid callback method has been invoked")
      },
      inAppMessageCloseAction(message: InAppMessage, button: InAppMessageButton | undefined, interaction: boolean): void {
        messageSlot.capture(message)
        buttonSlot.capture(button)
        interactionSlot.capture(interaction)
      },
      inAppMessageError(message: InAppMessage | undefined, errorMessage: string): void {
        fail("Invalid callback method has been invoked")
      },
      inAppMessageShown(message: InAppMessage): void {
        fail("Invalid callback method has been invoked")
      }
    })
    mockExponea.simulateEmit('inAppAction', TestUtils.readJsonFile('./src/test_data/in-app-close-minimal.json'))
    expect(messageSlot.isCaptured).toBe(true)
    expect(messageSlot.captured.id).toBe('5dd86f44511946ea55132f29')
    expect(buttonSlot.isCaptured).toBe(true)
    expect(buttonSlot.captured).toBeUndefined()
    expect(interactionSlot.isCaptured).toBe(true)
    expect(interactionSlot.captured).toBe(false)
  });

  test('invoke in-app callback for closed message with action - nonrich', async () => {
    const messageSlot = TestUtils.captureSlot<InAppMessage>()
    const buttonSlot = TestUtils.captureSlot<InAppMessageButton|undefined>()
    const interactionSlot = TestUtils.captureSlot<boolean>()
    mockExponea.setInAppMessageCallback({
      overrideDefaultBehavior: false,
      trackActions: false,
      inAppMessageClickAction(message: InAppMessage, button: InAppMessageButton): void {
        fail("Invalid callback method has been invoked")
      },
      inAppMessageCloseAction(message: InAppMessage, button: InAppMessageButton | undefined, interaction: boolean): void {
        messageSlot.capture(message)
        buttonSlot.capture(button)
        interactionSlot.capture(interaction)
      },
      inAppMessageError(message: InAppMessage | undefined, errorMessage: string): void {
        fail("Invalid callback method has been invoked")
      },
      inAppMessageShown(message: InAppMessage): void {
        fail("Invalid callback method has been invoked")
      }
    })
    mockExponea.simulateEmit('inAppAction', TestUtils.readJsonFile('./src/test_data/in-app-close-complete.json'))
    expect(messageSlot.isCaptured).toBe(true)
    expect(messageSlot.captured.id).toBe('5dd86f44511946ea55132f29')
    expect(buttonSlot.isCaptured).toBe(true)
    expect(buttonSlot.captured?.text).toBe('Click me!')
    expect(interactionSlot.isCaptured).toBe(true)
    expect(interactionSlot.captured).toBe(true)
  });

  test('invoke in-app callback for clicked message with action - nonrich', async () => {
    const messageSlot = TestUtils.captureSlot<InAppMessage>()
    const buttonSlot = TestUtils.captureSlot<InAppMessageButton>()
    mockExponea.setInAppMessageCallback({
      overrideDefaultBehavior: false,
      trackActions: false,
      inAppMessageClickAction(message: InAppMessage, button: InAppMessageButton): void {
        messageSlot.capture(message)
        buttonSlot.capture(button)
      },
      inAppMessageCloseAction(message: InAppMessage, button: InAppMessageButton | undefined, interaction: boolean): void {
        fail("Invalid callback method has been invoked")
      },
      inAppMessageError(message: InAppMessage | undefined, errorMessage: string): void {
        fail("Invalid callback method has been invoked")
      },
      inAppMessageShown(message: InAppMessage): void {
        fail("Invalid callback method has been invoked")
      }
    })
    mockExponea.simulateEmit('inAppAction', TestUtils.readJsonFile('./src/test_data/in-app-click-minimal.json'))
    expect(messageSlot.isCaptured).toBe(true)
    expect(messageSlot.captured.id).toBe('5dd86f44511946ea55132f29')
    expect(buttonSlot.isCaptured).toBe(true)
    expect(buttonSlot.captured.text).toBe('Click me!')
    expect(buttonSlot.captured.url).toBe('https://example.com')
  });

  test('invoke in-app callback for error report without message', async () => {
    const messageSlot = TestUtils.captureSlot<InAppMessage|undefined>()
    const errorSlot = TestUtils.captureSlot<string>()
    mockExponea.setInAppMessageCallback({
      overrideDefaultBehavior: false,
      trackActions: false,
      inAppMessageClickAction(message: InAppMessage, button: InAppMessageButton): void {
        fail("Invalid callback method has been invoked")
      },
      inAppMessageCloseAction(message: InAppMessage, button: InAppMessageButton | undefined, interaction: boolean): void {
        fail("Invalid callback method has been invoked")
      },
      inAppMessageError(message: InAppMessage | undefined, errorMessage: string): void {
        messageSlot.capture(message)
        errorSlot.capture(errorMessage)
      },
      inAppMessageShown(message: InAppMessage): void {
        fail("Invalid callback method has been invoked")
      }
    })
    mockExponea.simulateEmit('inAppAction', TestUtils.readJsonFile('./src/test_data/in-app-error-minimal.json'))
    expect(messageSlot.isCaptured).toBe(true)
    expect(messageSlot.captured).toBeUndefined()
    expect(errorSlot.isCaptured).toBe(true)
    expect(errorSlot.captured).toBe('Something goes wrong')
  });

  test('invoke in-app callback for error report with message - nonrich', async () => {
    const messageSlot = TestUtils.captureSlot<InAppMessage|undefined>()
    const errorSlot = TestUtils.captureSlot<string>()
    mockExponea.setInAppMessageCallback({
      overrideDefaultBehavior: false,
      trackActions: false,
      inAppMessageClickAction(message: InAppMessage, button: InAppMessageButton): void {
        fail("Invalid callback method has been invoked")
      },
      inAppMessageCloseAction(message: InAppMessage, button: InAppMessageButton | undefined, interaction: boolean): void {
        fail("Invalid callback method has been invoked")
      },
      inAppMessageError(message: InAppMessage | undefined, errorMessage: string): void {
        messageSlot.capture(message)
        errorSlot.capture(errorMessage)
      },
      inAppMessageShown(message: InAppMessage): void {
        fail("Invalid callback method has been invoked")
      }
    })
    mockExponea.simulateEmit('inAppAction', TestUtils.readJsonFile('./src/test_data/in-app-error-complete.json'))
    expect(messageSlot.isCaptured).toBe(true)
    expect(messageSlot.captured?.id).toBe('5dd86f44511946ea55132f29')
    expect(errorSlot.isCaptured).toBe(true)
    expect(errorSlot.captured).toBe('Something goes wrong')
  });

  test('track action with nulls - richstyle', async () => {
    await mockExponea.trackInAppMessageClick(
        InAppMessageTestData.buildInAppMessage({isRichText: true}),
        undefined,
        undefined
    )
    expect(JSON.parse(mockExponea.lastArgumentsJson)).toStrictEqual(
        JSON.parse(TestUtils.readJsonFile('./src/test_data/in-app-click-nulls-richstyle.json'))
    );
  });

  test('track action with nulls without consent - richstyle', async () => {
    await mockExponea.trackInAppMessageClickWithoutTrackingConsent(
        InAppMessageTestData.buildInAppMessage({isRichText: true}),
        undefined,
        undefined
    )
    expect(JSON.parse(mockExponea.lastArgumentsJson)).toStrictEqual(
        JSON.parse(TestUtils.readJsonFile('./src/test_data/in-app-click-nulls-richstyle.json'))
    );
  });

  test('track action with action - richstyle', async () => {
    await mockExponea.trackInAppMessageClick(
        InAppMessageTestData.buildInAppMessage({isRichText: true}),
        'Click me!',
        'https://example.com'
    )
    expect(JSON.parse(mockExponea.lastArgumentsJson)).toStrictEqual(
        JSON.parse(TestUtils.readJsonFile('./src/test_data/in-app-click-minimal-richstyle.json'))
    );
  });

  test('track action with action without consent - richstyle', async () => {
    await mockExponea.trackInAppMessageClickWithoutTrackingConsent(
        InAppMessageTestData.buildInAppMessage({isRichText: true}),
        'Click me!',
        'https://example.com'
    )
    expect(JSON.parse(mockExponea.lastArgumentsJson)).toStrictEqual(
        JSON.parse(TestUtils.readJsonFile('./src/test_data/in-app-click-minimal-richstyle.json'))
    );
  });

  test('track close without action - richstyle', async () => {
    await mockExponea.trackInAppMessageClose(
        InAppMessageTestData.buildInAppMessage({isRichText: true}),
        undefined,
        false
    )
    expect(JSON.parse(mockExponea.lastArgumentsJson)).toStrictEqual(
        JSON.parse(TestUtils.readJsonFile('./src/test_data/in-app-close-minimal-richstyle.json'))
    );
  });

  test('track close without action without consent - richstyle', async () => {
    await mockExponea.trackInAppMessageCloseWithoutTrackingConsent(
        InAppMessageTestData.buildInAppMessage({isRichText: true}),
        undefined,
        false
    )
    expect(JSON.parse(mockExponea.lastArgumentsJson)).toStrictEqual(
        JSON.parse(TestUtils.readJsonFile('./src/test_data/in-app-close-minimal-richstyle.json'))
    );
  });

  test('track close with action - richstyle', async () => {
    await mockExponea.trackInAppMessageClose(
        InAppMessageTestData.buildInAppMessage({isRichText: true}),
        'Click me!',
        true
    )
    expect(JSON.parse(mockExponea.lastArgumentsJson)).toStrictEqual(
        JSON.parse(TestUtils.readJsonFile('./src/test_data/in-app-close-complete-richstyle.json'))
    );
  });

  test('track close with action without consent - richstyle', async () => {
    await mockExponea.trackInAppMessageCloseWithoutTrackingConsent(
        InAppMessageTestData.buildInAppMessage({isRichText: true}),
        'Click me!',
        true
    )
    expect(JSON.parse(mockExponea.lastArgumentsJson)).toStrictEqual(
        JSON.parse(TestUtils.readJsonFile('./src/test_data/in-app-close-complete-richstyle.json'))
    );
  });

  test('invoke in-app callback for shown message - richstyle', async () => {
    const messageSlot = TestUtils.captureSlot<InAppMessage>()
    mockExponea.setInAppMessageCallback({
      overrideDefaultBehavior: false,
      trackActions: false,
      inAppMessageClickAction(message: InAppMessage, button: InAppMessageButton): void {
        fail("Invalid callback method has been invoked")
      },
      inAppMessageCloseAction(message: InAppMessage, button: InAppMessageButton | undefined, interaction: boolean): void {
        fail("Invalid callback method has been invoked")
      },
      inAppMessageError(message: InAppMessage | undefined, errorMessage: string): void {
        fail("Invalid callback method has been invoked")
      },
      inAppMessageShown(message: InAppMessage): void {
        messageSlot.capture(message)
      }
    })
    mockExponea.simulateEmit('inAppAction', TestUtils.readJsonFile('./src/test_data/in-app-shown-richstyle.json'))
    expect(messageSlot.isCaptured).toBe(true)
    expect(messageSlot.captured.id).toBe('5dd86f44511946ea55132f29')
  });

  test('invoke in-app callback for closed message without action - richstyle', async () => {
    const messageSlot = TestUtils.captureSlot<InAppMessage>()
    const buttonSlot = TestUtils.captureSlot<InAppMessageButton|undefined>()
    const interactionSlot = TestUtils.captureSlot<boolean>()
    mockExponea.setInAppMessageCallback({
      overrideDefaultBehavior: false,
      trackActions: false,
      inAppMessageClickAction(message: InAppMessage, button: InAppMessageButton): void {
        fail("Invalid callback method has been invoked")
      },
      inAppMessageCloseAction(message: InAppMessage, button: InAppMessageButton | undefined, interaction: boolean): void {
        messageSlot.capture(message)
        buttonSlot.capture(button)
        interactionSlot.capture(interaction)
      },
      inAppMessageError(message: InAppMessage | undefined, errorMessage: string): void {
        fail("Invalid callback method has been invoked")
      },
      inAppMessageShown(message: InAppMessage): void {
        fail("Invalid callback method has been invoked")
      }
    })
    mockExponea.simulateEmit('inAppAction', TestUtils.readJsonFile('./src/test_data/in-app-close-minimal-richstyle.json'))
    expect(messageSlot.isCaptured).toBe(true)
    expect(messageSlot.captured.id).toBe('5dd86f44511946ea55132f29')
    expect(buttonSlot.isCaptured).toBe(true)
    expect(buttonSlot.captured).toBeUndefined()
    expect(interactionSlot.isCaptured).toBe(true)
    expect(interactionSlot.captured).toBe(false)
  });

  test('invoke in-app callback for closed message with action - richstyle', async () => {
    const messageSlot = TestUtils.captureSlot<InAppMessage>()
    const buttonSlot = TestUtils.captureSlot<InAppMessageButton|undefined>()
    const interactionSlot = TestUtils.captureSlot<boolean>()
    mockExponea.setInAppMessageCallback({
      overrideDefaultBehavior: false,
      trackActions: false,
      inAppMessageClickAction(message: InAppMessage, button: InAppMessageButton): void {
        fail("Invalid callback method has been invoked")
      },
      inAppMessageCloseAction(message: InAppMessage, button: InAppMessageButton | undefined, interaction: boolean): void {
        messageSlot.capture(message)
        buttonSlot.capture(button)
        interactionSlot.capture(interaction)
      },
      inAppMessageError(message: InAppMessage | undefined, errorMessage: string): void {
        fail("Invalid callback method has been invoked")
      },
      inAppMessageShown(message: InAppMessage): void {
        fail("Invalid callback method has been invoked")
      }
    })
    mockExponea.simulateEmit('inAppAction', TestUtils.readJsonFile('./src/test_data/in-app-close-complete-richstyle.json'))
    expect(messageSlot.isCaptured).toBe(true)
    expect(messageSlot.captured.id).toBe('5dd86f44511946ea55132f29')
    expect(buttonSlot.isCaptured).toBe(true)
    expect(buttonSlot.captured?.text).toBe('Click me!')
    expect(interactionSlot.isCaptured).toBe(true)
    expect(interactionSlot.captured).toBe(true)
  });

  test('invoke in-app callback for clicked message with action - richstyle', async () => {
    const messageSlot = TestUtils.captureSlot<InAppMessage>()
    const buttonSlot = TestUtils.captureSlot<InAppMessageButton>()
    mockExponea.setInAppMessageCallback({
      overrideDefaultBehavior: false,
      trackActions: false,
      inAppMessageClickAction(message: InAppMessage, button: InAppMessageButton): void {
        messageSlot.capture(message)
        buttonSlot.capture(button)
      },
      inAppMessageCloseAction(message: InAppMessage, button: InAppMessageButton | undefined, interaction: boolean): void {
        fail("Invalid callback method has been invoked")
      },
      inAppMessageError(message: InAppMessage | undefined, errorMessage: string): void {
        fail("Invalid callback method has been invoked")
      },
      inAppMessageShown(message: InAppMessage): void {
        fail("Invalid callback method has been invoked")
      }
    })
    mockExponea.simulateEmit('inAppAction', TestUtils.readJsonFile('./src/test_data/in-app-click-minimal-richstyle.json'))
    expect(messageSlot.isCaptured).toBe(true)
    expect(messageSlot.captured.id).toBe('5dd86f44511946ea55132f29')
    expect(buttonSlot.isCaptured).toBe(true)
    expect(buttonSlot.captured.text).toBe('Click me!')
    expect(buttonSlot.captured.url).toBe('https://example.com')
  });

  test('invoke in-app callback for error report with message - richstyle', async () => {
    const messageSlot = TestUtils.captureSlot<InAppMessage|undefined>()
    const errorSlot = TestUtils.captureSlot<string>()
    mockExponea.setInAppMessageCallback({
      overrideDefaultBehavior: false,
      trackActions: false,
      inAppMessageClickAction(message: InAppMessage, button: InAppMessageButton): void {
        fail("Invalid callback method has been invoked")
      },
      inAppMessageCloseAction(message: InAppMessage, button: InAppMessageButton | undefined, interaction: boolean): void {
        fail("Invalid callback method has been invoked")
      },
      inAppMessageError(message: InAppMessage | undefined, errorMessage: string): void {
        messageSlot.capture(message)
        errorSlot.capture(errorMessage)
      },
      inAppMessageShown(message: InAppMessage): void {
        fail("Invalid callback method has been invoked")
      }
    })
    mockExponea.simulateEmit('inAppAction', TestUtils.readJsonFile('./src/test_data/in-app-error-complete-richstyle.json'))
    expect(messageSlot.isCaptured).toBe(true)
    expect(messageSlot.captured?.id).toBe('5dd86f44511946ea55132f29')
    expect(errorSlot.isCaptured).toBe(true)
    expect(errorSlot.captured).toBe('Something goes wrong')
  });
});
