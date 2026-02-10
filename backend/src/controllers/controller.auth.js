import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Administrador from '../models/model.administrador.js';

export const login = async (req, res) => {
    const { usuario, password } = req.body;
    const admin = await Administrador.findOne({ where: { usuario } });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
        return res.status(401).json({ msg: "Credenciales inválidas" });
    }

    const token = jwt.sign(
        { id: admin.id, usuario: admin.usuario },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
    );

    res.json({ token, admin: { id: admin.id, usuario: admin.usuario } });
};

export const logout = (req, res) => {
    res.json({ msg: "Sesión cerrada" });
};