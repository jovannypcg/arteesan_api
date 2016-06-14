'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

/**
 * Provides the schema for shopping carts.
 *
 * 'status' expected values: READY, CANCELED, PURCHASED, PENDING.
 */
let cartSchema = new Schema({
    created_at: { type: Date, default: Date.now },
    owner     : { type: Schema.Types.ObjectId, ref: 'User' },
    products  : [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    status    : { type: String, default: 'READY' }
}, { collection: 'carts' });

let Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
