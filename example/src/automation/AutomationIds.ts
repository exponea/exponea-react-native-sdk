export const AvailableAutomationIds = {
  AUTH_TITLE: 'lbl_auth_title',
  AUTH_MODE_PROJECT: 'btn_auth_mode_project',
  AUTH_MODE_STREAM: 'btn_auth_mode_stream',
  AUTH_PROJECT_TOKEN: 'fld_auth_project_token',
  AUTH_AUTHORIZATION_TOKEN: 'fld_auth_authorization_token',
  AUTH_ADVANCED_AUTH: 'fld_auth_advanced_auth',
  AUTH_STREAM_ID: 'fld_auth_stream_id',
  AUTH_JWT_KEY_ID: 'fld_auth_jwt_key_id',
  AUTH_JWT_SECRET: 'fld_auth_jwt_secret',
  AUTH_REGISTERED_ID: 'fld_auth_registered_id',
  AUTH_API_URL: 'fld_auth_api_url',
  AUTH_APPLICATION_ID: 'fld_auth_application_id',
  AUTH_START: 'btn_auth_start',
  AUTH_CLEAR_LOCAL_DATA: 'btn_auth_clear_local_data',

  STATUS_SDK_INDICATOR: 'status_sdk_indicator',
  OPEN_LOGS: 'btn_open_logs',
  NAV_FETCHING: 'btn_nav_fetching',
  NAV_TRACKING: 'btn_nav_tracking',
  NAV_FLUSHING: 'btn_nav_flushing',
  NAV_ANONYMIZE: 'btn_nav_anonymize',
  NAV_CONTENT_BLOCKS: 'btn_nav_content_blocks',

  FETCH_CONSENTS: 'btn_fetch_consents',
  FETCH_RECOMMENDATIONS: 'btn_fetch_recommendations',
  FETCH_SEGMENTS: 'btn_fetch_segments',
  OPEN_INBOX: 'btn_open_inbox',
  CLEAR_RESULT: 'btn_clear_result',
  FETCH_RESULT: 'lbl_fetch_result',

  RECOMMENDATION_ID: 'fld_recommendation_id',
  RECOMMENDATION_DIALOG_CANCEL: 'btn_recommendation_dialog_cancel',
  RECOMMENDATION_DIALOG_FETCH: 'btn_recommendation_dialog_fetch',

  COOKIE_ID: 'lbl_cookie_id',
  IDENTIFY_CUSTOMER: 'btn_identify_customer',
  SET_AUTH_TOKEN: 'btn_set_auth_token',
  TRACK_CUSTOM_EVENT: 'btn_track_custom_event',
  TRACK_PAYMENT: 'btn_track_payment',
  TRACK_PAGE_VIEW: 'btn_track_page_view',
  REQUEST_PUSH: 'btn_request_push',
  TRACK_FCM_TOKEN: 'btn_track_fcm_token',
  TRACK_PUSH_DELIVERED: 'btn_track_push_delivered',
  TRACK_PUSH_CLICKED: 'btn_track_push_clicked',

  IDENTIFY_ATTR_NAME: 'fld_identify_attr_name',
  IDENTIFY_ATTR_VALUE: 'fld_identify_attr_value',
  IDENTIFY_ADD_ATTR: 'btn_identify_add_attr',
  IDENTIFY_ATTRS_JSON: 'lbl_identify_attrs_json',
  IDENTIFY: 'btn_identify',
  IDENTIFY_AUTH: 'btn_identify_auth',
  IDENTIFY_HARD_ID_KEY: 'fld_identify_hard_id_key',
  IDENTIFY_HARD_ID_VALUE: 'fld_identify_hard_id_value',
  IDENTIFY_HARD_ID_ADD: 'btn_identify_hard_id_add',

  INAPP_PRESET: 'sel_inapp_preset',
  INAPP_PRESET_SELECTED_LABEL: 'lbl_inapp_preset_selected',
  EVENT_NAME: 'fld_event_name',
  EVENT_ATTR_NAME: 'fld_event_attr_name',
  EVENT_ATTR_VALUE: 'fld_event_attr_value',
  EVENT_ADD_ATTR: 'btn_event_add_attr',
  EVENT_PROPS_JSON: 'lbl_event_props_json',
  TRACK_EVENT: 'btn_track_event',

  TAB_FLUSH_MODE: 'tab_flush_mode',
  TAB_FLUSH_PERIOD: 'tab_flush_period',
  TAB_LOG_LEVEL: 'tab_log_level',
  GET_FLUSH_MODE: 'btn_get_flush_mode',
  CURRENT_FLUSH_MODE: 'lbl_current_flush_mode',
  FLUSH_MODE_IMMEDIATE: 'btn_flush_mode_immediate',
  FLUSH_MODE_PERIOD: 'btn_flush_mode_period',
  FLUSH_MODE_APP_CLOSE: 'btn_flush_mode_app_close',
  FLUSH_MODE_MANUAL: 'btn_flush_mode_manual',
  GET_FLUSH_PERIOD: 'btn_get_flush_period',
  CURRENT_FLUSH_PERIOD: 'lbl_current_flush_period',
  FLUSH_PERIOD_30: 'btn_flush_period_30',
  FLUSH_PERIOD_60: 'btn_flush_period_60',
  FLUSH_DATA: 'btn_flush_data',
  GET_LOG_LEVEL: 'btn_get_log_level',
  CURRENT_LOG_LEVEL: 'lbl_current_log_level',
  LOG_OFF: 'btn_log_off',
  LOG_ERROR: 'btn_log_error',
  LOG_WARN: 'btn_log_warn',
  LOG_INFO: 'btn_log_info',
  LOG_DEBUG: 'btn_log_debug',
  LOG_VERBOSE: 'btn_log_verbose',

  ANONYMIZE: 'btn_anonymize',
  STOP_INTEGRATION: 'btn_stop_integration',
  ANONYMIZED_TITLE: 'lbl_anonymized_title',
  ANONYMIZED_OK: 'btn_anonymized_ok',
  STOP_CONTINUE: 'btn_stop_continue',
  STOP_BACK_TO_AUTH: 'btn_stop_back_to_auth',

  TOGGLE_CAROUSELS: 'btn_toggle_carousels',
  CB_PLACEHOLDER_EXAMPLE_TOP: 'cb_placeholder_example_top',
  CB_PLACEHOLDER_EXAMPLE_PLATFORM: 'cb_placeholder_example_platform',
  CB_PLACEHOLDER_EXAMPLE_LIST: 'cb_placeholder_example_list',
  CB_CAROUSEL_DEFAULT: 'cb_carousel_default',
  CB_CAROUSEL_FILTERED: 'cb_carousel_filtered',
  CB_CAROUSEL_PLATFORM: 'cb_carousel_platform',
  CAROUSEL_STATUS: 'lbl_carousel_status',

  LOGS_COPY: 'btn_logs_copy',
  LOGS_CLEAR: 'btn_logs_clear',
  LOGS_CLOSE: 'btn_logs_close',
  LOGS_FILTER_ALL: 'btn_logs_filter_all',
  LOGS_FILTER_VERBOSE: 'btn_logs_filter_verbose',
  LOGS_FILTER_DEBUG: 'btn_logs_filter_debug',
  LOGS_FILTER_INFO: 'btn_logs_filter_info',
  LOGS_FILTER_WARN: 'btn_logs_filter_warn',
  LOGS_FILTER_ERROR: 'btn_logs_filter_error',
  LIST_LOGS: 'list_logs',
  LOGS_EMPTY: 'lbl_logs_empty',

  IDENTIFY_CANCEL: 'btn_identify_cancel',
} as const;

