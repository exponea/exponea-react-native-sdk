enum EventType {
  /** Install event is fired only once when the app is first installed */
  INSTALL = 'INSTALL',

  /** Session start event used to mark the start of a session, typically when an app comes to foreground */
  SESSION_START = 'SESSION_START',

  /** Session end event used to mark the end of a session, typically when an app goes to background */
  SESSION_END = 'SESSION_END',

  /** Custom event tracking, used to report any of your custom events */
  TRACK_EVENT = 'TRACK_EVENT',

  /** Tracking of customers is used to identify a current customer with some identifier */
  TRACK_CUSTOMER = 'TRACK_CUSTOMER',

  /** Virtual and hard payments */
  PAYMENT = 'PAYMENT',

  /** Event used for registering the push notifications token of the device with Exponea */
  PUSH_TOKEN = 'PUSH_TOKEN',

  /** For tracking that push notification has been delivered */
  PUSH_DELIVERED = 'PUSH_DELIVERED',

  /** For tracking that a push notification has been opened */
  PUSH_OPENED = 'PUSH_OPENED',

  /** For tracking user interaction with links containing campaign data(deeplinks) */
  CAMPAIGN_CLICK = 'CAMPAIGN_CLICK',

  /** For tracking in-app message related events */
  BANNER = 'BANNER',
}

export default EventType;
