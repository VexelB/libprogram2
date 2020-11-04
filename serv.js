const express = require("express");
const app = new express();
const path = require("path")
const sqlite3 = require("sqlite3")
const { Server } = require('ws');
const wss = new Server({ port: 5354 });
const password = 'random';
let clients = [];

app.use(express.urlencoded());

app.use('/books.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'books.html'))
})

app.get('/*.*', (req, res) => {
    if (clients.includes(req.ip)) {
        res.sendFile(path.join(__dirname, req.path))
    }
})
app.get('/*', (req, res) => {
    if (clients.includes(req.ip)) {
        res.sendFile(path.join(__dirname, 'index.html'))
    }
    else {
        res.sendFile(path.join(__dirname, 'login.html'));
    }
})
app.post('/*', (req, res) => {
    if (req.body.pass == password) {
        clients.push(req.connection.remoteAddress);
        res.sendFile(path.join(__dirname, 'index.html'))
        setTimeout(() => {clients.splice(clients.indexOf(req.connection.remoteAddress, 1))}, 1000)
    }
    else {
        res.sendFile(path.join(__dirname, 'login.html'));
    }
})

app.listen(5353, () => {})
wss.on('connection', (ws, req) => {
    let db = new sqlite3.Database('sqlite.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
          console.error(err.message);
        }
    });
    db.serialize(() => {
        db.all(`select * from assoc`, (err,rows) => {
            ws.send(JSON.stringify({action: "init", content: rows}))
        })
    })
    ws.on('message', (d) => {
        d = JSON.parse(d)
        if (d.action == "get") {
            let db = new sqlite3.Database('sqlite.db', sqlite3.OPEN_READWRITE, (err) => {
                if (err) {
                  console.error(err.message);
                }
            });
            db.serialize(() => {
                db.all(d.sql, (err,rows) => {
                    ws.send(JSON.stringify({action: "rows", content: rows, table: d.table}))
                })
            })
        }
    })
})