const { string } = require("joi");
const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const minuteFromNow = () => {
    const date = new Date();
    date.setTime(date.getTime() + 1000 * 60 * 5);
    return date;
}

const otpSchema = new Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    code: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        default: minuteFromNow,
        index: { expires: '5m' }
    }
}, {
    timestamps: true
})

const otp = model('Otp', otpSchema);

module.exports = otp;
