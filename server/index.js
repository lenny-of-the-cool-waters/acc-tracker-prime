// Module importations 
const cors = require('cors');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');

// Port Declaration
const port = process.env.PORT || 5000;

// Instantiating middleware
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
    cookie: { expires: 60*60*24 }
}))

// Routing
const deviceRouter = require('./routes/Devices');
const userRouter = require('./routes/Users');
const apiRouter = require('./routes/Keys');
app.use('/devices', deviceRouter);
app.use('/auth', userRouter);
app.use('/apis', apiRouter);

// Database
// const db = require('./models');