'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let userSchema = new Schema({
    createdAt   : { type: Date, default: Date.now },
    firstName   : String,
    lastName    : String,
    birthDate   : Date,
    picture     : { type: String, default: '' },
    email       : String,
    username    : String,
    password    : String,
    status      : { type: String, default: 'ACTIVE' },
    favourites  : [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    followers   : [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isAdmin     : { type: Boolean, default: false },
    isCustomer  : { type: Boolean, default: true },
    isDesigner  : { type: Boolean, default: false }
}, { collection: 'users' });

let User = mongoose.model('User', userSchema);

module.exports = User;
