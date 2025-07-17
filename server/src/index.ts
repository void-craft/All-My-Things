// server/src/index.ts
import express from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import { setupStaticServing } from '../static-serve.js';
import { db } from './database/connection.js';
import { configurePassport } from './auth/passport-config.js';
import authRouter from './routes/auth.routes.js';
import apiRouter from './routes/api.routes.js';

dotenv.config();

const app = express();

// --- 1. User Type Definition (for TypeScript) ---
declare global {
  namespace Express {
    interface User {
      id: number;
      google_id: string;
      name: string;
      email: string | null; 
    }
    interface Request {
      user?: User;
    }
  }
}

// --- 2. Session Middleware ---
app.use(session({
  secret: process.env.SESSION_SECRET as string,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
}));

// --- 3. Body parsing middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 4. Configure Passport (initialize and setup strategies) ---
app.use(passport.initialize());
app.use(passport.session());
configurePassport(db); 

// --- 5. Mount Routers ---
app.use('/auth', authRouter); 
app.use('/api', apiRouter);


// --- 6. Static File Serving (Production only) ---
export async function startServer(port: number) { 
  try {
    if (process.env.NODE_ENV === 'production') {
      setupStaticServing(app);
    }
    app.listen(port, () => {
      console.log(`All My Things API Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// --- 7. Server Startup Logic ---
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Starting All My Things server...');
  startServer(Number(process.env.PORT) || 3001); // Ensure PORT is treated as a number
}