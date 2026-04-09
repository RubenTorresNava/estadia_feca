import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Usuario from '../models/model.usuario.js';
import { Op } from 'sequelize';

export const login = async (req, res) => {
    try {
        const { identificador, password } = req.body;

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
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                matricula: usuario.matricula,
                rol: usuario.rol
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

export const perfil = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.usuario.id, {
            attributes: ['id', 'nombre', 'correo', 'matricula', 'rol']
        });

        if (!usuario) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        res.json({ usuario });
    } catch (error) {
        console.error('Error en perfil:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};