import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/libreria/supabase';

export async function POST(request: Request) {
    try {
        const { usuario, password } = await request.json();

        if (!usuario || !password) {
            return NextResponse.json({ success: false, error: 'Usuario y contraseña requeridos' }, { status: 400 });
        }

        // Consultamos en la tabla de admin_usuarios
        const { data: user, error } = await supabaseAdmin
            .from('admin_usuarios')
            .select('*')
            .eq('usuario', usuario)
            .single();

        if (error || !user) {
            return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 401 });
        }

        // Verificación de contraseña (simple por ahora según el plan)
        if (password === user.password_hash) {
            // Set rigorous HTTP-only cookie for middleware validation
            const cookieStore = await cookies();
            cookieStore.set('administrador_autenticacion_token', user.id, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7 // 1 week
            });

            return NextResponse.json({ 
                success: true, 
                usuario: {
                    id: user.id,
                    usuario: user.usuario,
                    rol: user.rol,
                    menus: user.menus_permitidos
                }
            });
        } else {
            return NextResponse.json({ success: false, error: 'Contraseña incorrecta' }, { status: 401 });
        }
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Error processing request' }, { status: 500 });
    }
}

