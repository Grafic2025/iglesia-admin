import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // 1. Verificar si la ruta es protegida (cualquier cosa bajo la raíz que sea una página, o rutas API, excepto /api/autenticacion)
    const { pathname } = request.nextUrl;

    // Permitir rutas públicas (APIs de autenticación, archivos estáticos, el login se maneja globalmente ahora,
    // pero podemos bloquear el acceso directo a pestañas internas para que el JS ni siquiera tenga que renderizar
    // el diseño si no está autenticado).
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api/autenticacion') ||
        pathname.startsWith('/api/videos-config') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.startsWith('/videos_config.json') ||
        pathname.startsWith('/ver.html') ||
        pathname.includes('.') // Archivos estáticos
    ) {
        return NextResponse.next();
    }

    // Intentar leer la cookie de autenticación
    const hasAuthToken = request.cookies.has('administrador_autenticacion_token');

    // Si no hay token, podemos redirigir o simplemente dejar que ContextoAdmin maneje el login, 
    // PERO dado que queremos que actúe como una bóveda, podemos redirigir a una página específica,
    // o simplemente dejar que carguen "/" y ContextoAdmin mostrará el cuadro de Login.
    // Sin embargo, si intentan acceder a "/miembros" directamente sin un token,
    // podemos redirigirlos de vuelta a "/" para ingresar la contraseña.
    const isPublicFile = pathname === '/videos_config.json' || pathname === '/ver.html';
    if (!hasAuthToken && pathname !== '/' && !isPublicFile) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

// Hacemos que coincida con todo EXCEPTO archivos estáticos y api/autenticacion
export const config = {
    matcher: [
        /*
         * Coincidir con todas las rutas de solicitud excepto las que empiezan con:
         * - api/autenticacion (rutas de API de autenticación)
         * - _next/static (archivos estáticos)
         * - _next/image (archivos de optimización de imágenes)
         * - favicon.ico (archivo de favicon)
         */
        '/((?!api/autenticacion|api/videos-config|videos_config.json|ver.html|_next/static|_next/image|favicon.ico|.*\\.).*)',
    ],
};
