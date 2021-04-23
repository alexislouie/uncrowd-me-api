const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const userSchema = mongoose.Schema({
    firstName: { type: 'string', required: true },
    lastName: { type: 'string', required: true },
    userName: { type: 'string', required: true, unique: true },
    password: { type: 'string', required: true },
    savedPlaces: [{ String }],
    // savedLocations: [{ type: 'string' }] // home?
}, { toJSON: { virtuals: true }, toObject: { virtuals: true }});

userSchema.methods.serialize = function () {
    return {
        id: this._id,
        firstName: this.firstName,
        lastName: this.lastName,
        userName: this.userName,
        savedPlaces: this.savedPrograms
    };
};

// userSchema.methods.validatePassword = function(password) {
//     return bcrypt.compare(password, this.password);
// };

// userSchema.statics.hashPassword = function(password) {
//     return bcrypt.hash(password, 10);
// };

const User = mongoose.model('User', userSchema);

module.exports = User;