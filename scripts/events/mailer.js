const eventEmitter = require('./eventEmitter');
const nodemailer = require("nodemailer");

module.exports = () => {
    eventEmitter.on("send_email", (data) => {
        nodemailer.createTestAccount((err, account) => {
            let transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: account.user, // generated ethereal user
                    pass: account.pass  // generated ethereal password
                }
            });

            transporter.sendMail({
                from: process.env.EMAIL_FROM,
                ...data
            }).then(info => {
                console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
            });
        })

    })
}