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

const getRandomItem = (items=[]) => {
    if(items.length < 10) {
        return items[(Math.floor(Math.random()*10))%items.length];
    }
    return items[(Math.floor(Math.random()*items.length))];
};
const randomNumber = (num1, num2) => {
    let from = 0, to;
    if(typeof num2 == 'undefined') {
        to = num1;
    } else {
        to = num2;
        from = num1;
    }

    return from + Math.floor(Math.random()*to);    
}

const marketUsernames = ['09190001724', '09198881724', '09195528894'];
const userData = {
    marketName: ['فراغت', 'پژو کارون', 'کالاتیک'],
    firstname: ['علی', 'داوود', 'محسن'],
    lastname: ['فراغت', 'کاشانی', 'رضایی'],
    seller: true,
    password: '110-111'
};


describe('Creating market users', () => {
    marketUsernames.forEach((username, i) => {
        const data = {username};
        for(let key in userData) {
            const value = userData[key];
            if(typeof value == 'object') data[key] = value[i];
            else data[key] = value;
        }
        it('shoud create a user', async (/* done */) => {
            console.log('user', data);
            try {
                const response = await axios.post(Url('/signup'), data);
                const resp = response.data;
                console.log('user created resp msg:', resp.msg);
            } catch (error) {
                console.log('user cannot created error:', error);
                throw error;
            }
            // done();
        });
    });
});


const pTitles = [
    'دیسک جلو پراید',
    'لنت عقب پژو 405',
    'میل گاردن پراید',
    'تسمه تایم پژو',
    'لامپ زنون',
    'شمع NGK پایه بلند',
    'وایر شمع پراید',
    'قالپاق استاندارد پژو',
    'چراغ خطر عقب دنا',
    'بلبرینگ چرخ عقب پراید',
    'شمع بوش پلاتین پایه کوتاه',
];
const pDesc = 'شمع فوق محصولی از شرکت «بوش» (BOSCH) است. این شرکت به دلیل تولید شمع‌های باکیفیت، اعتبار زیادی کسب کرده است و اصالتی آلمانی دارد. یکی از نقاط قوت این شمع، تکنولوژی ساخت قسمت جرقه‌زنی آن است. این بخش از شمع، حالتی باریک و سوزنی‌شکل دارد و این موضوع باعث بهبود فرایند جرقه‌زنی در دما و فشار بالا می‌شود. کد حرارتی این شمع 7 است که بالاترین کد حرارتی است یعنی تحمل بیشینه دما و فشار در هنگام عملیات احتراق. آلیاژ فلزی به‌کاررفته در ساخت هسته شمع فوق از نوع جدیدترین آلیاژ یعنی (پلاتین+مس+نیکل) (NiY+Cu+Pt) است که با روکشی از ایریدیوم پوشانده شده که تا پایه شمع بصورت یکدست با تکنولوژی ذوب فوژیونی ادامه دارد که می‌تواند در دمای بالا، عمل جرقه‌زنی را به سدیع ترین و با کیفیت ترین حالت ممکن انجام دهد.';
describe('Create some products', () => {

    const createRandomProduct = (counter) => {
        const obj = {
            owner: getRandomItem(marketUsernames),
            description: pDesc,
            minNumber: getRandomItem([1,10,20,30,40,50,60,70]),
            price: randomNumber(20, 200) * 1000,
            unit: 'دست',
            capacityInCartoon: getRandomItem([5,10,15,20,30]),
        };
        obj.available = obj.minNumber * getRandomItem([1,2,3,4]);

        return obj;
    };

    const products = [];
    for(let i = 0; i < 25; i++) {
        const pData = createRandomProduct();
        pData.title = pTitles[i%pTitles.length];
        products.push(pData);
    }

    products.forEach((p, i) => {
        it('should create the product#'+i, (done) => {
            console.log('start task:', 'should create the product#'+i);
            // const response = await axios.post(Url('/seller/addProduct'), {product: p});
            // const data = response.data;
            // if(!data.success) {
            //     throw data.msg;
            // }
            const newP = new Product(p);
            console.log('newP:', newP);
            newP.save().then(p => {
                console.log('product saved', p);
                done();
            })
            .catch(e => {
                console.log('saving error:', e);
                done(e)}
            );
            // console.log('new product _id', product._id);
            // assert.ok(product);
        });
    });

});