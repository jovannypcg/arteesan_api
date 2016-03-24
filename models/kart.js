'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let kartSchema = new Schema({
    created     : { type: Date, default: Date.now },
    owner       : { type: Schema.Types.ObjectId, ref: 'User' },
    products    : [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    status      : { type: String, default: 'NEUTRAL' } //NEUTRAL, READY, PURCHASED, CANCELED
}, { collection: 'karts' });

let Kart = mongoose.model('Kart', kartSchema);

module.exports = Kart;
