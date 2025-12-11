🏗️ KETZAL WEB - MASTERPLAN & ARCHITECTURE CONTEXT
1. 🎯 OBJETIVO DEL PROYECTO
Plataforma Web Administrativa y B2B para "Ketzal App" (Super App de Turismo Mexicano). La web sirve como:

God Mode (Admin): Control total de usuarios, finanzas y moderación.

Provider Portal (B2B): Herramienta para guías y hoteleros para gestionar inventario (incluso sin internet).

Ambassador Hub: Dashboard de métricas para influencers.

Filosofía Técnica: Offline-First, Global-Ready, High-Performance.

2. 🛠️ TECH STACK (ESTRICTO)
Framework: Next.js 14+ (App Router).

Lenguaje: TypeScript (Strict Mode).

UI System: Shadcn UI + Tailwind CSS + Lucide React.

Backend: Supabase (PostgreSQL + Auth).

Data Fetching & State: TanStack Query (React Query) v5 (CRÍTICO para offline).

Local DB: idb-keyval (IndexedDB Wrapper) para persistencia offline.

PWA/Service Worker: serwist o next-pwa.

Internacionalización (i18n): next-intl.

3. 🌍 ESTRATEGIA DE INTERNACIONALIZACIÓN (i18n)
La estructura de carpetas debe seguir el patrón de rutas dinámicas por idioma.

Idiomas Soportados:

es (Español - Default)

en (Inglés - USA/Europa)

zh (Chino Simplificado - Turismo Asiático)

Estructura de Rutas:

Plaintext

/app
  /[locale]
    /admin
    /provider
    /auth
    layout.tsx (RootLayout con inyección de diccionario i18n)
    page.tsx (Landing)
Middleware: Detección automática de idioma del navegador y reescritura de URL.

4. 📶 ARQUITECTURA OFFLINE-FIRST (SYNC ENGINE)
Dado que los proveedores operan en zonas remotas (Selva, Desierto), la app NO debe bloquearse si falla la red.

A. Lectura (Caching)
Usar staleTime: Infinity en TanStack Query para catálogos que cambian poco.

Configurar PersistQueryClientProvider conectado a IndexedDB para guardar el caché al cerrar el navegador.

B. Escritura (Mutation Queue)
Si un usuario crea un servicio o sube una foto sin internet:

Interceptar: Capturar el error de red en la mutación.

Persistir: Guardar la acción ("CREATE_SERVICE", payload) en IndexedDB -> mutation_queue.

Feedback Optimista: Mostrar Toast UI: "Guardado offline. Se sincronizará al conectar".

Sync: Un NetworkListener detecta cuando vuelve navigator.onLine y procesa la cola secuencialmente.

5. 🎨 DESIGN SYSTEM: "NEO-AZTEC CORPORATE"
Una fusión entre misticismo prehispánico y tablero de control cyberpunk.

Modo: Dark Mode forzado (#0A0A0A - Obsidian).

Paleta:

Primary: Jade Ketzal (#00E676) - Para acciones positivas y crecimiento.

Secondary: Gold Aztec (#FFD700) - Para dinero (Axocoins) y VIP.

Destructive: Mars Red (#EF4444) - Errores y Bans.

Surface: Glassmorphism (Negro con 80% opacidad y blur).

Tipografía: Inter (UI General) + Noto Sans SC (Para soporte Chino).

6. 🗺️ MAPA DEL SITIO Y FUNCIONALIDADES
👮‍♂️ A. PANEL ADMIN (God Mode)
Ruta: /[locale]/admin

Dashboard: KPIs (Total Usuarios, Axocoins en circulación, Servicios Activos).

Moderación: Tabla para aprobar/rechazar nuevos servicios (Ver fotos, verificar ubicación).

Banco Central: Vista de la tabla wallets. Capacidad de congelar cuentas o emitir reembolsos.

Gestión de Usuarios: Tabla con filtros avanzados (Rol, Nivel, Verificado).

🏨 B. PORTAL PROVEEDOR
Ruta: /[locale]/provider

Mis Servicios: CRUD completo. Formulario multi-paso para subir experiencias (Fotos, Mapa, Precio). Debe funcionar Offline.

QR Scanner: (PWA Feature) Uso de cámara para validar tickets de viajeros.

Wallet: Solicitud de retiro de fondos (AXO -> MXN).

📣 C. AMBASSADOR HUB
Ruta: /[locale]/ambassador

Stats: Gráficas de Referidos y Conversión.

Assets: Generador de códigos QR y enlaces de afiliado personalizados.

7. 🗄️ MODELO DE DATOS (Referencia Supabase)
No modificar esquema, solo consumir.

profiles: (id, role, username, full_name, avatar_url)

services: (id, provider_id, title, description, location, price_mxn, available, approved)

wallets: (user_id, balance, currency_code)

transactions: (id, wallet_id, amount, type, reference_id)

ambassador_details: (user_id, referral_code, earnings)

posts: (id, video_url, linked_service_id)

8. ✅ CHECKLIST DE IMPLEMENTACIÓN INICIAL
[ ] Configurar next-intl y crear archivos JSON (es.json, en.json, zh.json).

[ ] Configurar TanStack Query con el adaptador de IndexedDB.

[ ] Crear el Layout "App Shell" con Sidebar colapsable y selector de idioma.

[ ] Implementar Middleware de autenticación (Proteger rutas /admin).

[ ] Crear la página /admin/dashboard con Mock Data inicial.