import mongodb from 'mongodb';

const MongoClient = mongodb.MongoClient;

const url = 'mongodb://localhost';

const client = await MongoClient.connect(url, { useUnifiedTopology: true });
const db = client.db('forest');

export const entries = db.collection('entries');
