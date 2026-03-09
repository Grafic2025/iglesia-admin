import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { password } = await request.json();

        // Comparamos la contraseña en el servidor, no en el cliente.
        // Usamos la variable de entorno del lado del servidor (sin NEXT_PUBLIC_)
        const administradorPassword = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

        if (password === administradorPassword) {
            // Set rigorous HTTP-only cookie for middleware validation
            const cookieStore = await cookies();
            cookieStore.set('administrador_autenticacion_token', 'verified', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7 // 1 week
            });
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, error: 'Contraseña incorrecta' }, { status: 401 });
        }
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Error processing request' }, { status: 500 });
    }
}

