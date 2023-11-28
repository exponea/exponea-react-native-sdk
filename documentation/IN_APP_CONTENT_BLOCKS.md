## In-app content blocks
Exponea SDK allows you to display native In-app content blocks based on definitions set up on the Exponea web application. You can find information on creating your messages in [Exponea documentation](https://documentation.bloomreach.com/engagement/docs/in-app-content-blocks)

In-app content block will be shown exactly where you'll place a placeholder UI view. You can register a placeholder view into your layout:

```typescript jsx
<InAppContentBlocksPlaceholder
  style={{
    width: '100%',
  }}
  placeholderId={'placeholder_1'}
/>
```

No more developer work is required; they work automatically after the SDK is initialized.
In-app content blocks are shown within placeholder view by its ID automatically based on conditions setup on the Exponea backend. Once a message passes those filters, the SDK will try to present the message.

### If displaying In-app content blocks has delay

Message is able to be shown only if it is fully loaded and also its images are loaded too. In case that message is not yet fully loaded (including its images) then you may experience delayed showing.

If you need to show In-app content block as soon as possible (ideally instantly) you may set a auto-prefetch of placeholders. In-app content blocks for these placeholders are loaded immediately after SDK initialization.

```typescript jsx
import Exponea from 'react-native-exponea-sdk'

Exponea.configure({
  // ... your configuration
  inAppContentBlockPlaceholdersAutoLoad: ['placeholder_1'],
}).catch(error => console.log(error))
```

### In-app content block images caching
To reduce the number of API calls, SDK is caching the images displayed in messages. Therefore, once the SDK downloads the image, an image with the same URL may not be downloaded again, and will not change, since it was already cached. For this reason, we recommend always using different URLs for different images.

### In-app content blocks tracking

In-app content blocks are tracked automatically by SDK. You may see these `action` values in customers tracked events:

- 'show' - event is tracked if message has been shown to user
- 'action' - event is tracked if user clicked on action button inside message. Event contains 'text' and 'link' properties that you might be interested in
- 'close' - event is tracked if user clicked on close button inside message
- 'error' - event is tracked if showing of message has failed. Event contains 'error' property with meaningfull description

> The behaviour of In-app content block tracking may be affected by the tracking consent feature, which in enabled mode considers the requirement of explicit consent for tracking. Read more in [tracking consent documentation](./TRACKING_CONSENT.md).
