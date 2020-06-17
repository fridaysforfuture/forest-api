import mongodb from 'mongodb';

const MongoClient = mongodb.MongoClient;

const url = 'mongodb://localhost';

let entries: mongodb.Collection;

MongoClient.connect(url, { useUnifiedTopology: true })
  .then(client => client.db('forest'))
  .then(db => { entries = db.collection('entries') });

export { entries };
