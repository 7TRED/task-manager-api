const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);


const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: process.env.SENDER_EMAIL,
        subject: 'Thanks for Joining in!',
        text: `Welcome to the app, ${name}. Let me know how you got along with app.`
    })
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: process.env.SENDER_EMAIL,
        subject: 'Account Cancellation',
        text:`Goodbye ${name}, \n Your account has been canceled. Please, do tell use how we could have improved your experience.`
    })
}


module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}