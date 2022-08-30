const fs = require('fs');
const express = require('express');
require('dotenv').config()
const app = express()

console.log(process.env.GOOGLE_MAPS_API_KEY)

app.use(express.static('static'))

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index.html")
})

app.get("/database", function (req, res) {
    res.send(JSON.parse(fs.readFileSync('./db/floats.json')));
})

app.listen(process.env.PORT, function () {
    console.log("Node serving is running...");
})