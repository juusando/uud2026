/// <reference types="../pb_data/types.d.ts" />

/**
 * After user confirm verification
 * This email will be sent
 * The email template is in the views/welcome.html file
 * The email takes user name as parameter
 */
onRecordConfirmVerificationRequest((e) => {
    const message = new MailerMessage({
        from: {
            address: e.app.settings().meta.senderAddress,
            name:    e.app.settings().meta.senderName,
        },
        to:      [{address: e.record.email()}],
        subject: "Welcome to our app",
        html:    $template.loadFiles(`${__hooks}/views/welcome.html`).render({"name": e.record.get("name")}),
    })
    e.app.newMailClient().send(message)
    e.next()
}, "users")

/**
 * After user confirm email change
 * This email will be sent
 * The email template is in the views/email_change_confirm.html file
 * The email takes user name, old email and new email as parameters
 */
onRecordConfirmEmailChangeRequest((e) => {
    console.log("Email changed", e.record.get("name"), e.newEmail)
    try {
    const message = new MailerMessage({
        from: {
            address: e.app.settings().meta.senderAddress,
            name:    e.app.settings().meta.senderName,
        },
        to:      [{address: e.newEmail}],
        subject: "Email change confirmed",
        html:    $template.loadFiles(`${__hooks}/views/email_change_confirm.html`).render({"name": e.record.get("name"), "oldEmail": e.record.email(), "newEmail": e.newEmail}),
    })
        e.app.newMailClient().send(message)
        console.log("Email changes confirmation email sent")
    } catch (error) {
        console.error("Error sending email changes confirmation email:", error)
    }
    e.next()
}, "users")

/**
 * After user confirm password reset
 * This email will be sent
 * The email template is in the views/password_reset_success.html file
 * The email takes user name as parameter
 */
onRecordConfirmPasswordResetRequest((e) => {
    const message = new MailerMessage({
        from: {
            address: e.app.settings().meta.senderAddress,
            name:    e.app.settings().meta.senderName,
        },
        to:      [{address: e.record.email()}],
        subject: "Password reset successfully",
        html:    $template.loadFiles(`${__hooks}/views/password_reset_success.html`).render({"name": e.record.get("name")}),
    })

    e.app.newMailClient().send(message)
    e.next();
}, "users");
