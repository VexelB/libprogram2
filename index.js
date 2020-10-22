// init
window.history.pushState(null, null, '/');
const ws = new WebSocket ("ws://localhost:5354")
let reqbody = {}
// setTimeout(() => {ws.send(JSON.stringify(reqbody))}, 1000)
let func = (s) => {
    let ms = s % 1000;
    s = (s - ms) / 1000;
    let secs = s % 60;
    s = (s - secs) / 60;
    let mins = s % 60;
    let hrs = (s - mins) / 60;
    
    return `${mins}:${secs.toString().padStart(2,'0')}`;
} 
for  (let i = 600000; i>0; i=i-1000) {
    setTimeout(() => {document.getElementById('timelast').innerHTML = func(i)}, 600000 - i)
}
setTimeout(() => {window.location.reload(false);}, 600000)


// body
reqbody.action = "get"
reqbody.table = "books"

ws.onmessage = (d) => {
    let data = JSON.parse(d.data)
        
    if (data.action == "rows") {
        for (let i = 1; i <= Math.ceil(data.content.length / 50); i++) {
            document.getElementById('maindata').innerHTML += `<div id = "page${i}">${i}</div>`
        }
    }
};