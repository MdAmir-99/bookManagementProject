const express = require('express');
var bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const route = require('./routes/route.js');
const app = express();

dotenv.config({
    path:'./config.env'
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


mongoose.connect(process.env.DB_CON, { useNewUrlParser: true })
    .then(() => console.log('mongodb running on cluster ✔'))
    .catch(err => console.log(err))

app.use('/', route);

app.listen(process.env.PORT, function() {
    console.log('Express app running on port 🎧 ' + (process.env.PORT))
});