'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let productSchema = new Schema({
    createdAt: { type: Date, default: Date.now },
    name        : String,
    price       : Number,
    description : { type: String, default: 'Not available' },
    galery      : { type: Array, default: [] },
    tags        : { type: Array, default: [] },
    favourites  : { type: Number, default: 0 },
    purchases   : { type: Number, default: 0 },
    shares      : { type: Number, default: 0 },
    designer    : { type: Schema.Types.ObjectId, ref: 'User' }
}, { collection: 'products' });

let Product = mongoose.model('Product', productSchema);

module.exports = Product;
