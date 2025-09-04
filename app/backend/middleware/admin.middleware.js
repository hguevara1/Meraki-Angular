// middleware/admin.middleware.js
export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: "Acceso denegado. Se requieren permisos de administrador" });
  }
};