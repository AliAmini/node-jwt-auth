/**
 * @route /api/seller
 */

const mongoose = require('mongoose');
const passport = require('passport');
const myPassport = require('../config/passport');
const MyPassportLocalStrategy = myPassport.localStrategy;
const MyAuthentication = myPassport.myAuthenticate;
const express = require('express');
const router = express.Router();

const Functions = require('../core/functions');
const Product = require('../models/product');

// Passport LocalStrategy init
MyPassportLocalStrategy(passport);



/**
 * @section Product functions
 */

/**
 * @route /api/seller/addProduct
 * @auth 
 * create a product
 * req.body prarams:
 * 
 * @param product {Product model} -> {title,description,price}
 * 
 * @return {success: Boolean, msg: String}
 */
router.post('/addProduct', MyAuthentication(passport), function (req, res) {
    if (!req.body.product) {
        return res.json({
            success: false,
            msg: 'Please pass product data.'
        });
    } 

    // safe params from injection
    const productData = Functions.getObject(['title','description','price'], req.body.product);
    const newProduct = new Product({...productData, owner: req.user.username});

    newProduct.save((err, product) => {
        if (err) {
            return res.json({
                success: false,
                msg: 'Save product failed.',
                error: err
            });
        }

        res.json({
            success: true,
            msg: 'Successful created new product.'
        });
    });
});


/**
 * @route /api/seller/editProduct
 * @auth @seller
 * edit product
 * req.body prarams:
 * 
 * @param _id {string ObjectID}
 * @param product {Product model} -> {title,description,text,images,minNumber,unit,capacityInCartoon,price,'available','alwaysAvailable','listed','list'}
 * 
 * @return {success: Boolean, msg: String}
 */
router.post('/editProduct', MyAuthentication(passport/* , {admin: true} */), function (req, res) {
    if (!req.body.product || !req.body._id) {
        return res.json({
            success: false,
            msg: 'Please pass product data.'
        });
    } 

    // safe params from injection
    const { _id } = req.body;
    const newProductData = Functions.getParams(['title','description','price'], req.body.product); // returned an object with only passed params
    
    Product.findOne({_id: _id})
    .then((product) => {
        if(!product) {
            return res.json({success: false, msg: 'Product not found.'});
        }
        if(product.owner != req.user.username) {
            return res.json({success: false, msg: 'Cannot access to the product.'});
        }

        for(key in newProductData) {
            const value = newProductData[key];
            product[key] = value;
        }

        return product.save();
    })
    .then((product) => {
        res.json({
            success: true,
            msg: 'Successful edit the product.'
        });
    })
    .catch((err) => {
        res.json({success: false, msg: 'product edit error.', error: err});
    });

});


/**
 * @route /api/seller/removeProduct
 * @auth @seller
 * remove product
 * req.body prarams:
 * 
 * @param _id {string ObjectID} product id
 * 
 * @return {success: Boolean, msg: String}
 */
router.post('/removeProduct', MyAuthentication(passport/* , {admin: true} */), function (req, res) {
    if (!req.body._id) {
        return res.json({
            success: false,
            msg: 'Please pass list data.'
        });
    } 

    // safe params injection
    const { _id } = req.body;
    

    Functions.accessDocument({
        model: Product, 
        documentID: _id, 
        owner: 'owner'
    }, (error, product, found, subDocIndex) => {

        
        product.remove();

        return product.save();
        
    }, {req: req, res: res, modelName: 'product'}); // sendResult mode; only do operation and retun model.save()
    
});


module.exports = router;