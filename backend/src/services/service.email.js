import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const emailUser = process.env.EMAIL_USER?.trim();
const emailPass = process.env.EMAIL_PASS?.trim();
const emailConfigured = Boolean(emailUser && emailPass);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const palette = {
    tomato: '#C73A3A',
    wine: '#6E2C2F',
    olive: '#8E8E90',
    charcoal: '#4A4A4D',
    parchment: '#F2F1EC',
    soft: '#FBFAF7',
    line: '#E2DDD5'
};

const assetsDir = path.resolve(__dirname, '../../../frontend/public');
const logoFecaPath = path.join(assetsDir, 'fecastor.png');
const logoUjedPath = path.join(assetsDir, 'logoUjed.png');

const logoAttachments = [
    fs.existsSync(logoFecaPath)
        ? { filename: 'fecastor.png', path: logoFecaPath, cid: 'logo-feca' }
        : null,
    fs.existsSync(logoUjedPath)
        ? { filename: 'logoUjed.png', path: logoUjedPath, cid: 'logo-ujed' }
        : null
].filter(Boolean);

const transporter = emailConfigured
    ? nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: emailUser,
            pass: emailPass
        }
    })
    : null;

const estadoMeta = {
    pendiente: {
        titulo: 'Pedido recibido',
        color: palette.tomato,
        fondo: 'rgba(199, 58, 58, 0.12)',
        borde: 'rgba(199, 58, 58, 0.28)',
        mensaje: 'Tu pedido fue registrado correctamente y está pendiente de pago.'
    },
    en_revision: {
        titulo: 'Comprobante en revisión',
        color: palette.wine,
        fondo: 'rgba(110, 44, 47, 0.12)',
        borde: 'rgba(110, 44, 47, 0.28)',
        mensaje: 'Ya recibimos tu comprobante y estamos validándolo.'
    },
    pagada: {
        titulo: 'Pago aprobado',
        color: '#2F7D4F',
        fondo: 'rgba(47, 125, 79, 0.12)',
        borde: 'rgba(47, 125, 79, 0.25)',
        mensaje: 'Tu pago fue validado y tu pedido continúa a preparación.'
    },
    listo: {
        titulo: 'Pedido listo',
        color: palette.charcoal,
        fondo: 'rgba(74, 74, 77, 0.10)',
        borde: 'rgba(74, 74, 77, 0.24)',
        mensaje: 'Tus productos ya están listos para ser recogidos.'
    },
    rechazado: {
        titulo: 'Comprobante rechazado',
        color: '#A63D2F',
        fondo: 'rgba(166, 61, 47, 0.10)',
        borde: 'rgba(166, 61, 47, 0.25)',
        mensaje: 'Hubo un problema con la validación de tu comprobante.'
    }
};

