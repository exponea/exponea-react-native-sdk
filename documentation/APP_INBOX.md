## App Inbox

Exponea SDK feature App Inbox allows you to use message list in your app. You can find information on creating your messages in [Exponea documentation](https://documentation.bloomreach.com/engagement/docs/app-inbox).

### Using App Inbox

Only required step to use App Inbox in your application is to add a button into your screen. Messages are then displayed by clicking on a button:

```typescript jsx
<AppInboxButton />
```

App Inbox button has registered a click action to show an App Inbox list screen.

No more work is required for showing App Inbox but may be customized in multiple ways.

## Default App Inbox behavior

Exponea SDK is fetching and showing an App Inbox for you automatically in default steps:

1. Shows a button to access App Inbox list (need to be done by developer)
2. Shows a screen for App Inbox list. Each item is shown with:
    1. Flag if message is read or unread
    2. Delivery time in human-readable form (i.e. `2 hours ago`)
    3. Single-lined title of message ended by '...' for longer value
    4. Two-lined content of message ended by '...' for longer value
    5. Squared image if message contains any
    6. Shows a loading state of list (indeterminate progress)
    7. Shows an empty state of list with title and message
    8. Shows an error state of list with title and description
3. Screen for App Inbox list calls a `Exponea.trackAppInboxOpened` on item click and marks message as read automatically
4. Shows a screen for App Inbox message detail that contains:
    1. Large squared image. A gray placeholder is shown if message has no image
    2. Delivery time in human-readable form (i.e. `2 hours ago`)
    3. Full title of message
    4. Full content of message
    5. Buttons for each reasonable action (actions to open browser link or invoking of universal link). Action that just opens current app is meaningless so is not listed
5. Screen for message detail calls `Exponea.trackAppInboxClick` on action button click automatically

> The behavior of `trackAppInboxOpened` and `trackAppInboxClick` may be affected by the tracking consent feature, which in enabled mode considers the requirement of explicit consent for tracking. Read more in [tracking consent documentation](./TRACKING_CONSENT.md).

### UI components styling

App Inbox screens are designed with love and to fulfill customers needs but may not fit design of your application. You are able to customize multiple colors and text appearances with simple configuration.

```typescript
Exponea.setAppInboxProvider({
      appInboxButton: {
        // ButtonStyle
        textOverride: 'text value',
        textColor: 'color',
        backgroundColor: 'color',
        showIcon: true,
        textSize: '12px',
        enabled: true,
        borderRadius: '5px',
        textWeight: 'bold|normal|100..900'
      },
      detailView: {
        title: {
          // TextViewStyle
          visible: true,
          textColor: 'color',
          textSize: '12px',
          textWeight: 'bold|normal|100..900',
          textOverride: 'text'
        },
        content: { /* TextViewStyle */ },
        receivedTime: { /* TextViewStyle */ },
        image: {
          // ImageViewStyle
          visible: true,
          backgroundColor: 'color'
        },
        button: { /* ButtonStyle */ }
      },
      listView: {
        emptyTitle:  { /* TextViewStyle */ },
        emptyMessage:  { /* TextViewStyle */ },
        errorTitle:  { /* TextViewStyle */ },
        errorMessage:  { /* TextViewStyle */ },
        progress: {
          // ProgressBarStyle
          visible: true,
          progressColor: 'color',
          backgroundColor: 'color'
        },
        list: {
          backgroundColor: 'color',
          item: {
            backgroundColor: 'color',
            readFlag: { /* ImageViewStyle */ },
            receivedTime:  { /* TextViewStyle */ },
            title:  { /* TextViewStyle */ },
            content:  { /* TextViewStyle */ },
            image: { /* ImageViewStyle */ }
          }
        }
      }
    })
```

Supported colors formats are:
* Short hex `#rgb` or with alpha `#rgba`
* Hex format `#rrggbb` or `#rrggbbaa`
* RGB format `rgb(255, 255, 255)`
* RGBA format `rgba(255, 255, 255, 1.0)` or `rgba(255 255 255 / 1.0)`
* ARGB format `argb(1.0, 255, 255, 255)`
* name format `yellow` (names has to be supported by Android/iOS platform)

Supported size formats are:
* Pixels `12px` or `12`
* Scaleable Pixels `12sp`
* Density-independent Pixels `12dp` or `12dip`
* Points `12pt`
* Inches `12in`
* Millimeters `12mm`

Supported text weight formats are:
* 'normal' - normal/regular style on both platforms
* 'bold' - bold style on both platforms
* Number from `100` to `900` - mainly usable on iOS platform. Can be used also on Android but with limitation (100-600 means 'normal'; 700-900 means 'bold')

> You may register your own styling at any time - before Exponea SDK init or later in some of your screens. Every action in scope of App Inbox is using currently registered styles. Nevertheless, we recommend to set your configuration right before Exponea SDK initialization.

### Localization

Exponea SDK contains only texts in EN translation. To modify this or add a localization, you are able to define customized strings.

For Android (i.e. in your `strings.xml` files) add:
```xml
<string name="exponea_inbox_button">Inbox</string>
<string name="exponea_inbox_title">Inbox</string>
<string name="exponea_inbox_defaultTitle">Inbox message</string>
<string name="exponea_inbox_emptyTitle">Empty Inbox</string>
<string name="exponea_inbox_emptyMessage">You have no messages yet.</string>
<string name="exponea_inbox_errorTitle">Something went wrong :(</string>
<string name="exponea_inbox_errorMessage">We could not retrieve your messages.</string>
<string name="exponea_inbox_mainActionTitle">See more</string>
```

For iOS (i.e. in your `Localizable.string` files) add:
```text
"exponea.inbox.button" = "Inbox";
"exponea.inbox.title" = "AppInbox";
"exponea.inbox.loading" = "Loading messages...";
"exponea.inbox.emptyTitle" = "Empty Inbox";
"exponea.inbox.emptyMessage" = "You have no messages yet.";
"exponea.inbox.errorTitle" = "Something went wrong :(";
"exponea.inbox.errorMessage" = "We could not retrieve your messages.";
"exponea.inbox.defaultTitle" = "Message";
"exponea.inbox.mainActionTitle" = "See more";
```

### UI components styling (only Android)

Please check these style-rules that are applied to UI components and override them (i.e. in your `styles.xml` files)

```xml
<style name="Theme.AppInboxListActivity" parent="@style/Theme.AppCompat.NoActionBar">
    <!-- Screen shows App Inbox list -->
    <!-- This style is applied to 'android:theme' activity parameter -->
</style>
<style name="Theme.AppInboxDetailActivity" parent="@style/Theme.AppCompat.NoActionBar">
    <!-- Screen shows App Inbox message detail -->
    <!-- This style is applied to 'android:theme' activity parameter -->
</style>
<style name="AppInboxItemReceivedTime">
    <!-- TextView shows delivery time in App Inbox list -->
    <!-- This style is applied to 'style' parameter -->
</style>
<style name="AppInboxItemTitle">
    <!-- TextView shows title in App Inbox list -->
    <!-- This style is applied to 'style' parameter -->
</style>
<style name="AppInboxItemContent">
    <!-- TextView shows message content in App Inbox list -->
    <!-- This style is applied to 'style' parameter -->
</style>
<style name="AppInboxDetailReceivedTime">
    <!-- TextView shows delivery time in message detail -->
    <!-- This style is applied to 'style' parameter -->
</style>
<style name="AppInboxDetailTitle">
    <!-- TextView shows title in message detail -->
    <!-- This style is applied to 'style' parameter -->
</style>
<style name="AppInboxDetailContent">
    <!-- TextView shows message content in message detail -->
    <!-- This style is applied to 'style' parameter -->
</style>
<style name="Theme.AppInboxAppBarOverlay" parent="ThemeOverlay.AppCompat.Dark.ActionBar">
    <!-- AppBarLayout is shown in both list and detail screens -->
    <!-- This style is applied to 'android:theme' parameter -->
</style>
<style name="Theme.AppInboxAppBarPopupOverlay" parent="ThemeOverlay.AppCompat.Light">
    <!-- Toolbar is shown inside AppBarLayout -->
    <!-- This style is applied to 'app:popupTheme' parameter -->
</style>
<style name="AppInboxButton" parent="@style/Widget.AppCompat.Button">
    <!-- Button opens App Inbox list screen -->
    <!-- This style is applied to 'style' button parameter -->
</style>
<style name="AppInboxActionButton" parent="@style/Widget.AppCompat.Button">
    <!-- Button invokes App Inbox message action in detail -->
    <!-- This style is applied to 'style' parameter -->
</style>
<style name="AppInboxEmptyStatusTitle">
    <!-- TextView shows title for App Inbox list empty state -->
    <!-- This style is applied to 'style' parameter -->
</style>
<style name="AppInboxEmptyStatusMessage">
    <!-- TextView shows message for App Inbox list empty state -->
    <!-- This style is applied to 'style' parameter -->
</style>
<style name="AppInboxErrorStatusTitle">
    <!-- TextView shows title for App Inbox list error state -->
    <!-- This style is applied to 'style' parameter -->
</style>
<style name="AppInboxErrorStatusMessage">
<!-- TextView shows message for App Inbox list error state -->
<!-- This style is applied to 'style' parameter -->
</style>
<style name="AppInboxStatusLoading" parent="android:Widget.DeviceDefault.ProgressBar.Large">
    <!-- ProgressBar shown for App Inbox list loading state -->
    <!-- This style is applied to 'style' parameter -->
</style>
```

## App Inbox data API

Exponea SDK provides methods to access App Inbox data directly without accessing UI layer at all.

### App Inbox load

App Inbox is assigned to existing customer account (defined by hardIds) so App Inbox is cleared in case of:

- calling any `Exponea.identifyCustomer` method
- calling any `Exponea.anonymize` method

To prevent a large data transferring on each fetch, App Inbox are stored locally and next loading is incremental. It means that first fetch contains whole App Inbox but next requests contain only new messages. You are freed by handling such a behavior, result data contains whole App Inbox but HTTP request in your logs may be empty for that call.
List of assigned App Inbox is done by

``` typescript
Exponea.fetchAppInbox()
  .then(list => {
    list.forEach(message => console.log(message))
  })
  .catch(error => console.log(error.message))
```

Exponea SDK provides API to get single message from App Inbox. To load it you need to pass a message ID:

``` typescript
Exponea.fetchAppInboxItem("<messageId>")
   .then(item => {
      console.log(item)
   })
   .catch(error => console.log(error.message))
```

Fetching of single message is still requesting for fetch of all messages (including incremental loading). But message data are returned from local repository in normal case (due to previous fetch of messages).

### App Inbox message read state

To set an App Inbox message read flag you need to pass a message:
```typescript
Exponea.markAppInboxAsRead(message)
```
> Marking a message as read by `markAppInboxAsRead` method is not invoking a tracking event for opening a message. To track an opened message, you need to call `Exponea.trackAppInboxOpened` method.

## Tracking events for App Inbox

Exponea SDK default behavior is tracking the events for you automatically. In case of your custom implementation, please use tracking methods in right places.

### Tracking opened App Inbox message

To track an opening of message detail, you should use method `Exponea.trackAppInboxOpened(MessageItem)` with opened message data.
The behaviour of `trackAppInboxOpened` may be affected by the tracking consent feature, which in enabled mode considers the requirement of explicit consent for tracking. Read more in [tracking consent documentation](./TRACKING_CONSENT.md).
If you want to avoid to consider tracking, you may use `Exponea.trackAppInboxOpenedWithoutTrackingConsent` instead. This method will do track event ignoring tracking consent state.

### Tracking clicked App Inbox message action

To track an invoking of action, you should use method `Exponea.trackAppInboxClick(MessageItemAction, MessageItem)` with clicked message action and data.
The behaviour of `trackAppInboxClick` may be affected by the tracking consent feature, which in enabled mode considers the requirement of explicit consent for tracking. Read more in [tracking consent documentation](./TRACKING_CONSENT.md).
If you want to avoid to consider tracking, you may use `Exponea.trackAppInboxClickWithoutTrackingConsent` instead. This method will do track event ignoring tracking consent state.
