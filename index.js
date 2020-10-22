window.history.pushState(null, null, '/');
const ws = new WebSocket ("ws://localhost:5354")
let reqbody = {}

reqbody.action = "get"
reqbody.table = "books"
setTimeout(() => {ws.send(JSON.stringify(reqbody))}, 1000) 
ws.onmessage = (d) => {
    let data = JSON.parse(d.data)
        
    if (data.action == "rows") {
        for (let i = 1; i <= Math.ceil(data.content.length / 50); i++) {
            document.getElementById('maindata').innerHTML += `<div id = "page${i}">${i}</div>`
        }
    }
};