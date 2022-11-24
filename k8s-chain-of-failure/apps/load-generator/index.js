const http = require('http');


const REQUESTS_PER_MINUTE = process.env.REQUESTS_PER_MINUTE || 100
const requestInterval = 60 / REQUESTS_PER_MINUTE * 1000

const NUM_BACKENDS_EXPECTED = process.env.NUM_BACKENDS_EXPECTED

const options = {
  hostname: 'microservice',
  port: 80,
  method: 'GET',
};

const backends_seen = new Set()

const sendBackendDiscoveryRequest = () => {
    const path = '/discover'
    const req = http.request({ ...options, path}, res => {
        res.on('data', d => {
            console.log(d.toString())
            const responseObject = JSON.parse(d.toString())
            const serverID = responseObject['serverID']
            backends_seen.add(serverID)
        })
      })

      req.on('error', error => {
        const errObj = {
            "clientError": {
                "name": error.name,
                "stack": error.stack,
                "message": error.message,
            },
        }
      console.error(JSON.stringify(errObj));
    })

      req.end()
}

function sendRequest() {
    if (backends_seen.size < NUM_BACKENDS_EXPECTED) {
        sendBackendDiscoveryRequest()
        return
    }
    const req = http.request(options, res => {
      res.on('data', d => {
        console.log(d.toString())
      })
    })
    
    req.on('error', error => {
        const errObj = {
            "clientError": {
                "name": error.name,
                "stack": error.stack,
                "message": error.message,
            },
        }
      console.error(JSON.stringify(errObj));
    })
    
    req.end()
}

setInterval(() => sendRequest(), requestInterval)
