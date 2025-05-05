import {InAppMessage} from "../ExponeaType";
import {JsonObject} from "../Json";

export class InAppMessageTestData {
    static buildInAppMessage(options?: {
        id?: string,
        dateFilter?: JsonObject,
        trigger?: JsonObject,
        frequency?: string,
        imageUrl?: string,
        priority?: number,
        timeout?: number,
        delay?: number,
        messageType?: string,
        isRichText?: boolean
    }): InAppMessage {
        let payload: JsonObject | undefined;
        let payloadHtml: string | undefined;
        if (options?.messageType == 'freeform') {
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
        } else if (options?.isRichText ?? false) {
            payload = {
                image_url: options?.imageUrl ?? "https://i.ytimg.com/vi/t4nM1FoUqYs/maxresdefault.jpg",
                title: "filip.vozar@exponea.com",
                title_text_color: "#000000",
                title_text_size: "22px",
                    body_text: "This is an example of your in-app message body text.",
                    body_text_color: "#000000",
                    body_text_size: "14px",
                    buttons: [
                        {
                            button_type: "deep-link",
                            button_text: "Action",
                            button_link: "https://someaddress.com",
                            button_background_color: "blue",
                            button_text_color: "#ffffff",
                            button_font_url: "https://webpagepublicity.com/free-fonts/x/Xtrusion%20(BRK).ttf",
                            button_width: "hug",
                            button_corner_radius: "12dp",
                            button_margin: "20px 10px 15px 10px",
                            button_font_size: "24px",
                            button_line_height: "32px",
                            button_padding: "20px 10px 15px 10px",
                            button_font_format: ["bold"],
                            button_border_color: "black",
                            button_border_width: "1px",
                            button_enabled: true
                        },
                        {
                            button_type: "cancel",
                            button_text: "Cancel",
                            button_link: null,
                            button_background_color: "#f44cac",
                            button_text_color: "#ffffff",
                            button_font_url: "https://webpagepublicity.com/free-fonts/x/Xtrusion%20(BRK).ttf",
                            button_width: "hug",
                            button_corner_radius: "12dp",
                            button_margin: "20px 10px 15px 10px",
                            button_font_size: "24px",
                            button_line_height: "32px",
                            button_padding: "20px 10px 15px 10px",
                            button_font_format: ["bold"],
                            button_border_color: "black",
                            button_border_width: "1px",
                            button_enabled: true
                        }
                    ],
                    background_color: "#ffffff",
                    close_button_color: "#ffffff",
                    image_size: "auto",
                    image_object_fit: "fill",
                    image_overlay_enabled: false,
                    image_margin: "200 10 10 10",
                    title_font_url: "https://webpagepublicity.com/free-fonts/x/Xtrusion%20(BRK).ttf",
                    title_align: "center",
                    title_format: ["bold"],
                    title_line_height: "32px",
                    title_padding: "200px 10px 15px 10px",
                    body_font_url: "https://webpagepublicity.com/free-fonts/x/Xtrusion%20(BRK).ttf",
                    body_align: "center",
                    body_format: ["bold"],
                    body_line_height: "32px",
                    body_padding: "200px 10px 15px 10px",
                    buttons_align: "center",
                    image_aspect_ratio_width: "16",
                    image_aspect_ratio_height: "9",
                    close_button_background_color: "yellow",
                    close_button_image_url: null,
                    close_button_margin: "50px 10px",
                    close_button_enabled: true,
                    overlay_color: "#FF00FF10",
                    text_position: "top",
                    text_over_image: null,
                    image_corner_radius: "10px",
                    title_enabled: true,
                    image_enabled: true,
                    body_enabled: true
            }
        } else {
            payload = {
                image_url: options?.imageUrl ?? "https://i.ytimg.com/vi/t4nM1FoUqYs/maxresdefault.jpg",
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
            id: options?.id ?? "5dd86f44511946ea55132f29",
            name: "Test serving in-app message",
            message_type: options?.messageType ?? 'modal',
            frequency: options?.frequency ?? "unknown",
            variant_id: 0,
            variant_name: "Variant A",
            trigger: options?.trigger ?? {
                event_type: "session_start",
                filter: []
            },
            date_filter: options?.dateFilter ?? {
                enabled: false
            },
            load_priority: options?.priority,
            load_delay: options?.delay,
            close_timeout: options?.timeout,
            payload: payload,
            payload_html: payloadHtml,
            is_html: options?.messageType == 'freeform',
            is_rich_text: options?.isRichText ?? false
        }
    }
}