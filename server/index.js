// MODULE IMPORTATIONS
const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

//  PORT DECLARATION
const port = process.env.PORT || 5000;

// INSTANTIATING EXPRESS
const app = express();
app.use(cors({
    origin: [process.env.CLIENT_ADDR],
    methods: ["GET", "POST", "PUT"],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    key: "",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 60*60*24
    }
}))

// ROUTING
const deviceRouter = require('./routes/Devices');
const userRouter = require('./routes/Users');
const keysRouter = require('./routes/Keys');
app.use('/devices', deviceRouter);
app.use('/auth', userRouter);
app.use('/apis', keysRouter);

// INITIALIZING THE DATABASE
dotenv.config();
let db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
})
db.connect((err) => {
    if(err) { 
        return console.error(`Error: ${err.message}`);
    }

    let createTable = `create table if not exists acc_tracker_prime(
        id 
    )`;

    console.log("Connected to MySQL server.")
})