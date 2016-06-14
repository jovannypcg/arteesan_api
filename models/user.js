'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let userSchema = new Schema({
    created_at: { type: Date, default: Date.now },
    first_name: String,
    last_name : String,
    birthdate : Date,
    picture   : { type: String, default: '' },
    email     : { type: String, lowercase: true, trim: true },
    username  : { type: String, trim: true },
    password  : String,
    status    : { type: String, default: 'ACTIVE' },
    favorites : [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    followers : [{ type: Schema.Types.ObjectId, ref: 'User' }],
    role : {
        isAdmin     : { type: Boolean, default: false },
        isCustomer  : { type: Boolean, default: true },
        isDesigner  : { type: Boolean, default: false }
    }
}, { collection: 'users' });

let User = mongoose.model('User', userSchema);

module.exports = User;
