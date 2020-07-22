const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');


const productSchema = new Schema({
    owner: {type: String, required: true}, // it is the User._id
    title: {type: String, required: true},
    description: {type: String},
    price: {type: Number, default: 0},

    created_at: {type: Date},
    updated_at: Date,
});



productSchema.pre('save', function(next) {
    this.created_at = this.created_at || new Date();
    this.updated_at = new Date();

    next();
});
productSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Product', productSchema);