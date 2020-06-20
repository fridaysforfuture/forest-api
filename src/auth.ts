import dotenv from 'dotenv';
import jwt from 'express-jwt';
import fs from 'fs';
dotenv.config();

// Top-Level await would make this so much nicer
if (process.env.KEY_FILE === undefined) {
  process.env.KEY_FILE = 'key.rs';
}
const publicKey = fs.readFileSync(process.env.KEY_FILE);
const needAuth = jwt({
  secret: publicKey
});

export { needAuth };
