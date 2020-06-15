import express from 'express';
import entries from './routes/entries';

const app = express();
app.use('/entries', entries);
app.listen(3000);
