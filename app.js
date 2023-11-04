const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
const request = require('request-promise')
const cheerio = require('cheerio')
const faker = require('faker')


const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt')
const { nanoid } = require('nanoid')
const nodemailer = require('nodemailer');
// Mailer transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sheeshcuy33@gmail.com',
        pass: 'fajar1234'
    }
});
// End of Mailer transport


// Flash Message npm
const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')
// Flash Message npm


faker.locale = 'id_ID'
const Schema = mongoose.Schema
const app = express()
const csvWriter = require('csv-write-stream');
const fs = require('fs');
const { decode } = require('punycode')
const writer = csvWriter();
writer.pipe(fs.createWriteStream('queries.csv'));

mongoose.set('debug', function (collection, method, query, doc) {
    writer.write({
        collection: collection,
        method: method,
        query: query,
        doc: JSON.stringify(doc)
    });
});

// close stream on mongoose disconnected
mongoose.connection.on('disconnected', function () {
    writer.end();
});
mongoose.connect('mongodb+srv://fajaradiputra127:fajar1234@cluster0.u62fkfd.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})

const UserSchema = new Schema({
    name: {
        type: String,
        unique: true,
        dropDups: true
    },
    email: {
        type: String,
        unique: true,
        dropDups: true
    },
    tinggi: Number,
    berat: Number,
    golDar: String,
    umur: Number,
    gender: String,
    password: String,
    isActive: {
        type: Boolean,
        default: true
    },
    role: String
})

const RoleSchema = new Schema({
    nama: String
})

const TokenSchema = new Schema({
    token: String,
    email: String,
    type: String
})

const Role = mongoose.model('Role', TokenSchema)
const User = mongoose.model('User', UserSchema)
const Token = mongoose.model('Token',TokenSchema)

app.use(expressLayouts)
app.use(express.static('assets'))
app.use(express.urlencoded({extended: true}))
app.set('view engine', 'ejs')
app.set('layout', 'main')
app.use(cookieParser('secret'))
app.use(session({cookie: {},secret: 'secret',resave: true,saveUninitialized: true }))
app.use(flash())
app.use((req,res,next) => {
    const token = req.cookies.access_token;
    if(!token){
        return next()
    }
    jwt.verify(token,'secret',(err,decode) => {
        if(err){
            res.clearCookie('access_token')
            return next()
        }
        res.locals = {login: true, username: decode.data.name}
        next()
    })
})
// Auth
app.post('/register',[body('username').isLength({min: 4}).withMessage('This field required at least 4 chars').trim().custom(async value => {
    const user = await User.findOne({name: value})
    if(user){
        return Promise.reject('Username already in use')
    }
}),body('password').isLength({min: 5}).withMessage('This field required at least 5 chars').trim().custom((value,{req}) => {
    if(value != req.body.password2){
        return Promise.reject('Password not match')
    }
    return true
}),body('email').isLength({min: 1}).withMessage('This field is required').isEmail().withMessage('Insert a valid email').custom(async value => {
    const user = await User.findOne({email: value})
    if(user){
        return Promise.reject('E-mail already in use')
    }
}), body('role').isLength({min: 1}).withMessage('This field is required'),
    body('tinggi').isLength({min: 1}).withMessage('This field is required').isNumeric().withMessage('Masukkan angka yang valid!'),
    body('berat').isLength({min: 1}).withMessage('This field is required').isNumeric().withMessage('Masukkan angka yang valid!'),
    body('umur').isLength({min: 1}).withMessage('This field is required').isNumeric().withMessage('Masukkan angka yang valid!')],async(req,res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.render('registration',{title: 'Blog - Register',layout: 'main-login-regis',data: req.body, errors: errors.array()})
    }
    const token = nanoid()
    await Token.create({token, email: req.body.email,type: 'activation'})
    await User.create({name: req.body.username,email: req.body.email,password: bcrypt.hashSync(req.body.password,10), role: req.body.role, tinggi: req.body.tinggi, berat: req.body.berat, umur: req.body.umur, golDar: req.body.golDar, gender: req.body.gender})
    
    res.redirect('/login')
})
app.post('/login',[body('email').isLength({min: 1}).withMessage('This field is required').isEmail().withMessage('Insert a valid email').custom(async(value,{req}) =>{
    const user = await User.findOne({email: value})
    if(!user){
        return Promise.reject('E-mail or password incorrect')
    }
    if(!user.isActive){
        return Promise.reject('This account hasn\'t been verify yet')
    }
    const match = bcrypt.compareSync(req.body.password,user.password)
    if(!match){
        return Promise.reject('E-mail or password incorrect')
    }
}),body('password').isLength({min: 1}).withMessage('This field is required')],async(req,res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.render('login',{title: 'Blog - Login', layout: 'main-login-regis', msg: req.flash('msg'),errors: errors.array(),data: req.body})
    }
    const user = await User.findOne({email: req.body.email}).select('email name')
    // set jwt token
    const token = jwt.sign({data: {id: user._id, email: user.email, name: user.name}},'secret',{expiresIn: '7d'})
    // decoded jwt token
    const expireTime = jwt.verify(token,'secret')
    // get date of jwt exp
    const d = new Date(0)
    d.setUTCSeconds(expireTime.exp)
    // set token and expires to cookie
    if(req.body.remember){
        res.cookie("access_token",token,{
            httpOnly: true,
            expires: d
        })
    }
    if(!req.body.remember){
        res.cookie("access_token",token,{
            httpOnly: true,
        })
    }
    res.redirect('/login')
})
app.post('/forgotpassword',body('email').isLength({min: 1}).withMessage('This field is required').isEmail().withMessage('Insert a valid E-mail').custom(async value => {
    const user = await User.findOne({email: value})
    if(!user){
        return Promise.reject('E-mail not found')
    }
    if(!user.isActive){
        return Promise.reject('This E-mail hasn\'t been verify yet')
    }
}),async(req,res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        res.statusCode = 400
        return res.send(JSON.stringify({data: "data yang dimasukkan salah", errors: errors.array(), userData: req.body}))
    }
    const token = nanoid()
    await Token.create({token, email: req.body.email,type: 'reset'})
    // mail to user
    const mailOptions = {
        from: 'sheeshcuy33@gmail.com',
        to: `${req.body.email}`,
        subject: 'Visit this link to reset your password',
        html: `Click this link to reset your password : <a href="http://localhost:3000/auth/reset/${token}">Reset Password</a>`
    };     
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) throw err;
        console.log('Email sent: ' + info.response);
    }); 
    req.flash('msg','Check your e-mail for reset password')
    res.redirect('/forgotpassword')
})
app.post('/auth/reset/:token',body('password').isLength({min: 1}).withMessage('This field is required').custom((value,{req}) => {
    if(value !=  req.body.confirmpassword){
        return Promise.reject('Password doesn\'t match')
    }
    return true
}),async(req,res,next) => {
    const token = await Token.findOne({token: req.params.token, type: 'reset'})
    if(!token){
        return next()
    }
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.render('resetform',{title: 'Blog - Reset Password', layout: 'main-login-regis',msg: req.flash('msg'),data: req.body,errors: errors.array()})
    }
    await User.updateOne({email: token.email},{password: bcrypt.hashSync(req.body.password,10)})
    await Token.deleteMany({email: token.email, type: token.type})
    req.flash('msg','Your password has been changed please login')
    res.redirect('/login')
})
// End of Auth

