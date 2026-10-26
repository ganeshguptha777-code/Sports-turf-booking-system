const { MongoMemoryServer } = require('mongodb-memory-server');

(async () => {
  const mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri('turfbook');
  process.env.JWT_SECRET = 'local-browser-test-secret-long-enough';
  process.env.NODE_ENV = 'test';
  process.env.PORT = '5055';
  process.env.SEED_DEMO = 'true';
  process.env.TIMEZONE = 'Asia/Kolkata';
  const { start } = require('./server/index');
  await start();
  console.log('[test] browser test server ready on http://127.0.0.1:5055');
  process.on('SIGINT', async () => {
    await mongod.stop();
    process.exit(0);
  });
  setInterval(() => {}, 1000 * 60 * 60);
})();
