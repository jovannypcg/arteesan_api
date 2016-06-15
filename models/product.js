'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let productSchema = new Schema({
    created_at  : { type: Date, default: Date.now },
    name        : String,
    price       : Number,
    category    : { type: String, trim: true },
    description : { type: String, trim: true },
    status      : { type: String, default: 'ACTIVE' },
    available   : { type: Boolean, default: true },
    tags        : [{ type: String, default: [] }],
    favorites   : [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    purchases   : [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    shares      : [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    designer    : { type: Schema.Types.ObjectId, ref: 'User' },
    thumbnail   : String,
    pics        : [{
        _id: Schema.Types.ObjectId,
        description: { type: String, trim: true },
        media_url: String
    }]
}, { collection: 'products' });

let Product = mongoose.model('Product', productSchema);

module.exports = Product;
