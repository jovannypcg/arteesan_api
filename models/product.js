'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let productSchema = new Schema({
    created_at  : { type: Date, default: Date.now },
    name        : String,
    price       : Number,
    description : { type: String, trim: true },
    status      : { type: String, default: 'ACTIVE' },
    available   : { type: Boolean, default: true },
    tags        : { type: Array, default: [] },
    favorites   : [{ type: Schema.Types.ObjectId, ref: 'User' }],
    purchases   : [{ type: Schema.Types.ObjectId, ref: 'User' }],
    shares      : [{ type: Schema.Types.ObjectId, ref: 'User' }],
    designer    : { type: Schema.Types.ObjectId, ref: 'User' },
    galery      : [{
        _id: Schema.Types.ObjectId,
        description: { type: String, trim: true },
        media_url: String
    }]
}, { collection: 'products' });

let Product = mongoose.model('Product', productSchema);

module.exports = Product;
