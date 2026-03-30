import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/libreria/supabase';
import { Resend } from 'resend';
import bcrypt from 'bcryptjs';

const resend = new Resend(process.env.RESEND_API_KEY);

// POST: Solicitar código de recuperación
export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        // 1. Buscar usuario por email
        const { data: user, error } = await supabaseAdmin
            .from('admin_usuarios')
            .select('id, usuario, email')
            .eq('email', email)
            .single();

        if (error || !user) {
            return NextResponse.json({ success: false, error: 'Correo no registrado' }, { status: 404 });
        }

        // 2. Generar código de 6 dígitos
        const codigo = Math.floor(100000 + Math.random() * 900000).toString();
        const expiracion = new Date();
        expiracion.setMinutes(expiracion.getMinutes() + 15); // Expira en 15 min

        // 3. Guardar código en la DB (necesita columnas: recovery_code, recovery_expires)
        const { error: updateError } = await supabaseAdmin
            .from('admin_usuarios')
            .update({ 
                recovery_code: codigo, 
                recovery_expires: expiracion.toISOString() 
            })
            .eq('id', user.id);

        if (updateError) throw updateError;

        // 4. Enviar Email con Resend
        if (process.env.RESEND_API_KEY) {
            await resend.emails.send({
                from: 'IDS Panel <seguridad@idsdigital.app>', // Cambiar segun dominio
                to: [user.email],
                subject: 'IDS: Código de Recuperación de Acceso',
                html: `
                    <div style="font-family: sans-serif; padding: 20px; color: #111;">
                        <h2 style="color: #A8D500;">Recuperación de Acceso</h2>
                        <p>Hola <strong>${user.usuario}</strong>,</p>
                        <p>Has solicitado restablecer tu contraseña. Tu código de seguridad es:</p>
                        <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 10px;">
                            ${codigo}
                        </div>
                        <p>Este código expira en 15 minutos.</p>
                        <p style="font-size: 12px; color: #666;">Si no solicitaste esto, ignora este mensaje.</p>
                    </div>
                `,
            });
        } else {
            console.log('CÓDIGO DE PRUEBA (Sin API Key):', codigo);
        }

        return NextResponse.json({ success: true, message: 'Código enviado' });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

// PUT: Verificar código y cambiar contraseña
export async function PUT(request: Request) {
    try {
        const { email, codigo, nuevaPassword } = await request.json();

        // 1. Validar código
        const { data: user, error } = await supabaseAdmin
            .from('admin_usuarios')
            .select('*')
            .eq('email', email)
            .eq('recovery_code', codigo)
            .single();

        if (error || !user) {
            return NextResponse.json({ success: false, error: 'Código inválido o correo incorrecto' }, { status: 400 });
        }

        // 2. Validar expiración
        if (new Date(user.recovery_expires) < new Date()) {
            return NextResponse.json({ success: false, error: 'El código ha expirado' }, { status: 400 });
        }

        // 3. Hashear nueva password y limpiar campos de recuperación
        const password_hash = await bcrypt.hash(nuevaPassword, 10);
        const { error: updateError } = await supabaseAdmin
            .from('admin_usuarios')
            .update({ 
                password_hash,
                recovery_code: null,
                recovery_expires: null
            })
            .eq('id', user.id);

        if (updateError) throw updateError;

        return NextResponse.json({ success: true, message: 'Contraseña actualizada' });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
