import postmark from 'postmark';
const client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN);
export const mail = async (userToSend, otp) => {
    try {
        const response = await client.sendEmail({
            From: `${process.env.POSTMARK_SENDER_EMAIL}`,
            To: userToSend,
            Subject: 'OTP Verification',
            TextBody: `This is your email OTP code: ${otp}!`
        });
        console.log('Email sent successfully:', response);
    } catch (err) {
        console.error('Error sending email:', err);
    }
}
