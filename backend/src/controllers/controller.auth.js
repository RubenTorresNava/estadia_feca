import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Usuario from '../models/model.usuario.js';

export const login = async (req, res) => {
    try {
        const { identificador, password } = req.body;

        // Buscamos al usuario por correo O por matrícula
        const usuario = await Usuario.findOne({ 
            where: { 
                activo: true,
                [Op.or]: [
                    { correo: identificador },
                    { matricula: identificador }
                ]
            } 
        });

        if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
            return res.status(401).json({ msg: "Credenciales inválidas" });
        }

        const token = jwt.sign(
            { 
                id: usuario.id, 
                nombre: usuario.nombre,
                rol: usuario.rol
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({ 
            token, 
            usuario: { 
                id: usuario.id, 
                nombre: usuario.nombre, 
                rol: usuario.rol,
                correo: usuario.correo
            } 
        });

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

export const register = async (req, res) => {
    try {
        const { nombre, correo, password, matricula } = req.body;

        const existe = await Usuario.findOne({ where: { correo } });
        if (existe) return res.status(400).json({ msg: "El correo ya está registrado" });

        const nuevoUsuario = await Usuario.create({
            nombre,
            correo,
            password,
            matricula,
            rol: 'alumno'
        });

        res.status(201).json({ msg: "Usuario registrado con éxito" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const logout = (req, res) => {
    res.json({ msg: "Sesión cerrada" });
};