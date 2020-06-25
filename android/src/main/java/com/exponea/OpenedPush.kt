package com.exponea

data class OpenedPush(
    val action: PushAction,
    val url: String?,
    val additionalData: Map<*, *>?
)

enum class PushAction(val value: String) {
    app("app"),
    deeplink("deeplink"),
    web("web")
}
