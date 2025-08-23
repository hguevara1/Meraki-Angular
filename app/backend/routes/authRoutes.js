import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = express.Router();

// Iniciar autenticación Google
router.get("/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account" // Forzar selección de cuenta
  })
);

// Callback de Google
router.get("/google/callback",
  passport.authenticate("google", {
    failureRedirect: process.env.FRONTEND_URL + "/login?error=auth_failed",
    session: false
  }),
  (req, res) => {
    try {
      // Generar JWT token
      const token = jwt.sign(
        {
          userId: req.user._id,
          email: req.user.email,
          role: req.user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Redirigir al frontend con el token
      res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}&login=google`);

    } catch (error) {
      console.error('❌ Error generating token:', error);
      res.redirect(process.env.FRONTEND_URL + '/login?error=token_error');
    }
  }
);

// Ruta para logout
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect(process.env.FRONTEND_URL);
});

export default router;