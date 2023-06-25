import mongoose from "mongoose"

// ? Membuat schema
const Contact = mongoose.model('contact', {
    nama : {
        type: String,
        required: true
    },
    email : String,
    nomor:{
        type: String,
        required: true
    }

},'kontak')

export default Contact;