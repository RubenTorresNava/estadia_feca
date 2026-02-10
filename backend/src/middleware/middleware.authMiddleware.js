import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
    const token = req.header('x-token');

    if (!token) return res.status(401).json({ msg: "No hay token, permiso denegado" });

    try {
        const { id } = jwt.verify(token, process.env.JWT_SECRET);
        req.administrador_id = id;
        next();
    } catch (error) {
        res.status(401).json({ msg: "Token no válido" });
    }
};