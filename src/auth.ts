import jwt from 'express-jwt';
import fs from 'fs';

// Top-Level await would make this so much nicer
const publicKey = fs.readFileSync('key.rs');
const needAuth = jwt({
  secret: publicKey
});

export { needAuth };
