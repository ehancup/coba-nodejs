import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import flash from 'connect-flash'
import methodOverride from 'method-override';
import ServerlessHttp from 'serverless-http';

import validator from 'express-validator';
const { body , validationResult , check } = validator


import('./utils/db.js')   
import Contact from './model/contact.js';

const app = express();
const router = express.Router();
const port = 3000

// ? set up method override
app.use(methodOverride('_method'))

// ? Gunakan ejs
app.set('view engine', 'ejs');

// ? Third party middleware
// app.use(morgan('dev'))
app.use(expressLayouts)

// ? Built-in middleware

app.use(express.static('src'))
app.use(express.urlencoded({ extended: true }))

// ? Konfigurasi flash

app.use(cookieParser('secret'))
app.use(session({
    cookie: { maxAge: 6000 },
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(flash());


// ? Halaman home
router.get('/', (req, res) => {
    // res.sendFile('./index.html' , { root : './views'});
    const akun = [
        {
            nama : 'rehan',
            umur : 16
        },
        {
            nama : 'ucup',
            umur : 16
        },
        {
            nama : 'firman',
            umur : 16
        },
    ]
    res.render('index', { name : 'rehan ucup', search : req.query.search , akun , layout : 'layouts/main-lay' , title : 'home'});
})

router.get('/about', (req, res) => {
    res.render('about', { title : 'About', layout : 'layouts/main-lay' });
})

router.get('/contact/add', (req, res) => {

    res.render('addcon', {title : 'Add contact', layout: 'layouts/main-lay'} )
})

app.post('/contact',[ 
    body('nama').custom(async (value , { req }) => {
        const duplikat = await Contact.findOne({nama: value});
        if (duplikat) {
            console.log(duplikat);
            throw new Error('nama kontak sudah digunakan')
        }
        return true
    }),
    check('email', 'email tidak valid').isEmail(), 
    check('nomor', 'nomor hape tidak valid ').isMobilePhone('id-ID')
], async (req, res) => {
    const err = validationResult(req)

    if (!err.isEmpty()) {
        res.render('addcon', { title : "ada kesalahan" , layout : "layouts/main-lay", err : err.array()})
    } else {

        // const kontak = new Contact({
        //     nama: req.body.nama,
        //     email: req.body.email,
        //     nomor: req.body.nomor
        // })

        // await kontak.save()
        await Contact.insertMany(req.body)
        
        req.flash('msg', 'Kontak berhasil ditambahkan!')
        res.redirect('/contact'); 
    }

})

router.get('/contact', async (req, res) => {

    const value = req.query.s
    // console.log(value);
    
    if (!req.query.s == "" || !req.query.s == undefined) {
        let contacts = (await Contact.find()).filter(e => e.nama.includes(value))
        // console.log(contacts);
        res.render('contact', { title : 'Contact', layout : 'layouts/main-lay' , contacts , value , msg: req.flash('msg')})
        
    } else {
        let contacts = await Contact.find()

        res.render('contact', { title : 'Contact', layout : 'layouts/main-lay' , contacts,  msg: req.flash('msg')})
    }


})

router.get('/contact/edit/:nama', async(req, res) => {
    const contact = await Contact.findOne({nama: req.params.nama})

    res.render('editcon', {title: 'edit contact', layout: 'layouts/main-lay', contact})
})

app.put('/contact',[ 
    body('nama').custom(async(value , { req }) => {
        const duplikat = await Contact.findOne({nama: value});
        if (value != req.body.oldNama && duplikat) {
            throw new Error('nama kontak sudah digunakan')
        }
        return true
    }),
    check('email', 'email tidak valid').isEmail(), 
    check('nomor', 'nomor hape tidak valid ').isMobilePhone('id-ID')
], async(req, res) => {
    const err = validationResult(req)
    if (!err.isEmpty()) {
        res.render('editcon', { title : "ada kesalahan" , layout : "layouts/main-lay", err : err.array(), contact : req.body})
    } else {

        delete req.body.oldNama;
        // method.updateContact(req.body);
        await Contact.updateOne({_id : req.body._id},{
            $set: req.body
        })  
        req.flash('msg', 'Kontak berhasil diubah!')
        res.redirect('/contact'); 
    }
})

// app.get('/contact/delete/:nama', async (req, res) => {
//     // const contact = method.findContact(req.params.nama)
//     const contact = await Contact.findOne({nama: req.params.nama})

//     if (!contact) {
//         res.status(404);
//         res.send('<h1>404</h1>')
//     } else {
//         // method.deleteContact(req.params.nama);
//         await Contact.deleteOne({nama: req.params.nama}).then(e => {

//         }) 
//         req.flash('msg',`kontak \"${req.params.nama}\" berhasil dihapus`)
//         res.redirect('/contact')
//     }
// })

app.delete('/contact',async (req, res) => {
    await Contact.deleteOne({nama: req.body.nama}).then(e => {

    }) 
    req.flash('msg',`kontak \"${req.body.nama}\" berhasil dihapus`)
    res.redirect('/contact')
})

router.get('/contact/:nama', async (req, res) => {
    const nama = req.params.nama
    const contact = (await Contact.find()).find(e => e.nama == nama)
    // console.log(contact);


    res.render('detail', { title : 'halaman detail', layout : 'layouts/main-lay' , contact , nama })
})

app.use('/.netlify',router)

// app.listen(port, () => {
//     console.log(`Mongoose contact app | listening on http://localhost:${port}`);
// })

const handler = ServerlessHttp(app)

export default { handler }
