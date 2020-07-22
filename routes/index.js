const express = require('express');
const router = express.Router();
const Functions = require('../core/functions');
const Product = require('../models/product');


/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});



/**
 * @section Product and List methods
 */

/**
 * @route /api/products
 * get products
 * req.body prarams:
 * 
 * @param pagination {Object} @optional {limit, page}
 * @param seller {string} @optional seller.username
 * 
 * @return {success: Boolean, msg: String, products, pagination}
 * @param products {Array} array of Product s.
 * @param {Object} pagination
 */
router.post('/products', (req, res) => {
    let { pagination, seller } = req.body;
    pagination = pagination || {};
    
	
	const query = {};
    if(seller) query.owner = seller;

    Product.paginate(query, {limit: pagination.limit || 15, page: pagination.page || 1})
    .then((result) => {
        res.json({success: true, msg: 'Successful get products.', products: result.docs, pagination: Functions.pagination(result)});
    })
    .catch(error => {
        console.log('get products err', error);
        res.json({success: false, msg: 'get products error.', error: error});
    });

});


module.exports = router;
