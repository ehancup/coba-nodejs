import mongoose from "mongoose";

mongoose.connect('mongodb+srv://hancup:hancup20@cluster0.gpzjnio.mongodb.net/ehan');



// // ? Menambah data
// const kontak1 = new contact({
//     nama: 'ali',
//     email: 'ali@gmail.com',
//     nomor: '908098080980'
// })

// // ? simpan ke collection
// kontak1.save().then(e => console.log(e))