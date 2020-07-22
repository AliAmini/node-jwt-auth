var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

// load up the user model
var User = require('../models/user');
var config = require('../config/database'); // get db config file

exports.localStrategy = function (passport) {
    var opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
    opts.secretOrKey = config.secret;
    passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
        console.log('jwt_payload.id:', jwt_payload._id, jwt_payload);
        // NOTE: jwt_payload seted on /api/signin route
        
        User.findOne({
            _id: jwt_payload._id
        }, function (err, user) {
            if (err) {
                console.log('PASSPORT: FAIL --- error:', err);
                return done(err, false);
            }
            if (user) {
                if(user.username == jwt_payload.username){
                    console.log('PASSPORT: GOOD');
                    done(null, user);
                } else {
                    console.log('PASSPORT: Payload is not the same user doc');
                    done(null, false);
                }
            } else {
                console.log('PASSPORT: FAIL - no user found');
                done(null, false);
            }
        });
    }));
};


// can use `passport.authenticate('jwt', { session: false })` in router middleware
/**
 * 
 * @param {object} passport - it gets passport instance
 * @param {object} filterUser - if it set, it can filter user -> 
 *          {admin: true} filter object only authorize users that has `admin` parameter with `true` value in its mongoDB document; if it's not match, 
 *          it response with 403(forbidden) status code
 * 
 * @return if user authorized, it's response code will be 200, otherwise it response with 401(unauthorized) status code
 */
exports.myAuthenticate = function(passport, filterUser/* Object */) {
    // console.log('myAuthenticate!!!!');
    return function(req, res, next) {
        console.log('myAuthenticate req, res next -> function:');
        // console.log("passport.authenticate('jwt', { session: false })", passport.authenticate('jwt', { session: false }));
        passport.authenticate('jwt', { session: false })(req, res, function(err) {
            // console.log('pratameters: err, user, info', err, user, info); -> undefined undefined undefined
            if(err) {
                console.log('passport.authenticate ERROR:', err);
                return res.status(401).send("Unauthorized");
            }
            
            // console.log('passport.authenticate user:', req.user);
            if(filterUser) for(let key in filterUser) {
                if(req.user[key] !== filterUser[key]) {
                    console.log('403 auth error: %s key filter is not %s and 403!', key, filterUser[key]);
                    return res.status(403).send("Forbidden");
                }
            }
    
            return next();
        });
    }
}