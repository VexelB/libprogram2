const express = require("express");
const app = new express();
const path = require("path")

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})


app.listen(5353, () => {
    console.log('listen')
})