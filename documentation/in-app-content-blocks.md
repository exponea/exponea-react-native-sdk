---
title: In-app content blocks
excerpt: Display native in-app content blocks based on definitions set up in Engagement using the React Native SDK
slug: react-native-sdk-in-app-content-blocks
categorySlug: integrations
parentDocSlug: react-native-sdk-in-app-personalization
---

In-app content blocks provide a way to display campaigns within your mobile applications that seamlessly blend with the overall app design. Unlike [in-app messages](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-in-app-messages) that appear as overlays or pop-ups demanding immediate attention, in-app content blocks display inline with the app's existing content.

You can strategically position placeholders for in-app content blocks within your app. You can customize the behavior and presentation to meet your specific requirements.

> 📘
>
> Refer to the [In-app content blocks](https://documentation.bloomreach.com/engagement/docs/in-app-content-blocks) user guide for instructions on how to create in-app content blocks in Engagement.

![In-app content blocks in the example app](https://raw.githubusercontent.com/exponea/exponea-react-native-sdk/main/Documentation/images/app-content-blocks.png)

## Integration

You can integrate in-app content blocks by adding one or more placeholder views in your app. Each in-app content block must have a `Placeholder ID` specified in its [settings](https://documentation.bloomreach.com/engagement/docs/in-app-content-blocks#3-fill-the-settings) in Engagement. The SDK will display an in-app content block in the corresponding placeholder in the app if the current app user matches the target audience.

### Add a placeholder view

Add a placeholder view with the specified `placeholderId` to your layout:

```typescript
<InAppContentBlocksPlaceholder
  style={{
    width: '100%',
  }}
  placeholderId={'placeholder_1'}
/>
```

The in-app content block will be shown exactly where you'll place the placeholder UI view.

After the SDK [initializes](https://documentation.bloomreach.com/engagement/docs/android-sdk-setup#initialize-the-sdk), it will identify any in-app content blocks with matching placeholder ID and select the one with the highest priority to display within the placeholder view.

> 📘
>
> Refer to [InAppCbScreen.tsx](https://github.com/exponea/exponea-react-native-sdk/blob/main/example/src/screens/InAppCbScreen.tsx) in the [example app](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-example-app) for a reference implementation.

> 👍
>
> Always us descriptive, human-readable placeholder IDs. They are tracked as an event property and can be used for analytics within Engagement.

## Tracking

The SDK automatically tracks `banner` events for in-app content blocks with the following values for the `action` event property:

- `show`
  In-app content block displayed to user.
- `action`
  User clicked on action button inside in-app content block. The event also contains the corresponding `text` and `link` properties.
- `close`
  User clicked on close button inside in-app content block.
- `error`
  Displaying in-app content block failed. The event contains an `error` property with an error message.

> ❗️
>
> The behavior of in-app content block tracking may be affected by the tracking consent feature, which in enabled mode requires explicit consent for tracking. Refer to the [consent documentation](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-tracking-consent) documentation for details.

## Customization

### Prefetch in-app content blocks

The SDK can only display an in-app content block after it has been fully loaded (including its content, any images, and its height). Therefore, the in-app content block may only show in the app after a delay.

You may prefetch in-app content blocks for specific placeholders to make them display as soon as possible.

```typescript
import Exponea from 'react-native-exponea-sdk'

Exponea.configure({
  // ... your configuration
  inAppContentBlockPlaceholdersAutoLoad: ['placeholder_1'],
}).catch(error => console.log(error))
```

## Troubleshooting

This section provides helpful pointers for troubleshooting in-app content block issues.

> 👍 Enable Verbose Logging
> The SDK logs a lot of information in verbose mode while loading in-app content blocks. When troubleshooting in-app content block issues, first ensure to [set the SDK's log level](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-setup#log-level) to `VERBOSE`.

### In-app content block not displayed

- The SDK can only display an in-app content block after it has been fully loaded (including its content, any images, and its height). Therefore, the in-app content block may only show in the app after a delay.
- Always ensure that the placeholder IDs in the in-app content block configuration (in the Engagement web app) and in your mobile app match.

### In-app content block shows incorrect image

- To reduce the number of API calls and fetching time of in-app content blocks, the SDK caches the images contained in content blocks. Once the SDK downloads an image, an image with the same URL may not be downloaded again. If a content block contains a new image with the same URL as a previously used image, the previous image is displayed since it was already cached. For this reason, we recommend always using different URLs for different images.

### Log messages

While troubleshooting in-app content block issues, you can find useful information in the messages logged by the SDK at verbose log level.

Please refer to the [Android](https://documentation.bloomreach.com/engagement/docs/android-sdk-in-app-content-blocks#log-messages) and [iOS](https://documentation.bloomreach.com/engagement/docs/ios-sdk-in-app-content-blocks#log-messages) documentation for the relevant log messages for each platform.
    