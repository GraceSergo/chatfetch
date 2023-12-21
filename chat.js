const fs = require('fs')
const https = require('http')


let msgs = {}
let loginonline = {}
try {
  let filedb = fs.readFileSync('db/message.json').toString()
  msgs = JSON.parse(filedb)
}
catch{

}

const requestListener = function (req, res) {
  if (req.method == 'GET') {
    if (req.url == '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' })
      let html = fs.readFileSync('html/index.html').toString()
      res.end(html)
    }
    if (req.url == '/scr.js') {
      res.writeHead(200, { 'Content-Type': 'text/javascript' })
      let html = fs.readFileSync('./html/scr.js').toString()
      res.end(html)
    }
    if (req.url == '/sound.mp3'){
      fs.readFile('html/sound.mp3', function (error, data) {
          if (error) {
              res.statusCode = 404;
              res.end('Resourse not found!');
          } else {
              res.end(data);
              return
          }
      })
    }
    if (req.url == '/favicon.ico'){
      fs.readFile('html/favicon.ico', function (error, data) {
        if (error) {
            res.statusCode = 404;
            res.end('Resourse not found!');
        } else {
            res.end(data);
            return
        }
      })
    }
    return
  } //get
  if (req.method == 'POST') {
    let data = ''
    req.on('data', function (chunk) {
      data += chunk
    })

    req.on('end', function () {
      if (req.url == '/send') {
        res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8' })
        try {
          let message = JSON.parse(data)
          SendMsg(message)
          res.end('1')
        } catch (e) {
          res.end('0')
        }
      }
      if (req.url == '/check') {
        res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8' })
        try {
          let message = JSON.parse(data)
          res.end(CheckMsg(message))
        } catch (e) {
          res.end('0')
        }
        
      }
      if (req.url == '/clear') {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        try {
          msgs[data] = []
          res.end('1')
        } catch {
          res.end('0');
        }
      }
    })
  }
}

const options = {
  key: fs.readFileSync('html/key.pem'),
  cert: fs.readFileSync('html/cert.pem'),
};

const httpsserver = https.createServer(requestListener);
httpsserver.listen(8080, () => {
  console.log(`Server is running on port 8080`);
})


function SendMsg(message){
  if (message.event == 'login'){
    if (msgs[message.roomId] == undefined) msgs[message.roomId] = []
    if (loginonline[message.roomId] == undefined) loginonline[message.roomId] = {}
    loginonline[message.roomId][message.userName] = message.date
  }
  if (message.event == 'message'){
    msgs[message.roomId].push(message)
  }
}

function CheckMsg(message){
  if (message.event != 'check') return '0'
  let msg = []
  if (msgs[message.roomId] == undefined) msgs[message.roomId] = []
  let msgdata = msgs[message.roomId]
  msgdata.forEach((m)=>{
    if (m.date>message.date) msg.push(m)
  })
  if (loginonline[message.roomId] == undefined) loginonline[message.roomId] = {}
  loginonline[message.roomId][message.userName]= Date.now()
  let ss = {}
  ss.msg = msg
  ss.online = loginonline[message.roomId]
  return JSON.stringify(ss)
}

setInterval(()=>{
    fs.writeFile('db/message.json',JSON.stringify(msgs),(err)=>{console.error(err)})
}, 300000);