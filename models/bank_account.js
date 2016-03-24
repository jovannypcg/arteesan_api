'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let bankAccountSchema = new Schema({
    created: { type: Date, default: Date.now },
    owner: String,
    bankName: String,
    number: String,
    CLABE: String
}, { collection: 'bank_accounts' });

let BankAccount = mongoose.model('BankAccount', bankAccountSchema);

module.exports = BankAccount;
