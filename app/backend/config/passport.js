// config/passport.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

const configurePassport = () => {
  // En modo test, no configuramos Google OAuth
  if (process.env.NODE_ENV === 'test') {
    console.log('⚠️  Modo test: Omitiendo configuración de Google OAuth');
    return passport;
  }

  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('❌ Google OAuth credentials not found in environment variables');
  }

  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // ... lógica existente de Google OAuth
    } catch (error) {
      return done(error, null);
    }
  }));

  // ... resto de la configuración de passport

  return passport;
};

export default configurePassport;