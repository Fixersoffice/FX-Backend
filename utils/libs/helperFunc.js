// Generate an OTP for user
const generateOtp = () => {
    let otp = Math.floor(Math.random() * 90000) + 10000;
    let expiryDate = new Date();
    expiryDate.setTime(new Date().getTime() + (30 * 60 * 1000));
    return { otp, expiryDate };
}   

/**
 *  send OTP to the PhoneNumber
 */

const sendSMS = async (otp, toWhichPhoneNumber) => {
    const accountSid = process.env.FIXERS_TWILIO_ACCOUNT_SID;
    const authToken = process.env.FIXERS_TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.FIXERS_TWILIO_PHONE_NUMBER
    const client = require('twilio')(accountSid, authToken);

 const response = await client.messages
  .create({
     body: `Your OTP is ${otp}`,
     from: twilioPhoneNumber,
     to: `recipient_country_code${toWhichPhoneNumber}`
   })
   
   return response;
}

module.exports = {
    generateOtp,
    sendSMS
}