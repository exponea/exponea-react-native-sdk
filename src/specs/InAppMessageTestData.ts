import {InAppMessage} from "../ExponeaType";
import {JsonObject} from "../Json";

export class InAppMessageTestData {
    static buildInAppMessage(
        id?: string,
        dateFilter?: JsonObject,
        trigger?: JsonObject,
        frequency?: string,
        imageUrl?: string,
        priority?: number,
        timeout?: number,
        delay?: number,
        type = 'modal',
    ): InAppMessage {
        let payload: JsonObject | undefined;
        let payloadHtml: string | undefined;
        if (type === 'freeform') {
            payloadHtml = "<html>" +
                "<head>" +
                "<style>" +
                ".css-image {" +
                "   background-image: url('https://i.ytimg.com/vi/t4nM1FoUqYs/maxresdefault.jpg')" +
                "}" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<img src='https://i.ytimg.com/vi/t4nM1FoUqYs/maxresdefault.jpg'/>" +
                "<div data-actiontype='close'>Close</div>" +
                "<div data-link='https://someaddress.com'>Action 1</div>" +
                "</body></html>"
        } else {
            payload = {
                image_url: imageUrl ?? "https://i.ytimg.com/vi/t4nM1FoUqYs/maxresdefault.jpg",
                title: "filip.vozar@exponea.com",
                title_text_color: "#000000",
                title_text_size: "22px",
                body_text: "This is an example of your in-app message body text.",
                body_text_color: "#000000",
                body_text_size: "14px",
                buttons: [{
                    button_type: "deep-link",
                    button_text: "Action",
                    button_link: "https://someaddress.com",
                    button_background_color: "#f44cac",
                    button_text_color: "#ffffff"
                }, {
                    button_type: "cancel",
                    button_text: "Cancel",
                    button_background_color: "#f44cac",
                    button_text_color: "#ffffff"
                }],
                background_color: "#ffffff",
                close_button_color: "#ffffff"
            }
        }
        return {
            id: id ?? "5dd86f44511946ea55132f29",
            name: "Test serving in-app message",
            message_type: type,
            frequency: frequency ?? "unknown",
            variant_id: 0,
            variant_name: "Variant A",
            trigger: trigger ?? {
                event_type: "session_start",
                filter: []
            },
            date_filter: dateFilter ?? {
                enabled: false
            },
            load_priority: priority,
            load_delay: delay,
            close_timeout: timeout,
            payload: payload,
            payload_html: payloadHtml,
            is_html: type == 'freeform',
            is_rich_text: false
        }
    }
}