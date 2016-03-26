'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let cartSchema = new Schema({
    created     : { type: Date, default: Date.now },
    products    : [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    status      : { type: String, default: 'READY' } // READY, PURCHASED, CANCELED
}, { collection: 'carts' });

let Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
