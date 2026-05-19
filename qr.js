const qrcode = require('qrcode-terminal');
const { networkInterfaces } = require('os');

const nets = networkInterfaces();
let ip = 'localhost';

for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    if (net.family === 'IPv4' && !net.internal) {
      ip = net.address;
      break;
    }
  }
}

const url = `http://${ip}:3000`;
console.log('\n📱 Scan this QR code on your phone:');
qrcode.generate(url, { small: true });
console.log(`\n🔗 Or open: ${url}\n`);