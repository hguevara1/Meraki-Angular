import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = express.Router();

// Iniciar autenticación Google
router.get("/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account"
  })
);

router.get("/google/callback",
  (req, res, next) => {
    passport.authenticate("google", { session: false }, (err, user, info) => {
      if (err) {
        console.error('❌ Auth error:', err);
        return res.redirect(process.env.FRONTEND_URL + "/login?error=auth_failed");
      }
      if (!user) {
        return res.redirect(process.env.FRONTEND_URL + "/login?error=user_not_found");
      }

      try {
        const token = jwt.sign(
          {
            userId: user._id,
            email: user.email,
            role: user.role,
            nombre: user.nombre,
            apellido: user.apellido
          },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );
        console.log('🔐 Token a enviar:', token);
        console.log('🌐 URL de redirección:', `${process.env.FRONTEND_URL}/#/auth-callback?token=${token}&success=true`);
        // ✅ SOLUCIÓN SIN INLINE SCRIPT - Redirigir con hash
        res.redirect(`${process.env.FRONTEND_URL}/#/auth-callback?token=${token}&success=true`);

      } catch (error) {
        console.error('❌ Error generating token:', error);
        res.redirect(process.env.FRONTEND_URL + '/login?error=token_error');
      }
    })(req, res, next);
  }
);

// Ruta para logout
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect(process.env.FRONTEND_URL);
});

export default router;