const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/turfbook';

  mongoose.set('strictQuery', true);

  try {
    const connection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[db] connected to ${connection.connection.host}/${connection.connection.name}`);
    return connection;
  } catch (error) {
    console.error('[db] connection failed:', error.message);
    throw error;
  }
}

module.exports = { connectDB };
