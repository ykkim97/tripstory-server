const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const saltRounds = 10;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        maxlength: 50,
    },
    email: {
        type: String,
        trim: true,
        unique: 1,
    },
    password: {
        type: String,
        minlength: 5,
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
    },
    birthdate: {
        type: Date,
    },
    nickname: {
        type: String,
        maxlength: 50,
    },
    role: {
        type: Number,
        default: 0,
    },
    image: {
        type: String,
    },
    token: {
        type: String,
    },
    tokenExp: {
        type: Number,
    },
});

// save하기 전에 비밀번호를 암호화 시킨다.
userSchema.pre("save", function (next) {
    const user = this;

    if (user.isModified("password")) {
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) return next(err);

            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err);
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

// 비밀번호를 비교하는 메소드
userSchema.methods.comparePassword = async function (plainPassword) {
    try {
        return await bcrypt.compare(plainPassword, this.password);
    } catch (err) {
        throw err;
    }
};

// 토큰을 생성하는 메소드
userSchema.methods.generateToken = function () {
    try {
        const token = jwt.sign({ id: this._id.toHexString() }, "secretToken", { expiresIn: '1h' });
        this.token = token;
        return this.save().then(() => token);
    } catch (err) {
        throw err;
    }
};

// 토큰을 복호화하여 유저를 찾는 메소드
userSchema.statics.findByToken = async function (token) {
    try {
        const decoded = jwt.verify(token, "secretToken");
        // return await this.findById({ _id: decoded.id, token: token });
        return await this.findById(decoded.id);
    } catch (err) {
        throw err;
    }
};

const User = mongoose.model('User', userSchema);

module.exports = { User };
