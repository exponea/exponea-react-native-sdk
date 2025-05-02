package com.exponea.widget.carousel

enum class CarouselEventType(val value: String) {
    ON_MESSAGE_SHOWN("onMessageShown"),
    ON_MESSAGES_CHANGED("onMessagesChanged"),
    ON_NO_MESSAGE_FOUND("onNoMessageFound"),
    ON_ERROR("onError"),
    ON_CLOSE_CLICKED("onCloseClicked"),
    ON_ACTION_CLICKED("onActionClicked")
}
