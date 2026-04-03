import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const emailUser = process.env.EMAIL_USER?.trim();
const emailPass = process.env.EMAIL_PASS?.trim();
const emailConfigured = Boolean(emailUser && emailPass);

const transporter = emailConfigured
    ? nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: emailUser,
            pass: emailPass
        }
    })
    : null;

export const enviarNotificacionEstado = async (emailAlumno, nombreAlumno, folio, nuevoEstado, nota = '') => {
    if (!emailConfigured || !transporter) {
        console.warn('Notificaciones por correo deshabilitadas: faltan credenciales EMAIL_USER/EMAIL_PASS.');
        return;
    }

    let asunto = '';
    let mensajeHtml = '';

    const estadoLimpio = nuevoEstado ? nuevoEstado.toString().trim().toLowerCase() : '';

    switch (estadoLimpio) {
        case 'pendiente':
            asunto = `Confirmación de Pedido - ${folio}`;
            mensajeHtml = `
                <div style="font-family: sans-serif; border: 1px solid #eee; padding: 20px;">
                    <h1 style="color: #800000;">¡Hola ${nombreAlumno}!</h1>
                    <p>Hemos recibido tu pedido en <strong>FecaStore</strong> con éxito.</p>
                    <p><strong>Folio:</strong> ${folio}</p>
                    <p><strong>Total a pagar:</strong> $${nota} MXN</p>
                    <hr>
                    <p>Para continuar, por favor sube tu comprobante de pago en la sección de "Mis Pedidos" dentro de la plataforma.</p>
                </div>
            `;
            break;
        case 'en_revision':
            asunto = `Comprobante Recibido - ${folio}`;
            mensajeHtml = `
                <div style="font-family: sans-serif; border: 1px solid #eee; padding: 20px;">
                    <h1 style="color: #27ae60;">Hemos recibido tu comprobante de pago</h1>
                    <p>En breve te avisaremos cuando tu pago sea aprobado.</p>
                </div>            `;
            break;

        case 'pagada':
            asunto = `¡Pago Aprobado! - ${folio}`;
            mensajeHtml = `
                <div style="font-family: sans-serif; border: 1px solid #eee; padding: 20px;">
                    <h1 style="color: #27ae60;">Pago Validado</h1>
                    <p>Hola ${nombreAlumno}, tu pago para la orden <strong>${folio}</strong> ha sido aprobado.</p>
                    <p>En breve te avisaremos cuando tus productos estén listos para ser recogidos.</p>
                </div>
            `;
            break;

        case 'listo':
            asunto = `¡Tu pedido está listo! - ${folio}`;
            mensajeHtml = `
                <div style="font-family: sans-serif; border: 2px solid #800000; padding: 20px;">
                    <h1 style="color: #800000;">¡Listo para entrega!</h1>
                    <p>Hola ${nombreAlumno}, ya tenemos tus productos preparados.</p>
                    <p style="background: #f9f9f9; padding: 10px;">
                        <strong>¿Dónde recoger?:</strong> Ventanilla de Administración FECA.<br>
                        <strong>Horario:</strong> 9:00 AM - 6:00 PM
                    </p>
                    <p>Presenta tu credencial de alumno para que se te entregue la mercancía.</p>
                </div>
            `;
            break;

        case 'rechazado':
            asunto = `Actualización de Pedido - ${folio}`;
            mensajeHtml = `
                <div style="font-family: sans-serif; border: 1px solid #c0392b; padding: 20px;">
                    <h1 style="color: #c0392b;">Comprobante Rechazado</h1>
                    <p>Hola ${nombreAlumno}, hubo un problema con la validación de tu pago para la orden <strong>${folio}</strong>.</p>
                    <p><strong>Motivo:</strong> ${nota}</p>
                    <p>Por favor, revisa la información y vuelve a subir tu comprobante correctamente.</p>
                </div>
            `;
            break;

        default:
            asunto = `Cambio de estado en tu pedido - ${folio}`;
            mensajeHtml = `<p>Hola ${nombreAlumno}, tu pedido con folio <strong>${folio}</strong> ahora está en estado: <strong>${estadoLimpio}</strong>.</p>`;
    }

    try {
        await transporter.sendMail({
            from: '"FecaStore 🛒" <noreply@fecastore.com>',
            to: emailAlumno,
            subject: asunto,
            html: mensajeHtml,
            replyTo: 'administracion.feca@ujed.mx' 
        });

        console.log(`Email enviado con éxito a ${emailAlumno} (Estado: ${estadoLimpio})`);
    } catch (error) {
        console.error("Error crítico al enviar email:", error);
        throw error;
    }
};