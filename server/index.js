// DEPENDENCY IMPORTATIONS
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
app.listen(port, () => console.log(`Server listening on port ${port}`))

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
        ApiID int INCREMENT NOT NULL,
        Name varchar(255),
        Api varchar(255),
        IV varchar(255),
        PRIMARY KEY (KeyID)
    )`;
    let createUsers = `CREATE TABLE IF NOT EXISTS Users (
        UserID int INCREMENT NOT NULL,
        Username varchar(255),
        Password varchar(255),
        Role int,
        Email varchar(255),
        PhoneNum varchar(255),
        PRIMARY KEY (UserID),
        CHECK (UserRole >= 1 AND UserRole <=3)
    )`;
    let createDevices = `CREATE TABLE IF NOT EXISTS Devices (
        DeviceID int INCREMENT NOT NULL,
        ChannelNum varchar(255),
        NumberPlate varchar(255),
        MemberName varchar(255),
        PolicyNum varchar(255),
        UserID varchar(255),
        PRIMARY KEY (DeviceID),
        FOREIGN KEY (UserID) REFERENCES Users(UserID)
    )`;
    let createTicketCreation = `CREATE TABLE IF NOT EXISTS TicketCreation (
        TicketID int INCREMENT NOT NULL,
        CreatedBy varchar(255),
        CreationTime timestamp,
        lat FLOAT( 10, 6 ),  
        lng FLOAT( 10, 6 ),
        PRIMARY KEY (TicketID)
    )`;
    let createTicketAssignment = `CREATE TABLE IF NOT EXISTS TicketAssignment (
        AssignmentID int INCREMENT NOT NULL,
        AssignedBy int,
        AssignedTo int,
        AssignmentTime timestamp,
        ClosingTime timestamp,
        Turnaround TIMESTAMPDIFF(MINUTE, AssignmentTime, ClosingTime),
        AssignmentAlert int,
        PRIMARY KEY (AssignmentID),
        FOREIGN KEY (TicketID) REFERENCES TicketCreation(TicketID)
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
    db.query(createTicketCreation, (err, results, fields) => {
        if(err) return console.log(err.message)
    })
    db.query(createTicketAssignment, (err, results, fields) => {
        if(err) return console.log(err.message)
    })

    // End connection to DB
    db.end((err) => {
        if(err) return console.log(err.message)
    })

    console.log("Connected to MySQL server.")
})