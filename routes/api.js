/**
 * @route /api
 */

const mongoose = require('mongoose');
const passport = require('passport');
const config = require('../config/database');
const myPassport = require('../config/passport');
const MyPassportLocalStrategy = myPassport.localStrategy;
const MyAuthentication = myPassport.myAuthenticate;
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const Functions = require('../core/functions');
const User = require("../models/user");

// Init Passport LocalStrategy 
MyPassportLocalStrategy(passport);


/**
 * @route /api/signup
 * create a user
 * req.body prarams:
 * 
 * @param username
 * @param password
 * 
 * @return {success: Boolean, msg: String}
 */
router.post('/signup', function (req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({
            success: false,
            msg: 'Please pass username and password.'
        });
    } else {
        // avoid injection to database
        const userData = Functions.getParams(['username','password','firstname','lastname','email'], req.body);
        var newUser = new User(userData);
        // save the user
        newUser.save(function (err) {
            if (err) {
                console.log('create user err:', err);
                return res.json({
                    success: false,
                    msg: 'Username already exists.'
                });
            }
            res.json({
                success: true,
                msg: 'Successful created new user.'
            });
        });
    }
});


/**
 * @route /api/signin
 * login user -> check information and return jwt token
 * req.body prarams:
 * 
 * @param username
 * @param password
 * 
 * @return {success: Boolean, msg: String, token: String}
 * @param token {String} jwt token like: "JWT xxxxxxxxxxx"
 */
router.post('/signin', function (req, res) {
    User.findOne({
        username: req.body.username
    }, function (err, user) {
        if (err) throw err;

        if (!user) {
            res.status(200).json({
                success: false,
                msg: 'Authentication failed. User not found.'
            });
        } else {
            // check if password matches
            user.comparePassword(req.body.password, function (err, isMatch) {
                if (isMatch && !err) {
                    // if user is found and password is right create a token
                    // console.log('User schema: ', user);
                    // console.log('User schema.toJSON(): ', user.toJSON()); // return an pure object with some param
                    const {_id, username } = user;
                    const jwtPayload = {_id: _id, username: username};
                    
                    var token = jwt.sign(jwtPayload, config.secret, {
                        expiresIn: 604800*4 // 1 week * 4
                    });
                    // return the information including token as JSON
                    res.json({
                        success: true,
                        token: 'JWT ' + token
                    });
                } else {
                    res.status(200).send({
                        success: false,
                        msg: 'Authentication failed. Wrong password.'
                    });
                }
            });
        }
    });
});

router.post('/signout'/* , passport.authenticate('jwt', {session: false}) */, MyAuthentication(passport), function (req, res) {
    req.logout();
    res.json({
        success: true,
        msg: 'Sign out successfully.'
    });
});


/**
 * @route /api/profile
 * @auth
 * get profile
 * req.body prarams:
 *  
 * @return {success: Boolean, msg: String, user: User}
 * @param user
 */
router.post('/profile', MyAuthentication(passport), function (req, res) {
    User.findOne({username: req.user.username}) 
    .then(u => {
        const user = u.toJSON();
        delete user.password;

        res.json({
            success: true,
            msg: 'successfull get user',
            user: user
        });
    })
    .catch(error => {
        res.json({success: false, msg: 'get user error.', error: error});
    });
    
});

/**
 * @route /api/editProfile
 * @auth
 * get profile
 * req.body prarams:
 * 
 * @param user {Object} User fields
 * 
 * @return {success: Boolean, msg: String, user: User}
 * @param user
 */
router.post('/editProfile', MyAuthentication(passport), function (req, res) {
    if (!req.body.user) {
        return res.json({ success: false, msg: 'Please pass user data.' });
    }

    const userData = Functions.getParams(['firstname','lastname','email'], req.body.user);

    User.findOne({username: req.user.username})
    .then(user => {
        for(key in userData) {
            user[key] = userData[key];
        }
        
        return user.save();
    })
    .then(user => {
        res.json({
            success: true,
            msg: 'successfull get user',
            user: user
        });
    })
    .catch(error => {
        res.json({success: false, msg: 'get user error.', error: error});
    });
});



getToken = function (headers) {
    if (headers && headers.authorization) {
        var parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};

module.exports = router;