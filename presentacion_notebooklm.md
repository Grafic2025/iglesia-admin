# Documentación Técnica y Funcional: Ecosistema Digital Iglesia del Salvador

## 1. Visión General del Proyecto

El **Ecosistema Digital Iglesia del Salvador** es una plataforma integral compuesta por una aplicación móvil (para los miembros) y un panel de administración web (para los líderes). Su objetivo es digitalizar la experiencia de la congregación, facilitando la asistencia, la comunicación, el acceso a recursos y la gestión pastoral.

### Tecnologías Principales
- **Base de Datos & Backend:** Supabase (PostgreSQL, Auth, Realtime, Storage).
- **App Móvil:** React Native con Expo (Android/iOS).
- **Panel Admin:** Next.js 15 (React 19) + TypeScript.
- **Infraestructura:** Vercel (Web), EAS (App Build/Updates).

---

## 2. IGLESIA APP - Aplicación Móvil

### 2.1 Arquitectura de Navegación
La aplicación utiliza una estructura de navegación basada en **Expo Router** con un **Drawer Customizado** (Menú lateral) y un **Stack Navigator**.

- **Drawer (Menú Lateral):**
  - Diseño personalizado con fondo oscuro y efectos de animación.
  - **Cabecera:** Foto de perfil (editable), Nombre y Apellido.
  - **Opciones:** Inicio, Mensajes, Nosotros, Agenda, Contacto.
  - **Acciones de Cuenta:** Botón "MODIFICAR DATOS" (reinicia registro) y "CERRAR SESIÓN".
  - **Indicadores:** Íconos blancos que cambian a negro sobre fondo verde lima cuando están activos.

- **Barra Superior (Top Nav):**
  - Botón hamburguesa para abrir el menú.
  - Título "IGLESIA DEL SALVADOR" con subrayado verde decorativo.
  - Avatar circular del usuario a la derecha.

### 2.2 Pantalla de Inicio (Home)

Esta es la pantalla principal y más compleja, diseñada como un "Hub" de recursos.

#### A. Carrusel de Noticias (Slider)
- **Componente:** `FlatList` horizontal con paginación.
- **Contenido Dinámico:** Se carga desde la tabla `noticias` en Supabase.
- **Comportamiento:**
  - Auto-scroll cada 3.5 segundos.
  - Al tocar una noticia, el sistema decide inteligentemente:
    1. Si tiene `url` (ej: YouTube): Abre el navegador o app externa.
    2. Si tiene `screen` (ej: "Agenda"): Navega internamente a esa pantalla.
- **Contenido Default:** Si no hay conexión, muestra 3 tarjetas predefinidas (Esenciales, Capacitación, Grupos).

#### B. Sistema de Racha y Gamificación
- **Tarjeta "TU RACHA DE ASISTENCIA":**
  - Muestra visualmente el compromiso del usuario.
  - **Estrellas:** 10 íconos que se iluminan (⭐) según la cantidad de asistencias consecutivas.
  - **Cálculo:** Basado en asistencias de los últimos 30 días.
  - **Botones de Acción:**
    - **VER TOP 10:** Abre un modal con el ranking de los 10 miembros con más asistencia.
    - **MI HISTORIAL:** Abre un modal con la lista detallada de fechas y horas de asistencia propia.

#### C. Grilla de Accesos Rápidos (Grid de 10 botones)
Diseño de 2 columnas x 5 filas con imágenes de fondo y overlays oscuros:
1. **Agenda:** Muestra los horarios de reuniones (Domingo 10hs/19hs, Sábado 20hs).
2. **Biblia:** Deep link a la app de YouVersion o web Bible.com.
3. **Quiero Ayudar:** Información de cuentas bancarias y link a Mercado Pago.
4. **Necesito Ayuda:** Formulario de contacto directo con pastores (se envía y no se guarda permanentemente por privacidad).
5. **Quiero Bautizarme:** Formulario para solicitar bautismo (Edad, Grupo, Celular).
6. **Quiero Capacitarme:** Formulario con Dropdown de 11 cursos (Fundamentos, Música, Liderazgo, etc.).
7. **Soy Nuevo:** Formulario especial para visitantes.
8. **Necesito Oración:** Muro social de pedidos de oración (ver detalle abajo).
9. **Sumarme a un Grupo:** Formulario con selector de grupos (Jóvenes, Matrimonios, etc.).
10. **Reunión en Vivo:** Link directo al canal de YouTube.

#### D. Botón "REGISTRAR ASISTENCIA" (Funcionalidad Core)
- **Ubicación:** Botón flotante o destacado al final de la grilla.
- **Tecnología:** `CameraView` de `expo-camera`.
- **Lógica de Negocio:**
  1. Abre la cámara en pantalla completa.
  2. Escanea código QR (espera valor `ASISTENCIA_IGLESIA`).
  3. **Algoritmo de Horario:** Determina la reunión según la hora actual:
     - Domingo 8:30-10:30 → **09:00**
     - Domingo 10:31-13:00 → **11:00**
     - Domingo/Sábado 18:00-21:00 → **20:00**
     - Otros → **Extraoficial**.
  4. **Validación:** Verifica en base de datos si YA existe asistencia para ese `miembro_id` + `fecha`.
     - Si existe: Alerta "Ya registrada".
     - Si no: Inserta en Supabase y actualiza la racha localmente.

#### E. Redes Sociales
- Botones para Instagram, TikTok, Facebook y YouTube.
- **Deep Linking:** Intenta abrir la app nativa primero; si falla, abre el navegador web.
- Botón especial grande para **Canal de WhatsApp**.

