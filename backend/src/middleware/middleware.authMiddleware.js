import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
    const token = req.header('x-token');

    if (!token) {
        return res.status(401).json({ msg: "Acceso denegado. No se proporcionó un token." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_feca_key');
        
        req.usuario = decoded; 
        next();
    } catch (error) {
        res.status(401).json({ msg: "Token no válido o expirado." });
    }
};

export const esAdmin = (req, res, next) => {
    if (!req.usuario || req.usuario.rol !== 'admin') {
        return res.status(403).json({ msg: "Permiso denegado. Se requiere rol de administrador." });
    }
    next();
};