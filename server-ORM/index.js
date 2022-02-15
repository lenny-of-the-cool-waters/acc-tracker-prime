// Module importations
const cors = require('cors');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');

// Port Declaration
const port = process.env.PORT || 5000;

// Instantiating middleware
const app = express();
app.use(
  cors({
    origin: [process.env.CLIENT_ADDR],
    methods: ['GET', 'POST', 'PUT'],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    key: '',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { expires: 60 * 60 * 24 },
  })
);

// Routing
const deviceRouter = require('./routes/Devices');
const userRouter = require('./routes/Users');
const apiRouter = require('./routes/Keys');
app.use('/devices', deviceRouter);
app.use('/auth', userRouter);
app.use('/apis', apiRouter);

// DB
const db = require('./models');
db.sequelize
  .sync()
  .then(async () => {
    const superAdmin = await db.Users.findOne({
      where: { username: 'SuperAdmin' },
    });

    if (!superAdmin) {
      bcrypt.hash('Password01!', 13).then((hash) => {
        db.Users.create({
          id: '1',
          username: 'SuperAdmin',
          password: hash,
          userRole: 'super',
          email: 'lennygith@gmail.com',
        });
      });
    }
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  });
