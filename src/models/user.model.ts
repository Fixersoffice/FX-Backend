import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

interface IUser extends Document {
    username: string;
    email: string;
    phone_number: string;
    address: string;
    password: string;
}

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, 'Please provide a username'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [20, 'Username must be at most 20 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function (val: string) {
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(val);
            }
        }
    },
    phone_number: {
        type: String,
        required: [true, 'Please provide a phone number'],
        unique: true,
        trim: true,
        validate: {
            validator: function (val: string) {
                return /^(\+?234|0)[7-9][0-1]\d{8}$/.test(val);
            }
        }
    },
    address: {
        type: String,
        required: [true, 'Please provide an address'],
        trim: true,
        minlength: [3, 'Address must be at least 3 characters'],
        maxlength: [100, 'Address must be at most 100 characters'],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        trim: true,
        minlength: [6, 'Password must be at least 6 characters'],
        maxlength: [20, 'Password must be at most 20 characters'],
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.password;
            delete ret.__v;
        }
    },
    toObject: {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.password;
            delete ret.__v;
        }
    },
});

userSchema.pre('save', function (next) {
    const user = this;
    if (!user.isModified('password')) return next();
    user.password = bcrypt.hashSync(user.password, 10);
    next();
});

userSchema.methods.comparePassword = function (candidatePassword: string) {
    const user = this;
    return bcrypt.compareSync(candidatePassword, user.password);
};


const User = mongoose.model<IUser>('User', userSchema);

export { User };
