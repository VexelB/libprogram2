// init
const ws = new WebSocket ("ws://localhost:5354")
let reqbody = {}
document.querySelectorAll('.table').forEach((x) => {
    x.addEventListener('click', (x) => {
        get(x.target.id)
        document.querySelectorAll('.data').forEach((e) => {
            if (e.id == x.target.id) {
                e.style.display = 'block'
            }
            else {
                e.style.display = "none"
            }
        })
        document.querySelectorAll('.pages').forEach((e) => {
            if (e.id == x.target.id) {
                e.style.display = 'block'
            }
            else {
                e.style.display = "none"
            }
        })
    })
})

//functions
let get = (x) => {
    reqbody.action = "get"
    reqbody.table = x
    ws.send(JSON.stringify(reqbody))
}

// body
ws.onmessage = (d) => {
    let data = JSON.parse(d.data)
    if (data.action == "rows") {
        document.querySelector(`#pages #${data.table}`).innerHTML = ''
        for (let i = 1; i <= Math.ceil(data.content.length / 50); i++) {
            document.querySelector(`#pages #${data.table}`).innerHTML += `<div class = "page" id = "page${i}">${i}</div>`
            document.querySelector(`#maindata #${data.table}`).innerHTML += `<div class = "data" id = "page${i}" style="display:none">${i}</div>`
        }
        document.querySelector(`#${data.table} #page1`).style.display = 'block';
        
        // page switch listener
        document.querySelectorAll('#pages .page').forEach((x) => {
            x.addEventListener('click', (q) => {
                document.querySelectorAll(`#maindata #${data.table} div`).forEach((w) => {
                    if(q.target.id == w.id) {
                        w.style.display = "block";
                    }
                    else {
                        w.style.display = "none";
                    }
                })
            })
        })
    }
};