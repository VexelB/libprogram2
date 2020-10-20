const express = require("express");
const app = new express();
const path = require("path")
const { Server } = require('ws');
const wss = new Server({ port: 5354 });

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})


app.listen(5353, () => {})
wss.on('connection', (ws, req) => {
    ws.send('hi');
})