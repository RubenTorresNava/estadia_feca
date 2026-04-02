import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configuración del transporte de Google (Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Tu correo de Gmail
        pass: process.env.EMAIL_PASS  // Tu "Contraseña de Aplicación" de Google
    }
});

/**
 * Servicio centralizado para enviar notificaciones de FecaStore
 * @param {string} emailAlumno - Destinatario
 * @param {string} nombreAlumno - Nombre para personalizar el saludo
 * @param {string} folio - Folio de la orden (ej: FECA-XXXX)
 * @param {string} nuevoEstado - El estado actual ('pendiente', 'pagada', 'listo', etc.)
 * @param {string} nota - Información extra (motivo de rechazo, total de la compra o mensaje del admin)
 */
export const enviarNotificacionEstado = async (emailAlumno, nombreAlumno, folio, nuevoEstado, nota = '') => {
    let asunto = '';
    let mensajeHtml = '';

    // Normalizamos el estado para evitar fallos por mayúsculas o espacios
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

        case 'actualizacion':
            asunto = `Notificación sobre tu orden - ${folio}`;
            mensajeHtml = `
                <div style="font-family: sans-serif; border-left: 5px solid #f39c12; padding: 20px; background: #fffcf5;">
                    <h2 style="color: #e67e22;">Mensaje de Administración</h2>
                    <p>Hola ${nombreAlumno}, se ha realizado una actualización en tu pedido <strong>${folio}</strong>:</p>
                    <p style="font-style: italic; color: #555;">"${nota}"</p>
                    <p>Puedes consultar los detalles entrando a tu perfil en FecaStore.</p>
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
            // Agregamos el replyTo por si el alumno responde, que llegue a la oficina de la FECA
            replyTo: 'administracion.feca@ujed.mx' 
        });

        console.log(`Email enviado con éxito a ${emailAlumno} (Estado: ${estadoLimpio})`);
    } catch (error) {
        console.error("Error crítico al enviar email:", error);
        // Lanzamos el error para que el controlador pueda capturarlo si es necesario
        throw error;
    }
};