export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white p-8 md:p-20 font-sans">
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header */}
                <header className="border-b border-[#333] pb-10">
                    <h1 className="text-4xl md:text-5xl font-black text-[var(--accent)] mb-4">
                        POLÍTICA DE PRIVACIDAD
                    </h1>
                    <p className="text-[#888] text-lg">
                        Última actualización: 3 de marzo de 2026
                    </p>
                </header>

                {/* Section: Introduction */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold border-l-4 border-[var(--accent)] pl-4">1. Introducción</h2>
                    <p className="text-[#aaa] leading-relaxed">
                        En <strong>Iglesia del Salvador</strong>, valoramos y respetamos la privacidad de nuestra comunidad.
                        Esta política describe cómo nuestra aplicación móvil ("la App") recopila, utiliza y protege su información personal.
                        Al utilizar la App, usted acepta las prácticas descritas en este documento.
                    </p>
                </section>

                {/* Section: Data Collection */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold border-l-4 border-[var(--accent)] pl-4">2. Información que Recopilamos</h2>
                    <p className="text-[#aaa] leading-relaxed">
                        Recopilamos información limitada que es estrictamente necesaria para el funcionamiento de los servicios de la iglesia:
                    </p>
                    <ul className="list-disc list-inside text-[#aaa] space-y-2 ml-4">
                        <li><strong>Datos de Identidad:</strong> Nombre y apellido para el registro de miembros.</li>
                        <li><strong>Fotografía de Perfil:</strong> Opcional, para personalización dentro de la comunidad.</li>
                        <li><strong>Token de Notificación:</strong> Para enviarle recordatorios de servicio y avisos importantes.</li>
                        <li><strong>Datos de Actividad:</strong> Registros de asistencia a servicios y pedidos de oración.</li>
                    </ul>
                </section>

                {/* Section: Purpose */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold border-l-4 border-[var(--accent)] pl-4">3. Uso de la Información</h2>
                    <p className="text-[#aaa] leading-relaxed">
                        Sus datos se utilizan exclusivamente para:
                    </p>
                    <ul className="list-disc list-inside text-[#aaa] space-y-2 ml-4">
                        <li>Gestionar los equipos de servidores y cronogramas.</li>
                        <li>Proporcionar funciones de comunidad, como el muro de oración.</li>
                        <li>Enviar notificaciones sobre actividades y cambios de horario.</li>
                        <li>Mejorar la experiencia del usuario dentro de la aplicación.</li>
                    </ul>
                </section>

                {/* Section: Data Deletion */}
                <section className="space-y-6 bg-[#1a1a1a] p-8 rounded-2xl border border-[#333]">
                    <h2 className="text-2xl font-bold text-[var(--accent)]">4. Eliminación de Datos y Cuenta</h2>
                    <p className="text-[#aaa] leading-relaxed">
                        De acuerdo con las normativas de Apple y Google, ofrecemos total control sobre sus datos:
                    </p>
                    <p className="text-[#aaa] leading-relaxed">
                        Cualquier usuario puede eliminar su cuenta de forma permanente directamente desde el menú lateral de la App (sección "Eliminar mi cuenta").
                        Este proceso es irreversible y borra automáticamente:
                    </p>
                    <ul className="list-disc list-inside text-[#aaa] space-y-2 ml-4">
                        <li>Toda su información personal de perfil.</li>
                        <li>Su historial de asistencias y participaciones en equipos.</li>
                        <li>Sus pedidos de oración y registros almacenados.</li>
                        <li>Cualquier archivo multimedia (fotos) asociado a su perfil.</li>
                    </ul>
                </section>

                {/* Section: Security */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold border-l-4 border-[var(--accent)] pl-4">5. Seguridad de Datos</h2>
                    <p className="text-[#aaa] leading-relaxed">
                        Utilizamos servicios de infraestructura líder en el mercado (Supabase/PostgreSQL) con cifrado en tránsito para asegurar que sus datos
                        estén protegidos contra accesos no autorizados. No compartimos ni vendemos su información a terceros con fines comerciales.
                    </p>
                </section>

                {/* Section: Contact */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold border-l-4 border-[var(--accent)] pl-4">6. Contacto</h2>
                    <p className="text-[#aaa] leading-relaxed">
                        Si tiene preguntas sobre esta política o desea ejercer sus derechos sobre sus datos, puede contactarnos a través de la sección de soporte
                        de la aplicación o visitándonos en nuestra sede física.
                    </p>
                </section>

                {/* Footer */}
                <footer className="pt-10 border-t border-[#333] text-center text-[#555] text-sm">
                    © 2026 Iglesia del Salvador. Todos los derechos reservados.
                </footer>
            </div>
        </div>
    );
}

