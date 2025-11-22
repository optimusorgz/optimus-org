export async function sendRegistrationEmail(formData: any) {
    try {
        await fetch("/api/send-registration-email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });
    } catch (err) {
        console.error("Email API failed:", err);
    }
}
