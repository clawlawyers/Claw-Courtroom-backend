const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String },
    lastName: { type: String },
    gender: { type: String },
    email: { type: String },
    barCouncilId: { type: String },
    barCouncilNo: { type: Number },
    barCouncilYear: { type: Number },
    state: { type: String },
    city: { type: String },
    pincode: { type: Number },
    searchTag: { type: String },
    id_url: { type: String },
    profilePicture: { type: String },
    about: { type: String },
    phoneNumber: { type: String, required: true, unique: true },
    verified: { type: Boolean, default: false },
    registered: { type: Boolean, default: false },
    searchTagEmbedding: { type: Array, select: false },
}, { timestamps: true });

// userSchema.pre('save', function (next) {
//     let user = this;
//     if (!user.isModified('password')) return next();

//     const encryptedPassword = bcrypt.hashSync(user.password, bcrypt.genSaltSync(+SALT_ROUNDS));
//     user.password = encryptedPassword;
//     next();
// })

const User = new mongoose.model('User', userSchema);

module.exports = User;