### 2.3 Pantalla "Mensajes" (Podcasts)
- **Funcionalidad:** Reproductor de audio integrado para prédicas y mensajes.
- **Lista:** Recupera datos de la tabla `recursos`.
- **Cada item:** Portada, Título, Fecha y Botón de Play.
- **Reproductor:** Usa `expo-av`. Gestiona el estado para que solo suene un audio a la vez (pausa el anterior si das play a uno nuevo).

### 2.4 Muro de Oración Social
- **Pantalla:** "Necesito Oración".
- **Publicar:** Input de texto para enviar un pedido.
- **Listado:** Muestra los últimos 10 pedidos.
- **Interacción:** Botón "UNIRME EN ORACIÓN".
  - Incrementa un contador visual en tiempo real.
  - **Notificación Push:** Envía una alerta al dueño del pedido avisando: *"¡[Nombre] se unió en oración por tu pedido!"*. Esto genera un fuerte sentido de comunidad.

---

## 3. IGLESIA ADMIN - Panel Web de Gestión

Panel desarrollado en Next.js, protegido por contraseña (variable de entorno).

### 3.1 Dashboard y Métricas (KPIs)
El inicio muestra un resumen en tiempo real del estado de la iglesia:
- **Gráficos (Recharts):**
  - **Tendencia 7 días:** Barras con la cantidad de asistentes por día.
  - **Crecimiento:** Línea acumulativa de nuevos miembros.
- **Tarjetas de Estadísticas:**
  - Total Asistencias Hoy.
  - Desglose por reunión (09:00, 11:00, 20:00, Extra).
  - Oraciones Activas (Total de interacciones).
  - Nuevos del Mes.

### 3.2 Gestión de Premios y Gamificación
El sistema detecta automáticamente hitos de asistencia y genera una lista de "Premios Pendientes" para que los líderes entreguen.
- **Niveles:**
  - **Nivel 5 (Sticker):** 5-9 asistencias.
  - **Nivel 10 (Café):** 10-19 asistencias.
  - **Nivel 20 (Libro):** 20-29 asistencias.
  - **Nivel 30 (Retiro):** 30+ asistencias.
- **Flujo de Entrega:**
  1. El admin ve la tarjeta del miembro con su racha.
  2. Al entregar el premio físico, hace clic en "Entregar".
  3. Se registra en la tabla `premios_entregados` para no duplicar.
  4. La tarjeta cambia a estado visual "Entregado ✅".

### 3.3 Programación de Avisos (Automation)
Permite dejar mensajes programados que se envían automáticamente.
- **Campos:** Mensaje, Día de la semana, Hora.
- **Palabra Mágica "VERSICULO":** Si el mensaje es exactamente `VERSICULO`, el sistema buscará un texto bíblico aleatorio para enviar.
- **Estado:** Muestra indicadores visuales (Pendiente, Exitoso, Error) y la hora exacta de la última ejecución.

### 3.4 Centro de Notificaciones (Push)
Herramienta potente para comunicación masiva o segmentada.
- **Segmentación:** Permite filtrar la audiencia según el horario de asistencia (ej: enviar aviso SOLO a los que vienen a las 11:00).
- **Feedback:** Muestra cuántas personas recibieron el mensaje (ej: "✅ Enviado a 87 personas").
- **Historial de Logs:** Tabla detallada con fecha, título, cantidad de destinatarios y estado de cada envío masivo.

### 3.5 CMS (Gestor de Contenido)
Administración de las noticias que aparecen en la App.
- **Sync YouTube:** Botón que conecta con la API de YouTube para traer el último video automáticamente y ponerlo como banner principal.
- **Edición Manual:** Permite crear noticias con Título e Imagen.
- **Enrutamiento Inteligente:** El admin define qué hace la noticia al tocarla:
  - **Link Externo:** URL web.
  - **Pantalla Interna:** Nombre de la sección de la app (ej: "Quiero Ayudar").

### 3.6 Tabla de Asistencias
Vista detallada de quién vino hoy.
- **Filtros:** Por horario y buscador por nombre.
- **Exportación:** Botón "📥 Excel" genera un CSV completo.
- **Tags Inteligentes:** Marca automáticamente con etiqueta "NUEVO" verde a quienes crearon su cuenta ese mismo día.
- **Visualización de Racha:** Muestra íconos de fuego (🔥) para los comprometidos.

---

## 4. Flujo de Datos y Tablas (Base de Datos)

Todo el sistema gira en torno a **Supabase (PostgreSQL)**.

### Tablas Principales
1. **`miembros`**: Perfil del usuario (Nombre, Apellido, Foto, Token Push).
2. **`asistencias`**: Registro histórico (Miembro ID, Fecha, Hora, Horario Reunión).
3. **`pedidos_oracion`**: Muro social (Texto, Contador, Autor).
4. **`noticias`**: Contenido del carrusel (Título, Imagen, Action URL/Screen).
5. **`programaciones`**: Cron jobs configurados (Mensaje, Día, Hora).
6. **`recursos`**: Audios para la sección Mensajes (URL Audio, Portada, Título).
7. **`premios_entregados`**: Logística de gamificación (Miembro, Nivel, Fecha).
8. **Tablas de Formularios:** `solicitudes_bautismo`, `consultas_ayuda`, etc.

### Seguridad y Roles
- **App:** Acceso público a lectura, escritura autenticada para propios datos.
- **Admin:** Protegido a nivel de aplicación (Front-end Gate) vía contraseña segura.

---

## 5. Resumen de Valor
Este ecosistema automatiza tareas que antes eran manuales (tomar asistencia, contar ofrendas, gestionar pedidos de oración) y crea un canal de comunicación directo y moderno con la congregación, fomentando la participación a través de gamificación (rachas/premios) y comunidad digital (muro de oración).
