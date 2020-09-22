const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        }
    }
);

userSchema.pre('save', async function(next) {
    const user = this;
    const hash = await bcrypt.hash(user.password, 10);
    user.password = hash;
    next();
});

userSchema.methods.isValidPassword = async function(password) {
    const user = this;
    return await bcrypt.compare(password, user.password);
}

const User = mongoose.model('User', userSchema);

module.exports = User;
