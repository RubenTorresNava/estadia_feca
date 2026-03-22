import bcrypt from 'bcryptjs';

const passwordPlana = '1234'; // La que quieras usar
const hash = await bcrypt.hash(passwordPlana, 10);
console.log('Tu nueva contraseña hasheada es:', hash);