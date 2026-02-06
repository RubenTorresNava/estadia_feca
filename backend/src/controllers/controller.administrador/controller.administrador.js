import connection from '../../services/service.connection.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const loginAdministrador = async (req, res) => {
    try {
        const { usuario, password } = req.body;

        if (!usuario || !password) {
            return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
        }

        const query = 'SELECT * FROM administrador WHERE usuario = $1';
        const result = await connection.query(query, [usuario]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'El usuario no existe' });
        }
        
        const user = result.rows[0];

        // Validar contraseña
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // Firmar Token
        const token = jwt.sign(
            { id_administrador: user.id_administrador }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        // Devolver token al cliente
        return res.status(200).json({
            message: 'Sesión iniciada correctamente',
            token
        });

    } catch (error) {
        console.error(error); // Log para debuggear en consola
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}