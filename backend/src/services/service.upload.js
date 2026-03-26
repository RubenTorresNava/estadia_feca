import multer from 'multer';
import fs from 'fs';
import path from 'path';

const dir = './uploads';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const comprobantesDir = 'uploads/comprobantes';
        if (!fs.existsSync(comprobantesDir)) {
            fs.mkdirSync(comprobantesDir, { recursive: true });
        }
        cb(null, comprobantesDir);
    },

    filename: (req, file, cb) =>{
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [ 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes (.jpeg, .png, .jpg).'), false);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {fileSize: 1024 * 1024 * 5}
});