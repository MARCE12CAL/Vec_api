# Amelia FactBot 🤖💬

Amelia es un bot de WhatsApp para consultas de facturación (Ventas, Clientes y Artículos) desarrollado en **Node.js** utilizando la **API de Baileys** y **Sequelize ORM** para la base de datos MySQL.

El diseño sigue una **arquitectura orientada a servicios**, aislando completamente la obtención de datos del bot de WhatsApp. Esto facilita conectar y consumir APIs REST externas en lugar de realizar consultas directas a la base de datos MySQL local.

---

## 🛠️ Requisitos e Instalación

1. **Node.js**: Asegúrate de tener Node.js instalado (v16 o superior recomendado).
2. **Base de Datos MySQL**:
   - Puerto: `3306`
   - Usuario: `root`
   - Contraseña: `MiPassword2025!`
   - Nombre de Base de Datos: `amelia_db`

### Instalación de dependencias

Clona o navega al directorio del proyecto y ejecuta:

```bash
npm install
```

### Configuración del Entorno (`.env`)

El archivo `.env` ya se encuentra configurado con las credenciales solicitadas para la base de datos local:

```env
DB_USER=root
DB_PASSWORD=MiPassword2025!
DB_NAME=amelia_db
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DIALECT=mysql

# URLs de APIs externas en caso de reemplazo
API_URL=
API_TOKEN=

BOT_SESSION_NAME=amelia_auth_session
```

---

## 🗄️ Base de Datos, Migraciones y Semillas

Toda la base de datos se estructura mediante migraciones de Sequelize para garantizar portabilidad.

### 1. Ejecutar las Migraciones
Crea todas las tablas requeridas (`seg_maecompania`, `seg_maeusuario`, `ven_maecliente`, `inv_maegrupo`, `inv_maearticulo`, `ven_encfac`, `ven_detfac`, y `bot_sessions`):

```bash
npm run db:migrate
```

### 2. Poblar con Datos de Prueba (Seeders)
Puebla la base de datos con registros realistas que coinciden exactamente con los montos y reportes de la maqueta de diseño (para Mayo 2025 y Mayo 2026):

```bash
npm run db:seed:all
```

---

## 🔌 Conexión con APIs REST (Capa de Servicios)

Si en el futuro deseas que Amelia obtenga la información consumiendo APIs REST externas en lugar de realizar consultas directas a tu base de datos local, puedes hacerlo fácilmente modificando los archivos dentro de la carpeta `src/services/`:

- **`src/services/authService.js`**: Validación de Compañías y Usuarios.
- **`src/services/salesService.js`**: Consultas de Ventas (Resumen consolidado y facturas recientes).
- **`src/services/clientsService.js`**: Reporte de Top 10 Clientes e Historial de facturas.
- **`src/services/articlesService.js`**: Reporte de Artículos más vendidos y buscador de productos.

En cada uno de estos archivos encontrarás la **Implementación por Defecto (Sequelize)** activa y una **Plantilla comentada (API REST Externa)** utilizando `axios`. Solo debes descomentar la plantilla y mapear las rutas de tu API REST según corresponda.

---

## 🚀 Ejecución del Bot

Para arrancar el bot en modo de desarrollo con recarga automática:

```bash
npm run dev
```

### Proceso de Conexión:
1. Al iniciar por primera vez, verás que la consola se limpia y dibuja un **Código QR**.
2. Abre WhatsApp en tu celular -> Dispositivos Vinculados -> Vincular un dispositivo.
3. Escanea el código QR impreso en la terminal.
4. El bot guardará las credenciales en la carpeta `auth_info_baileys/` para auto-conectarse en futuros reinicios sin pedir QR de nuevo.

---

## 💬 Flujo de Conversación de Prueba

Una vez conectado, puedes interactuar enviando mensajes al bot Amelia desde otro número:

1. **Inicio**: Envía `hola` o `iniciar sesión`. El bot te enviará un botón de bienvenida.
2. **RUC**: Introduce `1791234567001` (RUC de prueba registrado en semillas).
3. **Clave**: Introduce `admin123` (Clave de prueba registrada).
4. **Ingreso Exitoso**: El bot te autenticará con la empresa `EMPRESA ABC S.A.` y enviará el Menú Principal interactivo.
5. **Navegación**:
   - Responde escribiendo las opciones de texto o interactúa con los menús interactivos de lista/carrusel.
   - Envía `volver` o `cancelar` en cualquier momento para regresar al menú principal.
   - Envía `salir` o `logout` para cerrar la sesión y bloquear el acceso hasta iniciar sesión de nuevo.
