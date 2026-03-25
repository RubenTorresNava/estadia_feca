import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Usuario from '../models/model.usuario.js';
import { Op } from 'sequelize';

export const login = async (req, res) => {
    try {
        const { identificador, password } = req.body;

        // Validación básica para evitar el error de "undefined"
        if (!identificador || !password) {
            return res.status(400).json({ msg: "Correo/Matrícula y contraseña son requeridos" });
        }

        const usuario = await Usuario.findOne({ 
            where: { 
                activo: true,
                [Op.or]: [
                    { correo: identificador },
                    { matricula: identificador }
                ]
            } 
        });

        // El resto del código sigue igual...
        if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
            return res.status(401).json({ msg: "Credenciales inválidas" });
        }

        const token = jwt.sign(
            { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
            process.env.JWT_SECRET || 'secret_feca_key',
            { expiresIn: '8h' }
        );

        res.json({ 
            token, 
            usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol } 
        });

    } catch (error) {
        console.error("Error en login:", error); // Aquí es donde viste el error en tu terminal de Arch
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