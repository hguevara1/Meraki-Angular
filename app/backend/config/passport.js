// config/passport.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";

// Función para configurar la estrategia de Google
const configurePassport = () => {
  // Verificar que las variables de entorno estén cargadas
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('❌ Google OAuth credentials not found in environment variables');
  }

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('📨 Perfil de Google recibido:', profile.emails[0].value);

      let user = await User.findOne({
        $or: [
          { googleId: profile.id },
          { email: profile.emails[0].value }
        ]
      });

      if (user) {
        console.log('✅ Usuario existente encontrado');
        if (!user.googleId) {
          user.googleId = profile.id;
          user.avatar = profile.photos[0].value;
          user.emailVerified = true;
          await user.save();
        }
        return done(null, user);
      }

      // Crear nuevo usuario
      user = new User({
        googleId: profile.id,
        email: profile.emails[0].value,
        nombre: profile.name.givenName,
        apellido: profile.name.familyName || '',
        avatar: profile.photos[0].value,
        emailVerified: true
      });

      await user.save();
      console.log('🎉 Nuevo usuario creado con Google');
      return done(null, user);

    } catch (error) {
      console.error('❌ Error en Google Strategy:', error);
      return done(error, null);
    }
  }));

  return passport;
};

export default configurePassport; // Exportar la función de configuración