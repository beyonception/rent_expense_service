const express = require('express');
const app = express();
const router = require('./routes/index')
const mongoose = require('mongoose');
require('dotenv/config');
const swaggerUi = require('swagger-ui-express')
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./Docs/expense.yaml');

app.use(express.json());
app.use('/api/expService', router);
app.use('/api/expService/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Connection for the MongoDb
mongoose.connect(process.env.DB_CONNECTION,
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then(function () {
        console.log("Connected to Mongodb")
    })
    .catch(function (err) {
        console.log("Cannot be connected to Db:", +err)

    });

//Connection for Browser
const port = process.env.SERVICE_PORT || 4000;
app.listen(port, () => {
    console.log('Listening to the port:' + port);
});