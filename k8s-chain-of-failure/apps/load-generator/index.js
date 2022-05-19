const https = require('http');


const REQUESTS_PER_MINUTE = process.env.REQUESTS_PER_MINUTE || 100
const requestInterval = 60 / REQUESTS_PER_MINUTE * 1000

const options = {
  hostname: 'some-microservice',
  port: 80,
  method: 'GET',
};


function sendRequest() {
    const req = https.request(options, res => {
      console.log(`statusCode: ${res.statusCode}`);
    
      res.on('data', d => {
        process.stdout.write(d);
      });
    });
    
    req.on('error', error => {
      console.error(error);
    });
    
    req.end();
}

setInterval(() => sendRequest(), requestInterval)