export const AutomationIdGaps = {
  // RN loading screen uses an ActivityIndicator and has no loading logo image.
  LOADING_LOGO: 'img_loading_logo',

  // RN uses native Alert for auth errors; alert buttons are not RN-owned views.
  AUTH_ERROR_OK: 'btn_auth_error_ok',

  // RN app shell has no SDK config drawer.
  OPEN_CONFIG_DRAWER: 'btn_open_config_drawer',
  CONFIG_DRAWER: 'drawer_sdk_config',

  // RN has no explicit "set app inbox provider" button and no fetch loading UI.
  APP_INBOX_PROVIDER: 'btn_app_inbox_provider',
  FETCH_LOADING: 'status_fetch_loading',

  // RN identify customer dialog uses generic hard-id editing, not a registered-id field.
  REGISTERED_ID: 'fld_registered_id',
  REGISTERED_ID_LABEL: 'lbl_registered_id',

  // RN flush success is displayed by snackbar, not a result dialog.
  FLUSH_RESULT_TITLE: 'lbl_flush_result_title',
  FLUSH_RESULT_OK: 'btn_flush_result_ok',

  // RN example exposes the native AppInboxButton only; list/detail pages are SDK-owned.
  APP_INBOX_TITLE: 'lbl_app_inbox_title',
  APP_INBOX_BACK: 'btn_app_inbox_back',
  LIST_APP_INBOX: 'list_app_inbox',
  ROW_APP_INBOX_ITEM: 'row_app_inbox_item',
  APP_INBOX_DETAIL_TITLE: 'lbl_app_inbox_detail_title',
  APP_INBOX_DETAIL_BACK: 'btn_app_inbox_detail_back',
  VIEW_APP_INBOX_DETAIL: 'view_app_inbox_detail',
} as const;

export const AutomationIds = {
  ...AvailableAutomationIds,
  ...AutomationIdGaps,
} as const;

export type AutomationId = (typeof AutomationIds)[keyof typeof AutomationIds];
