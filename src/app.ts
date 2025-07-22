import 'module-alias/register';
import 'dotenv/config';
import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import puppeteer from 'puppeteer';

import { MessageRouter } from './message-router';

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: 'aura-whatsapp-bot',
    dataPath: './.wwebjs_auth/'
  }),
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

const messageRouter = new MessageRouter();

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

  if (message.from === '447927612815@c.us') {
    messageRouter.handle(message).catch((error: Error) => {
      console.error('[App] Error handling message:', error);
    });
  }
});