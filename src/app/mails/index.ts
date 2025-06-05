import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "theharshiile@gmail.com",
        pass: process.env.MAIL_PASSKEY
    },
});


export const SendMail = async (email: string, subjectText: string, htmlText: string) => {
    if (email) {
        const mailOptions = {
            from: "theharshiile@gmail.com",
            to: "",
            subject: subjectText,
            html: htmlText
        }
        mailOptions.to = email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) console.error("Email sending failed")
            else {
                console.log("Email sent to " + email);
            }
        });
    }
    else console.error("Email not found")
}