// server/src/auth/passport-config.ts
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Kysely } from 'kysely'; // Import Kysely for type hinting
import { DatabaseSchema } from '../database/schema.js'; // Adjust path if necessary

// This import is needed to correctly extend Express types for req.user
import { Request, Response, NextFunction } from 'express';

// Re-declare global Express types if needed here, or ensure they are globally available
// (often done in a global.d.ts file or the main app.ts)
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

// Function to set up Passport strategies and serialization/deserialization
export function configurePassport(db: Kysely<DatabaseSchema>) {

  // Passport Serialization and Deserialization
  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await db.selectFrom('users')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst();

      if (user) {
        done(null, {
          id: user.id,
          google_id: user.google_id,
          name: user.name,
          email: user.email
        } as Express.User);
      } else {
        done(new Error('User not found in database'), null);
      }
    } catch (error) {
      console.error('Error deserializing user:', error);
      done(error, null);
    }
  });

  // Google OAuth 2.0 Strategy
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await db.selectFrom('users')
          .selectAll()
          .where('google_id', '=', profile.id)
          .executeTakeFirst();

        if (user) {
          done(null, {
            id: user.id,
            google_id: user.google_id,
            name: user.name,
            email: user.email
          } as Express.User);
        } else {
          const newUser = await db.insertInto('users')
            .values({
              google_id: profile.id,
              name: profile.displayName,
              email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null,
              // access_level: 'user', // Example: default access level for new users
              // created_at: new Date().toISOString(), // if your DB doesn't auto-generate
            })
            .returningAll()
            .executeTakeFirst();

          if (newUser) {
            done(null, {
              id: newUser.id,
              google_id: newUser.google_id,
              name: newUser.name,
              email: newUser.email
            } as Express.User);
          } else {
            done(new Error('Failed to create user in database'), null);
          }
        }
      } catch (error) {
        console.error('GoogleStrategy verification error:', error);
        done(error, null);
      }
    }
  ));

  console.log('Passport configured with Google Strategy.');
}