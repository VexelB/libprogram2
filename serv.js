const express = require("express");
const app = new express();
const path = require("path")
const { Server } = require('ws');
const wss = new Server({ port: 5354 });
const password = 'adminka';

app.get('/*', (req, res) => {
    if (req.query.pass == password) {
        res.sendFile(path.join(__dirname, 'index.html'))
    }
    else {
        res.sendFile(path.join(__dirname, 'login.html'));
    }
})

app.listen(5353, () => {})
wss.on('connection', (ws, req) => {
    console.log('ura')
    ws.on('message', (d) => {
        let temp = JSON.parse(d);
    })
})