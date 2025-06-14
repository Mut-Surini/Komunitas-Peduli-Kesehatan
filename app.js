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
const server = require('http').createServer(app);

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
mongoose.connect('mongodb+srv://fajaradiputra127:fajar1234@cluster0.j0kjnnx.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})


const globalComments = require("./Server/Global/comments.json");
let penyakit = require("./Penyakit.json");

// =======================

function upComments(server, user, pernyataan){
    if (!pernyataan) {
        console.error('No message provided');
        return;
    }

    const urlServer = `./Server/${server}/comments.json`;
    const serverComments = require(`./Server/${server}/comments.json`);

    function createArray(pernyataan){
        if (!pernyataan) return [];
        // Only return the full string, no need to split into words
        return [pernyataan];
    }

    function createArray2(pernyataan){
        if (!pernyataan) return [];
        const array = pernyataan.split(' ');
        const array2 = [];
        for(i = 0; i < (array.length-1) ; i++){
            array2.push(array[i] + ' ' + array[i+1]);
        }
        return array2;
    }
    
    function createArray3(pernyataan){
        if (!pernyataan) return [];
        const array = pernyataan.split(' ');
        const array3 = [];
        for(i = 0; i < (array.length-1) ; i++){
            if (array[i+2]) {
                array3.push(array[i] + ' ' + array[i+1] + ' ' + array[i+2]);
            }
        }
        return array3;
    }
    
    function createArray4(pernyataan){
        if (!pernyataan) return [];
        const array = pernyataan.split(' ');
        const array4 = [];
        for(i = 0; i < (array.length-1) ; i++){
            if (array[i+3]) {
                array4.push(array[i] + ' ' + array[i+1] + ' ' + array[i+2] + ' ' + array[i+3]);
            }
        }
        return array4;
    }

    function checkArray(array){
        if (!array || !array.length) return [];
        const result = new Set(); // Use Set to automatically prevent duplicates
    
        // Sort array by length in descending order to check longer phrases first
        const sortedArray = [...array].sort((a, b) => b.length - a.length);
    
        sortedArray.forEach(e => {
            if (e) {
                const normalizedInput = e.toLowerCase().trim();
                console.log('Checking input:', normalizedInput); // Debug log
                
                penyakit.forEach(f => {
                    // Check disease name
                    if(f && f.nama) {
                        const normalizedDisease = f.nama.toLowerCase().trim();
                        if(normalizedInput.includes(normalizedDisease)) {
                            console.log('Found disease match:', f.nama); // Debug log
                            result.add(f.nama);
                        }
                    }
                    
                    // Check symptoms
                    if(f && f.gejala && Array.isArray(f.gejala)) {
                        f.gejala.forEach(symptom => {
                            if(symptom) {
                                const normalizedSymptom = symptom.toLowerCase().trim();
                                // Check if the input contains the symptom
                                if(normalizedInput.includes(normalizedSymptom)) {
                                    console.log('Found symptom match:', symptom, 'for disease:', f.nama); // Debug log
                                    result.add(f.nama);
                                }
                            }
                        });
                    }
                });
            }
        }); 
    
        console.log('Final result:', Array.from(result)); // Convert Set back to array for logging
        return Array.from(result); // Convert Set back to array for return
    }
    
    function tambahKomentar(nama, comment){
        if (!nama || !comment) {
            console.error('Missing nama or comment');
            return;
        }
    
        // Combine all arrays into one before checking
        const allArrays = [
            ...createArray(comment),
            ...createArray2(comment),
            ...createArray3(comment),
            ...createArray4(comment)
        ];
        
        // Check the combined array once
        const result = checkArray(allArrays);
    
        serverComments.push({
            nama,
            comment,
            arrayComment: result
        });
    
        fs.writeFile(urlServer, JSON.stringify(serverComments), function writeJSON(err) {
            if (err) return console.log(err);
            console.log("Add Comment Success");
        });
    }

    tambahKomentar(user, pernyataan);
}

// upComments("Global", "Fitrah", "Aku juga mau");

//Server Management

let kode = 1234;

function createServer(nama, user){
    // if(fs.existsSync(`./Server/${nama}`)){
    //     throw 'Server already'
    // }
    fs.mkdirSync(`./Server/${nama}`, { recursive: true }, (err) => {
        if (err) throw err;
      });

    const info = [{
        "namaServer" : nama,
        "kodeServer" : kode+1,
        "admin" : user,
        "users" : []
    }];

    const comments = [];

    fs.writeFileSync(`./Server/${nama}/info.json`, JSON.stringify(info), (err) => {
        if(err) throw err;
        console.log('Server Create');
    });

    fs.writeFileSync(`./Server/${nama}/comments.json`, JSON.stringify(comments), (err) => {
        if(err) throw err;
    });

    kode += 1;
}

function deleteServer(nama){

    const path = require(`path`);

    const deleteFolderRecursive = function (directoryPath) {
    if (fs.existsSync(directoryPath)) {
        fs.readdirSync(directoryPath).forEach((file, index) => {
          const curPath = path.join(directoryPath, file);
          if (fs.lstatSync(curPath).isDirectory()) {
           // recurse
            deleteFolderRecursive(curPath);
          } else {
            // delete file
            fs.unlinkSync(curPath);
          }
        });
        fs.rmdirSync(directoryPath);
      }
    };

    deleteFolderRecursive(`./Server/${nama}`);
}

// createServer("Keluargaku", "Fitrah");
// deleteServer("Keluargaku");

// Comments Management

function callComments(nama, kolom){
    const comments = require(`./Server/${nama}/comments.json`);
    
    comments.forEach(e => {
        console.log("Success");
    });
}

// =======================

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

const PenyakitSchema = new Schema({
    nama: String,
    desk: String,
    gejala: [{
        type: String
    }],
    pengobatan: [{
        type: String
    }],
    pencegahan: [{
        type: String
    }],
})

const Penyakit = mongoose.model('Penyakit', PenyakitSchema)
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
        return res.render('signup',{title: 'Blog - Register',layout: 'main-regis',data: req.body, errors: errors.array()})
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
        return res.render('sign',{title: 'Blog - Login', layout: 'main-login', msg: req.flash('msg'),errors: errors.array(),data: req.body})
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
    res.redirect('/server')
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

app.post('/createServer', (req, res) => {

    createServer(req.body.nameServer, "User");

    res.redirect(`/server/${req.body.nameServer}`);
})

app.post('/joinServer', (req, res) => {

    res.redirect(`/server/${req.body.nameServer}`);
})

app.post('/server/:nama', async (req, res) => {
    try {
        const infoServer = require(`./Server/${req.params.nama}/info.json`);
        const serverComments = require(`./Server/${req.params.nama}/comments.json`);
        const user = jwt.decode(req.cookies.access_token);

        // Validate input
        if (!req.body.pernyataan || typeof req.body.pernyataan !== 'string') {
            if (req.xhr || req.headers.accept && req.headers.accept.includes('application/json')) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Invalid message format' 
                });
            }
            return res.status(400).send('Invalid message format');
        }

        // Process the message
        upComments(req.params.nama, user.data.name, req.body.pernyataan);

        // Get updated comments
        const updatedComments = require(`./Server/${req.params.nama}/comments.json`);

        // Return appropriate response
        if (req.xhr || req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.json({ 
                success: true,
                messages: updatedComments
            });
        }

        // For regular form submissions, render the page
        res.render('index', {
            layout: false, 
            serverComments: updatedComments, 
            infoServer, 
            user: {
                nama: user.data.name, 
                email: user.data.email
            }
        });
    } catch (error) {
        console.error('Error in message submission:', error);
        if (req.xhr || req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(500).json({ 
                success: false, 
                error: 'Failed to process message' 
            });
        }
        res.status(500).send('Error processing message');
    }
});

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
    res.render('signup',{title: 'Blog - Register',layout: 'main-regis'})
})
app.get('/login',(req,res) => {
    const token = req.cookies.access_token
    if(!token){
        return res.render('sign', {title: 'Blog - Login', layout: 'main-login', msg: req.flash('msg')})
    }
    jwt.verify(token,'secret',(err,decoded) => {
        if(err){
            req.flash('msg','Your session has been expired')
            res.clearCookie('access_token')
            return res.render('sign', {title: 'Blog - Login', layout: 'main-login', msg: req.flash('msg')})
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
    res.redirect('/login')
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
    setTimeout(() => {
        request('http://localhost:3000/penyakit',async (reqq,ress) => {
            const data = JSON.parse(ress.body)
    
            for(datas of data.data){
                request(datas.source_url,async (err,resp,html) => {
                    if(!err && ress.statusCode == 200){
                        const $ = cheerio.load(html)
                        let gajelas;
                        const ui = $('.post-content ul').toArray()[0]
        
                        let h3, h34, h345
                        if($('.post-content h3:contains("Gejala")').next().next().children('li').toArray().length > 0 ){
                            h3 = $('.post-content h3:contains("Gejala")').next().next().children('li')
                        }else if($('.post-content h3:contains("Gejala")').next().next().next().next().children('li').toArray().length > 0 ){
                            h3 = $('.post-content h3:contains("Gejala")').next().next().next().next().children('li')
                        }else{
                            h3 =  $('.post-content h3:contains("Gejala")').next().next().next().children('li')
                        }
                        
                        if($('.post-content h3:contains("Pengobatan")').nextAll('h4').toArray().length > 0 ){
                            h34 = $('.post-content h3:contains("Pengobatan")').nextAll('h4').toArray()
                        }else if($('.post-content h3:contains("Pengobatan")').nextAll('ul').children('li').toArray().length > 0 ){
                            if($('.post-content h3:contains("Pengobatan")').nextAll('ul').children('li').children('strong').toArray().length > 0 ){
                                h34 = $('.post-content h3:contains("Pengobatan")').nextAll('ul').children('li').children('strong').toArray()
                            }else{
                                h34 = $('.post-content h3:contains("Pengobatan")').nextAll('ul').children('li').toArray()
                            }
                        }else{
                            h34 = $('.post-content h3:contains("Pengobatan")').nextAll('p')
                        }
        
                        if($('.post-content h3:contains("Pencegahan")').nextAll('h4').toArray().length > 0 ){
                            h345 = $('.post-content h3:contains("Pencegahan")').nextAll('h4').toArray()
                        }else if($('.post-content h3:contains("Pencegahan")').nextAll('ul').children('li').toArray().length > 0 ){
                            if($('.post-content h3:contains("Pencegahan")').nextAll('ul').children('li').children('strong').toArray().length > 0 ){
                                h345 = $('.post-content h3:contains("Pencegahan")').nextAll('ul').children('li').children('strong').toArray()
                            }else{
                                h345 = $('.post-content h3:contains("Pencegahan")').nextAll('ul').children('li').toArray()
                            }
                        }else{
                            h345 = $('.post-content h3:contains("Pencegahan")').nextAll('p')
                        }
        
                        if($(ui).text().includes('Rapid Test Antibodi')){
                            gajelas = $('.post-content ul').toArray()[3]
                        }
                        
                        const lis = $(gajelas).children('li').toArray()
        
                        
                        const nama = $('.title-tag-container h1').text();
                        const desk = $('.post-detail-container .post-content p:nth-child(1)').text();
                        const gejala = []
                        const pengobatan = []
                        const pencegahan = []
        
                        for(li of h3){
                            const gjl = $(li).text().replace(/(\r\n|\n|\r)/gm, "")
                            gejala.push(gjl)
                        }
                        for(li of h34){
                            const pgb = $(li).text().replace(/(\r\n|\n|\r)/gm, "")
                            pengobatan.push(pgb)
                        }
                        for(li of h345){
                            const pncghn = $(li).text().replace(/(\r\n|\n|\r)/gm, "")
                            pencegahan.push(pncghn)
                        }
                        const auth = await Penyakit.findOne({nama})
                        if(!auth){
                            console.log(await Penyakit.create({nama,desk,gejala,pengobatan,pencegahan}))
                        }
                    }
                })
            }
        })
    }, 100)
    
})

// app.get('/global', (req,res) => {

//     res.render('index',{layout: false, globalComments, user});
// })

app.get('/penyakit/:nama', async (req,res) => {
    try {
        // Find the disease in Penyakit.json
        const penyakit = require('./Penyakit.json').find(p => 
            p.nama.toLowerCase() === req.params.nama.toLowerCase()
        );

        if (!penyakit) {
            return res.status(404).send('Penyakit tidak ditemukan');
        }

        res.render('detailpenyakit', {
            layout: false,
            penyakit: penyakit
        });
    } catch (error) {
        console.error('Error in penyakit detail:', error);
        res.status(500).send('Error loading penyakit details');
    }
});

app.get('/server/:nama', (req,res) => {
    const token = req.cookies.access_token
    if(!token){
        return res.redirect('/login')
    }

    const infoServer = require(`./Server/${req.params.nama}/info.json`);
    const serverComments = require(`./Server/${req.params.nama}/comments.json`);
    const user = jwt.decode(req.cookies.access_token)

    res.render('index', {layout: false, infoServer, serverComments, user: {nama: user.data.name, email: user.data.email}})
});

// Modify the messages API endpoint to handle errors better
app.get('/api/messages/:serverName', (req, res) => {
    try {
        const token = req.cookies.access_token;
        if(!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const serverComments = require(`./Server/${req.params.serverName}/comments.json`);
        res.json({ messages: serverComments });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

app.get('/server', (req, res) => {
    const token = req.cookies.access_token
    if(!token){
        return res.redirect('/login')
    }

    res.render('server',{layout: false});
})

app.get('/acc', async (req, res) => {
    const token = req.cookies.access_token
    if(!token){
        return res.redirect('/login')
    }

    const usr = jwt.decode(req.cookies.access_token)
    const user = await User.findOne({name: usr.data.name})
    res.render('account', {layout : false, user});
})

app.use('/',(req,res) => {
    res.statusCode = 404
    res.render('404',{title: 'Not Found', layout: '404'})
})



const io = require('socket.io')(server);
io.on('connection', (socket) => { 
    console.log('new user connected..')
    socket.on('new_message', (data) => {
        io.sockets.emit('new_message', {message: data.message})
    })
});
server.listen(3000, () => {
    console.log('Server listening on port 3000..')
});