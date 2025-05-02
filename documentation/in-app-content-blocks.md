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

## Integration of a placeholder view

You can integrate in-app content blocks by adding one or more placeholder views in your app. Each in-app content block must have a `Placeholder ID` specified in its [settings](https://documentation.bloomreach.com/engagement/docs/in-app-content-blocks#3-fill-the-settings) in Engagement. The SDK will display an in-app content block in the corresponding placeholder in the app if the current app user matches the target audience. In-app content block is shown until user interacts with it or placeholder view instance is reloaded programmatically.

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

## Integration of a carousel view

If you want to show multiple in-app content blocks to the user for the same `Placeholder ID`, consider using `ContentBlockCarouselView`. The SDK will display the in-app content blocks for the current app user in a loop, in order of `Priority`. The in-app content blocks are displayed in a loop until the user interacts with them or until the carousel view instance is reloaded programmatically.

If the carousel view's placeholder ID only matches a single in-app content block, it will behave like a static placeholder view with no loop effect.

### Add a carousel view

Add a carousel view with the specified `placeholderId` to your layout:

```typescript
<ContentBlockCarouselView
  style={{
    width: '100%',
  }}
  placeholderId={'example_carousel'}
  scrollDelay={5} // delay in seconds between automatic scroll; 0 for no scroll; default value is 3
  maxMessagesCount={5} // max count of visible content blocks; 0 for show all; default value is 0
/>
```

> 📘
>
> Refer to [CarouselScreen.tsx](https://github.com/exponea/exponea-react-native-sdk/blob/main/example/src/screens/CarouselScreen.tsx) in the [example app](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-example-app) for a reference implementation.

> 👍
>
> Always us descriptive, human-readable placeholder IDs. They are tracked as an event property and can be used for analytics within Engagement.

## Tracking

The SDK automatically tracks `banner` events for in-app content blocks with the following values for the `action` event property:

- `show`
  In-app content block has been displayed to user.
  Event is tracked everytime if Placeholder view is used. Carousel view tracks this event only if content block is shown for first time after `reload` (once per rotation cycle).
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

### Handle carousel presentation status

You can register a multiple callbacks to a carousel view instance to retrieve information for each update and/or change behaviour by setting the `trackActions` and `overrideDefaultBehavior` flags.

* trackActions
  * If `false`, events "close" and "click" on banners won't be tracked by the SDK. Events "show" and "error" are tracked regardless from this flag.
  * If `true`, events "close" and "click" are tracked by the SDK.
  * Default behaviour is as with value `true`, all events are tracked by the SDK
* overrideDefaultBehavior
  * If `true`, deep-links and universal links won't be opened by SDK. This does not affect tracking behaviour.
  * If `false`, deep-links and universal links will be opened by SDK.
  * Default behaviour is as with value `false`, action links are opened by SDK.

```typescript
<ContentBlockCarouselView
  style={{
    width: '100%',
  }}
  placeholderId={'example_carousel'}
  // If overrideDefaultBehavior is set to true, default action will not be performed (deep link, universal link, etc.)
  overrideDefaultBehavior={false}
  // If trackActions is set to false, click and close in-app content block events will not be tracked automatically
  trackActions={true}
  onMessageShown={(_placeholderId, contentBlock, index, count) => {
    // This is triggered on each scroll so 'contentBlock' parameter represents currently shown content block,
    // so as 'index' represents position index of currently shown content block
  }}
  onMessagesChanged={(count, contentBlocks) => {
    // This is triggered after 'reload' or if a content block is removed because interaction has been done
    // and message has to be shown until interaction.
  }}
  onNoMessageFound={(placeholderId) => {
    // This is triggered after `reload` when no content block has been found for a given placeholder.
  }}
  onError={(placeholderId, contentBlock, errorMessage) => {
    // This is triggered when an error occurs while loading or showing of content block.
    // Parameter `contentBlock` is the content block which caused the error or undefined in case of general problem.
    // Parameter `errorMessage` is the error message that describes the problem.
  }}
  onCloseClicked={(placeholderId, contentBlock) => {
    // This is triggered when a content block is closed.
  }}
  onActionClicked={(placeholderId, contentBlock, action) => {
    // This is triggered when a content block action is clicked.
    // Parameter `action` contains the action information.
  }}
/>
```

### Customize carousel view filtration and sorting

A carousel view filters available content blocks in the same way as a placeholder view:

- The content block must meet the `Schedule` setting configured in the Engagement web app
- The content block must meet the `Display` setting configured in the Engagement web app
- The content must be valid and supported by the SDK

The order in which content blocks are displayed is determined by:

1. By the `Priority` setting, descending
2. By the `Name`, ascending (alphabetically)

You can implement additional filtration and sorting by registering your own `filterContentBlocks` and `sortContentBlocks` on the carousel view instance:

```typescript
<ContentBlockCarouselView
  style={{
    width: '100%',
  }}
  placeholderId={'example_carousel'}
  filterContentBlocks={(source) => {
    // if you want keep default filtration, do not register this method
    // you can add your own filtration, for example ignore any item named "discarded"
    return source.filter((item) => item.name?.toLowerCase().indexOf('discarded') >= 0)
  }}
  sortContentBlocks={(source) => {
    // if you want to keep default sort, do not register this method
    // you can bring your own sorting, for example reverse default sorting result
    return source.reverse()
  }}
/>
```

> ❗️
>
> A carousel view accepts the results from the filtration and sorting implementations. Ensure that you return all wanted items as result from your implementations to avoid any missing items.

> ❗️
>
> A carousel view can be configured with `maxMessagesCount`. Any value higher than zero applies a maximum number of content blocks displayed, independently of the number of results from filtration and sorting methods. So if you return 10 items from filtration and sorting method but `maxMessagesCount` is set to 5 then only first 5 items from your results.

## Troubleshooting

This section provides helpful pointers for troubleshooting in-app content blocks issues.

> 👍 Enable verbose logging
> The SDK logs a lot of information in verbose mode while loading in-app content blocks. When troubleshooting in-app content block issues, first ensure to [set the SDK's log level](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-setup#log-level) to `VERBOSE`.

### In-app content block not displayed

- The SDK can only display an in-app content block after it has been fully loaded (including its content, any images, and its height). Therefore, the in-app content block may only show in the app after a delay.
- Always ensure that the placeholder IDs in the in-app content block configuration (in the Engagement web app) and in your mobile app match.

### In-app content block shows incorrect image

- To reduce the number of API calls and fetching time of in-app content blocks, the SDK caches the images contained in content blocks. Once the SDK downloads an image, an image with the same URL may not be downloaded again. If a content block contains a new image with the same URL as a previously used image, the previous image is displayed since it was already cached. For this reason, we recommend always using different URLs for different images.

### Log messages

While troubleshooting in-app content block issues, you can find useful information in the messages logged by the SDK at verbose log level.

Please refer to the [Android](https://documentation.bloomreach.com/engagement/docs/android-sdk-in-app-content-blocks#log-messages) and [iOS](https://documentation.bloomreach.com/engagement/docs/ios-sdk-in-app-content-blocks#log-messages) documentation for the relevant log messages for each platform.
    