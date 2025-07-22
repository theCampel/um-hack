import 'module-alias/register';
import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import puppeteer from 'puppeteer';
import express from 'express';
import fs from 'fs';
import path from 'path';

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    executablePath: puppeteer.executablePath(),
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  }
});

client.initialize();

const appExpress = express();
const PORT = process.env.PORT || 3001;

appExpress.get('/api/habits', (req, res) => {
  const habitsPath = path.join(__dirname, '..', 'data', 'habits.json');
  fs.readFile(habitsPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read habits.json' });
    }
    res.json(JSON.parse(data));
  });
});

appExpress.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});


client.on('qr', (qr: string) => {
  // Generate and scan this code with your phone
  console.log('QR code received - scan with your phone:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ WhatsApp client is ready!');
  console.log(`Running in ${process.env.APP_ENV} mode.`);
  

});


client.on('message', (message) => {
  console.log("The message.body is :", message.body);
});
