import nodemailer from 'nodemailer'
import { Request, Response } from 'express'
import { JOUError } from '../../lib/error';

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "theharshiile@gmail.com",
        pass: process.env.MAIL_PASSKEY
    },
});


export const SendMail = async (email: string, htmlText: string) => {
    if (email) {
        const mailOptions = {
            from: "theharshiile@gmail.com",
            to: "",
            subject: "Hello Frsssssom Habibi",
            html: htmlText
        }
        mailOptions.to = email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) throw new JOUError(400, "Email sending failed")
            else {
                console.log("Email sent to " + email);
            }
        });
    }
    else throw new JOUError(404, "Email not found")
}