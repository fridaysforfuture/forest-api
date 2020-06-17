import express from 'express';
import entries from './routes/entries';

/**
 * Spins up a express server
 */
export default class App {
    /**
     * Express app
     */
    server = express();
    /**
     * Constructor
     */
    constructor() { }

    /**
     * Start server
     */
    startServer = () => {
        console.log('Starting!')
        this.server.use('/entries', entries);
        this.server.listen(3001);
    }
}


let app = new App();
app.startServer();