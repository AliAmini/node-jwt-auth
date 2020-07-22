const axios = require('axios');
const assert = require('assert');
const mongoose = require('mongoose');
const config = require('../config/database');
const Product = require('../models/product');


// MongoDB
mongoose.connect(config.database, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const baseUrl = 'http://localhost:4000/api';
const Url = (action) => baseUrl+action;
