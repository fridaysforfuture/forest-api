// This is needed to access the user property coming from the jwt middleware

declare namespace Express {
  interface Request {
    user?: { username: string };
  }
}
