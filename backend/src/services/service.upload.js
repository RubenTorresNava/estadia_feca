import multer from 'multer';
import fs from 'fs';
import path from 'path';

const dir = './uploads';
const comprobantesDir = './uploads/comprobantes';

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

if (!fs.existsSync(comprobantesDir)) {
    fs.mkdirSync(comprobantesDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Solo los comprobantes van a su subcarpeta; las demás imágenes van al root de uploads.
        if (file.fieldname === 'comprobante') {
            return cb(null, comprobantesDir);
        }

        cb(null, dir);
    },

    filename: (req, file, cb) =>{
        const extension = path.extname(file.originalname).toLowerCase();
        const safeExtension = ['.jpg', '.jpeg', '.png'].includes(extension) ? extension : '';
        const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${safeExtension}`;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    const extension = path.extname(file.originalname).toLowerCase();

    if (!allowedTypes.includes(file.mimetype) || !allowedExtensions.includes(extension)) {
        cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes (.jpeg, .png, .jpg).'), false);
        return;
    }

    cb(null, true);
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {fileSize: 1024 * 1024 * 5}
});