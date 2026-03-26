import bcrypt from 'bcryptjs';

const passwordPlana = 'test123';
const hash = await bcrypt.hash(passwordPlana, 10);
console.log('Tu nueva contraseña hasheada es:', hash);