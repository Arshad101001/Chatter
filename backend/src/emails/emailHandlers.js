import { resendClient, sender } from "../lib/resend.js"
import { createWelcomeEmailTemplate } from "./emailTemplates.js";

export const sendWelcomeEmail = async (email, name, clientURL) => {
    const { data, error } = await resendClient.emails.send({
        from: `${sender.name} <${sender.email}>`,
        to: email,
        subject: "Welcome to Chatter!",
        html: createWelcomeEmailTemplate(name, clientURL),
        tags: [],
        clickTracking: false,
        analytics: {
            clicks: false
        },
    })

    if (error) {
        console.error("Error sending Welcome email: ", error);
        throw new Error("Failed to send welcome email");
    }

    console.log("Welcome Email sent successfully: ", data);

}