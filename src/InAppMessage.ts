import {InAppMessage, InAppMessageAction, InAppMessageActionType, InAppMessageButton} from "./ExponeaType";

export class InAppMessageActionDef implements InAppMessageAction {
    message?: InAppMessage | undefined;
    button?: InAppMessageButton | undefined;
    interaction?: boolean | undefined;
    errorMessage?: string | undefined;
    type: InAppMessageActionType;
    constructor(type: InAppMessageActionType) {
        this.type = type;
    }
    /**
     * Creates InAppMessageAction instance for click action
     */
    static buildForClick(
        message: InAppMessage,
        buttonText: string | null | undefined,
        buttonUrl: string | null | undefined
    ): InAppMessageActionDef {
        const result= new InAppMessageActionDef(InAppMessageActionType.ACTION);
        result.message = message
        if (buttonText || buttonUrl) {
            result.button = {}
            if (buttonText) {
                result.button.text = buttonText
            }
            if (buttonUrl) {
                result.button.url = buttonUrl
            }
        }
        return result
    }

    static buildForClose(
        message: InAppMessage,
        buttonText: string | null | undefined,
        interaction: boolean
    ): InAppMessageActionDef {
        const result= new InAppMessageActionDef(InAppMessageActionType.CLOSE);
        result.message = message
        if (buttonText) {
            result.button = {
                text: buttonText
            }
        }
        result.interaction = interaction
        return result
    }
}