const https = require('https');

function testEndpoint(path) {
  return new Promise((resolve) => {
    const options = {
      method: 'GET',
      hostname: 'sky-scrapper3.p.rapidapi.com',
      port: null,
      path: path,
      headers: {
        'x-rapidapi-key': 'ad6f06ba50msh1e1f35b839023acp128c19jsnbc1187c6fff0',
        'x-rapidapi-host': 'sky-scrapper3.p.rapidapi.com'
      }
    };
    const req = https.request(options, function (res) {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        resolve({ path, status: res.statusCode, body: Buffer.concat(chunks).toString().substring(0, 100) });
      });
    });
    req.end();
  });
}

async function run() {
  console.log(await testEndpoint('/api/v1/flights/searchAirport?query=JED'));
  console.log(await testEndpoint('/api/v2/flights/searchAirports?query=JED'));
  console.log(await testEndpoint('/api/v1/flights/searchFlights'));
  console.log(await testEndpoint('/api/v2/flights/searchFlights'));
}
run();
