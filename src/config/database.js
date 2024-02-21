

import mongoose from 'mongoose';

const URL = 'mongodb+srv://coder_55605:coder_55605@cluster0.fuyh6ix.mongodb.net/ecommerce';
const db = mongoose.connection;
mongoose.connect(URL, {});

db.once('open', () => {
    console.log('Database connected');
});

export { mongoose, db };