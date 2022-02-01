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
/* const deviceRouter = require('./routes/Devices');
const userRouter = require('./routes/Users');
const keysRouter = require('./routes/Keys');
app.use('/devices', deviceRouter);
app.use('/auth', userRouter);
app.use('/apis', keysRouter); */

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

    // Queries for creating tables
    let createAPIKeys = `CREATE TABLE IF NOT EXISTS APIKeys (
        KeyID varchar(255) NOT NULL,
        KeyName varchar(255),
        KeyIV varchar(255),
        PRIMARY KEY (KeyID)
    )`;
    let createUsers = `CREATE TABLE IF NOT EXISTS Users (
        UserID varchar(255) NOT NULL,
        Username varchar(255),
        Password varchar(255),
        UserRole int,
        Email varchar(255),
        PhoneNum varchar(255),
        PRIMARY KEY (UserID),
        CHECK (UserRole >= 1 AND UserRole <=3)
    )`;
    let createDevices = `CREATE TABLE IF NOT EXISTS Devices (
        ID int NOT NULL,
        ChannelNum varchar(255),
        NumberPlate varchar(255),
        MemberName varchar(255),
        PolicyNum varchar(255),
        UserID varchar(255),
        PRIMARY KEY (ID),
        FOREIGN KEY (UserID) REFERENCES Users(UserID)
    )`;

    

    // Creating tables
    db.query(createAPIKeys, (err, results, fields) => {
        if(err) return console.log(err.message)
    })
    db.query(createUsers, (err, results, fields) => {
        if(err) return console.log(err.message)
    })
    db.query(createDevices, (err, results, fields) => {
        if(err) return console.log(err.message)
    })

    // End connection to DB
    db.end((err) => {
        if(err) return console.log(err.message)
    })

    console.log("Connected to MySQL server.")
})