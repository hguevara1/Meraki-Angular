export const environment = {
  production: false,
  // Si existe una configuración global inyectada por Docker la usa; si no, usa el fallback original
  apiUrl: (window as any).env?.apiUrl || 'http://backend:5000/api'
};