const escapeHtml = (value = '') => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const crearPlantillaCorreo = ({ nombreAlumno, folio, estado, nota = '' }) => {
    const estadoInfo = estadoMeta[estado] || {
        titulo: 'Actualización de tu pedido',
        color: palette.charcoal,
        fondo: 'rgba(74, 74, 77, 0.10)',
        borde: 'rgba(74, 74, 77, 0.20)',
        mensaje: 'Hay una actualización importante en tu pedido.'
    };

    const nombreSeguro = escapeHtml(nombreAlumno || 'estudiante');
    const folioSeguro = escapeHtml(folio || 'N/D');
    const notaSeguro = escapeHtml(nota || '');

    const detallePrincipal = (() => {
        switch (estado) {
            case 'pendiente':
                return `
                    <p style="margin: 0 0 14px; color: ${palette.charcoal}; line-height: 1.7;">
                        Hemos recibido tu pedido en <strong>FecaStore</strong> con éxito.
                    </p>
                    <div style="display: flex; gap: 12px; flex-wrap: wrap; margin: 18px 0 0;">
                        <div style="flex: 1 1 220px; background: ${palette.soft}; border: 1px solid ${palette.line}; border-radius: 16px; padding: 16px;">
                            <div style="font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: ${palette.olive}; margin-bottom: 8px;">Folio</div>
                            <div style="font-size: 20px; font-weight: 700; color: ${palette.wine};">${folioSeguro}</div>
                        </div>
                        <div style="flex: 1 1 220px; background: ${palette.soft}; border: 1px solid ${palette.line}; border-radius: 16px; padding: 16px;">
                            <div style="font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: ${palette.olive}; margin-bottom: 8px;">Total a pagar</div>
                            <div style="font-size: 20px; font-weight: 700; color: ${palette.charcoal};">$${notaSeguro} MXN</div>
                        </div>
                    </div>
                    <div style="margin-top: 18px; padding: 16px 18px; border-radius: 16px; background: rgba(242, 241, 236, 0.9); border: 1px solid ${palette.line}; color: ${palette.charcoal}; line-height: 1.7;">
                        Para continuar, sube tu comprobante de pago en la sección de <strong>Mis Pedidos</strong> dentro de la plataforma.
                    </div>
                `;
            case 'en_revision':
                return `
                    <p style="margin: 0 0 14px; color: ${palette.charcoal}; line-height: 1.7;">
                        Tu comprobante ya fue recibido y está en proceso de validación.
                    </p>
                    <div style="margin-top: 18px; padding: 16px 18px; border-radius: 16px; background: rgba(110, 44, 47, 0.07); border: 1px solid ${palette.line}; color: ${palette.charcoal}; line-height: 1.7;">
                        En breve te avisaremos cuando tu pago sea aprobado.
                    </div>
                `;
            case 'pagada':
                return `
                    <p style="margin: 0 0 14px; color: ${palette.charcoal}; line-height: 1.7;">
                        Hola ${nombreSeguro}, tu pago para la orden <strong>${folioSeguro}</strong> ha sido aprobado.
                    </p>
                    <div style="margin-top: 18px; padding: 16px 18px; border-radius: 16px; background: rgba(47, 125, 79, 0.08); border: 1px solid ${palette.line}; color: ${palette.charcoal}; line-height: 1.7;">
                        En breve te avisaremos cuando tus productos estén listos para ser recogidos.
                    </div>
                `;
            case 'listo':
                return `
                    <p style="margin: 0 0 14px; color: ${palette.charcoal}; line-height: 1.7;">
                        Hola ${nombreSeguro}, ya tenemos tus productos preparados y listos para entrega.
                    </p>
                    <div style="display: grid; gap: 12px; margin-top: 18px;">
                        <div style="padding: 16px 18px; border-radius: 16px; background: ${palette.soft}; border: 1px solid ${palette.line}; line-height: 1.7; color: ${palette.charcoal};">
                            <strong style="color: ${palette.wine};">¿Dónde recoger?</strong><br>
                            Ventanilla de Administración FECA.
                        </div>
                        <div style="padding: 16px 18px; border-radius: 16px; background: ${palette.soft}; border: 1px solid ${palette.line}; line-height: 1.7; color: ${palette.charcoal};">
                            <strong style="color: ${palette.wine};">Horario</strong><br>
                            9:00 AM - 6:00 PM
                        </div>
                    </div>
                    <div style="margin-top: 18px; padding: 16px 18px; border-radius: 16px; background: rgba(199, 58, 58, 0.08); border: 1px solid ${palette.line}; color: ${palette.charcoal}; line-height: 1.7;">
                        Presenta tu credencial de alumno para que se te entregue la mercancía.
                    </div>
                `;
            case 'rechazado':
                return `
                    <p style="margin: 0 0 14px; color: ${palette.charcoal}; line-height: 1.7;">
                        Hola ${nombreSeguro}, hubo un problema con la validación de tu pago para la orden <strong>${folioSeguro}</strong>.
                    </p>
                    <div style="margin-top: 18px; padding: 16px 18px; border-radius: 16px; background: rgba(166, 61, 47, 0.08); border: 1px solid ${palette.line}; color: ${palette.charcoal}; line-height: 1.7;">
                        <strong style="color: ${palette.wine};">Motivo:</strong> ${notaSeguro || 'No se especificó un motivo.'}
                    </div>
                    <div style="margin-top: 18px; padding: 16px 18px; border-radius: 16px; background: ${palette.soft}; border: 1px solid ${palette.line}; color: ${palette.charcoal}; line-height: 1.7;">
                        Revisa la información y vuelve a subir tu comprobante correctamente.
                    </div>
                `;
            default:
                return `
                    <p style="margin: 0 0 14px; color: ${palette.charcoal}; line-height: 1.7;">
                        Hola ${nombreSeguro}, tu pedido con folio <strong>${folioSeguro}</strong> ahora está en estado: <strong>${escapeHtml(estado)}</strong>.
                    </p>
                `;
        }
    })();

    const ujedLogoBlock = logoAttachments.some((attachment) => attachment.cid === 'logo-ujed')
        ? `<img src="cid:logo-ujed" alt="UJED" width="170" style="display: block; margin: 0 auto 10px; max-width: 170px; height: auto;">`
        : `<div style="font-size: 14px; font-weight: 700; letter-spacing: 0.16em; color: ${palette.olive}; text-transform: uppercase;">UJED</div>`;

    const fecaLogoBlock = logoAttachments.some((attachment) => attachment.cid === 'logo-feca')
        ? `<img src="cid:logo-feca" alt="FecaStore" width="180" style="display: block; margin: 0 auto 14px; max-width: 180px; height: auto;">`
        : `<div style="font-size: 18px; font-weight: 800; letter-spacing: 0.12em; color: ${palette.tomato}; text-transform: uppercase;">FecaStore</div>`;

    return `
        <div style="margin: 0; padding: 0; background: linear-gradient(180deg, ${palette.parchment} 0%, #ffffff 100%);">
            <div style="max-width: 680px; margin: 0 auto; padding: 28px 16px 40px; font-family: 'Segoe UI', Tahoma, sans-serif; color: ${palette.charcoal};">
                <div style="border-radius: 24px; overflow: hidden; border: 1px solid ${palette.line}; box-shadow: 0 16px 40px rgba(74, 74, 77, 0.10); background: #ffffff;">
                    <div style="height: 10px; background: linear-gradient(90deg, ${palette.tomato} 0%, ${palette.wine} 38%, ${palette.olive} 72%, ${palette.charcoal} 100%);"></div>
                    <div style="padding: 34px 30px 28px; text-align: center; background: linear-gradient(180deg, rgba(242, 241, 236, 0.95) 0%, #ffffff 100%);">
                        ${fecaLogoBlock}
                        <div style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 8px 14px; border-radius: 999px; background: ${estadoInfo.fondo}; border: 1px solid ${estadoInfo.borde}; color: ${estadoInfo.color}; font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;">
                            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 999px; background: ${estadoInfo.color};"></span>
                            ${escapeHtml(estadoInfo.titulo)}
                        </div>
                    </div>

                    <div style="padding: 0 30px 28px;">
                        <div style="border-radius: 20px; padding: 28px; background: ${palette.soft}; border: 1px solid ${palette.line};">
                            <h1 style="margin: 0 0 10px; color: ${palette.wine}; font-size: 28px; line-height: 1.2; letter-spacing: -0.02em;">Hola ${nombreSeguro}</h1>
                            <p style="margin: 0; color: ${palette.olive}; font-size: 16px; line-height: 1.7;">${escapeHtml(estadoInfo.mensaje)}</p>
                            <div style="height: 1px; background: ${palette.line}; margin: 22px 0;"></div>
                            ${detallePrincipal}
                        </div>
                    </div>

                    <div style="padding: 0 30px 30px;">
                        <div style="border-radius: 20px; padding: 20px 22px; background: linear-gradient(180deg, rgba(110, 44, 47, 0.96) 0%, rgba(74, 74, 77, 0.98) 100%); color: #ffffff; text-align: center;">
                            ${ujedLogoBlock}
                            <div style="font-size: 13px; line-height: 1.7; opacity: 0.95;">
                                Universidad Juárez del Estado de Durango · FECA Store
                            </div>
                            <div style="font-size: 12px; line-height: 1.7; opacity: 0.82; margin-top: 8px;">
                                Si necesitas ayuda, responde a este correo o contacta a administración.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

export const enviarNotificacionEstado = async (emailAlumno, nombreAlumno, folio, nuevoEstado, nota = '') => {
    if (!emailConfigured || !transporter) {
        console.warn('Notificaciones por correo deshabilitadas: faltan credenciales EMAIL_USER/EMAIL_PASS.');
        return;
    }

    let asunto = '';

    const estadoLimpio = nuevoEstado ? nuevoEstado.toString().trim().toLowerCase() : '';

    switch (estadoLimpio) {
        case 'pendiente':
            asunto = `Confirmación de Pedido - ${folio}`;
            break;
        case 'en_revision':
            asunto = `Comprobante Recibido - ${folio}`;
            break;

        case 'pagada':
            asunto = `¡Pago Aprobado! - ${folio}`;
            break;

        case 'listo':
            asunto = `¡Tu pedido está listo! - ${folio}`;
            break;

        case 'rechazado':
            asunto = `Actualización de Pedido - ${folio}`;
            break;

        default:
            asunto = `Cambio de estado en tu pedido - ${folio}`;
    }

    const mensajeHtml = crearPlantillaCorreo({
        nombreAlumno,
        folio,
        estado: estadoLimpio,
        nota
    });

    try {
        await transporter.sendMail({
            from: '"FecaStore 🛒" <noreply@fecastore.com>',
            to: emailAlumno,
            subject: asunto,
            html: mensajeHtml,
            attachments: logoAttachments,
            replyTo: 'administracion.feca@ujed.mx' 
        });

        console.log(`Email enviado con éxito a ${emailAlumno} (Estado: ${estadoLimpio})`);
    } catch (error) {
        console.error("Error crítico al enviar email:", error);
        throw error;
    }
};