import {InAppMessage, InAppMessageButton} from "./ExponeaType";

export interface InAppMessageCallback {
    overrideDefaultBehavior: boolean;
    trackActions: boolean;
    inAppMessageClickAction: (
        message: InAppMessage,
        button: InAppMessageButton
    ) => void
    inAppMessageCloseAction: (
        message: InAppMessage,
        button: InAppMessageButton | undefined,
        interaction: boolean
    ) => void
    inAppMessageError: (
        message: InAppMessage | undefined,
        errorMessage: string
    ) => void
    inAppMessageShown: (
        message: InAppMessage
    ) => void
}