app.get('/', (req, res) => {
    const token = req.cookies.access_token
    if(!token){
        return res.redirect('/login')
    }
    res.render('home', {
        title: 'Home',
        active: 'home',
    })
})
app.get('/register',(req,res,next) => {
    if(res.locals.login){
        return next()
    }
    res.render('registration',{title: 'Blog - Register',layout: 'main-login-regis'})
})
app.get('/login',(req,res) => {
    const token = req.cookies.access_token
    if(!token){
        return res.render('login', {title: 'Blog - Login', layout: 'main-login-regis', msg: req.flash('msg')})
    }
    jwt.verify(token,'secret',(err,decoded) => {
        if(err){
            req.flash('msg','Your session has been expired')
            res.clearCookie('access_token')
            return res.render('login', {title: 'Blog - Login', layout: 'main-login-regis', msg: req.flash('msg')})
        }else{
            return res.redirect('/')
        }
    })
})
app.get('/logout',async(req,res,next) => {
    const token = req.cookies.access_token
    if(!token){
        return next()
    }
    res.clearCookie('access_token')
    res.redirect('/')
})
app.get('/auth/activation/:token',async(req,res,next) => {
    const token = await Token.findOne({token: req.params.token})
    if(!token){
        return next()
    }
    await User.updateOne({email: token.email},{isActive: true})
    await Token.deleteMany({email: token.email, type: 'activation'})
    req.flash('msg','Your account has been verify please login')
    res.redirect('/login')
})
app.get('/auth/reset/:token',async(req,res,next) => {
    const token = await Token.findOne({token: req.params.token})
    if(!token){
        return next()
    }
    res.render('resetform',{title: 'Blog - Reset Password', layout: 'main-login-regis',msg: req.flash('msg')})
})
app.get('/forgotpassword',(req,res,next) => {
    if(res.locals.login){
        return next()
    }
    res.render('forgot',{title: 'Blog - Forgot Password', layout: 'main-login-regis',msg: req.flash('msg')})
})
app.get('/dashboard',(req,res,next) => {
    jwt.verify(req.cookies.access_token,'secret',async(err,decode) => {
        if(err){
            return next()
        }
        res.render('dashboard',{title: 'Dashboard', active: '',layout: 'main-dashboard', userData: decode.data})  
    })
})
app.get('/home',(req,res) => {
    res.redirect('/')
})

app.get('/test',(req,res) => {
    request('http://localhost:3000/penyakit',(reqq,ress) => {
        const data = JSON.parse(ress.body)
        request(data.data[30].source_url,(err,resp,html) => {
            if(!err && ress.statusCode == 200){
                const $ = cheerio.load(html)
                let gajelas;
                const ui = $('.post-content ul').toArray()[0]
                const h3 = $('.post-content h3')[1]

                if($(ui).text().includes('Rapid Test Antibodi')){
                    gajelas = $('.post-content ul').toArray()[3]
                }else if($(h3).text().includes('Gejala')){
                    gajelas = $('.post-content ul').toArray()[1]
                }else{
                    gajelas = $('.post-content ul').toArray()[2]
                }
                const lis = $(gajelas).children('li').toArray()

                
                const nama = $('.title-tag-container h1').text();
                const desk = $('.post-detail-container .post-content p:nth-child(1)').text();
                const gejala = [];

                for(li of lis){
                    const gjl = $(li).text()
                    gejala.push(gjl)
                }
                console.log({nama,desk,gejala})
            }
        })
    })
})
app.use('/',(req,res) => {
    res.statusCode = 404
    res.render('404',{title: 'Not Found', layout: '404'})
})
app.listen(3001, () => {
    console.log('Server listening on port 3001..')
})