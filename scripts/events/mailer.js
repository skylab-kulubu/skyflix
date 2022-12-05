const eventEmitter = require('./eventEmitter');
const nodemailer = require("nodemailer");

module.exports = () => {
    eventEmitter.on("send_email", async (data) => {

        const account = await nodemailer.createTestAccount()

        let transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: account.user, // generated ethereal user
                pass: account.pass  // generated ethereal password
            }
        });

        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            ...data
        });
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    })


}