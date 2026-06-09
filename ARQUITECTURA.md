# 🏗️ Arquitectura Técnica

## Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────┐
│                        USUARIO                               │
└────────────────┬────────────────────────────────┬────────────┘
                 │                                │
        Login (HTTP)                      Acción (HTTPS)
                 │                                │
                 ▼                                ▼
        ┌──────────────────┐          ┌──────────────────┐
        │ FRONTEND (HTML)  │          │ FRONTEND (HTML)  │
        │ - Login Form     │          │ - Dashboard      │
        │ - localStorage   │          │ - CRUD Forms     │
        └────────┬─────────┘          └────────┬─────────┘
                 │                             │
        POST /auth/login              GET/POST /api/datos/*
        + email, contraseña           + Token JWT
                 │                             │
                 └──────────────┬──────────────┘
                                │
                 ┌──────────────▼──────────────┐
                 │   BACKEND (Node.js)        │
                 │   Port 3000                │
                 ├────────────────────────────┤
                 │ 1. Validar credenciales    │
                 │ 2. Hash contraseña bcrypt  │
                 │ 3. Generar JWT             │
                 │ 4. Validar permisos        │
                 │ 5. Filtrar datos por rol   │
                 └──────────────┬─────────────┘
                                │
                 ┌──────────────▼──────────────┐
                 │   SUPABASE (PostgreSQL)    │
                 │   Almacenamiento seguro    │
                 ├────────────────────────────┤
                 │ - usuarios (hashed pwd)    │
                 │ - ventas                   │
                 │ - clientes                 │
                 │ - vendedores               │
                 │ - productos                │
                 └────────────────────────────┘
```

---

## 🔐 Flujo de Seguridad

### 1. Login
```
Usuario escribe email + contraseña
              ↓
     Frontend envía al Backend
              ↓
Backend busca usuario en Supabase
              ↓
Compara contraseña con hash bcrypt
              ↓
✅ Si coincide → genera JWT token
❌ Si no → rechaza login
              ↓
Frontend guarda token en localStorage
```

### 2. Request Protegido
```
Frontend hace GET /api/datos/ventas
+ Header: "Authorization: Bearer TOKEN"
              ↓
Backend valida JWT:
  ✅ Token válido y no expirado
  ❌ Token inválido → 401 Unauthorized
              ↓
Valida permisos según rol
  - Admin: ve todos los datos
  - Gerente: ve ventas, maestros
  - Vendedor: ve solo sus ventas
              ↓
Filtra datos en Supabase
              ↓
Devuelve respuesta JSON
```

---

## 🗄️ Esquema de Base de Datos

### Tabla: usuarios
```sql
CREATE TABLE usuarios (
  id_usuario SERIAL PRIMARY KEY,
  nombre_usuario VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  contraseña VARCHAR(255) NOT NULL,        -- ← HASHED bcrypt
  rol VARCHAR(50) NOT NULL DEFAULT 'vendedor',
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMP DEFAULT NOW()
);
```

**Roles válidos:** `admin`, `gerente`, `vendedor`

### Tabla: ventas
```sql
CREATE TABLE ventas (
  id_venta SERIAL PRIMARY KEY,
  fecha_venta DATE NOT NULL,
  id_cliente INTEGER REFERENCES clientes(id_cliente),
  id_vendedor INTEGER REFERENCES usuarios(id_usuario),
  metodo_pago VARCHAR(50),
  canal_venta VARCHAR(50),
  estado_venta VARCHAR(50),
  total_venta DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🌐 API Endpoints

### Públicos (sin autenticación)

**POST** `/api/auth/login`
- Request: `{ email, contraseña }`
- Response: `{ token, usuario }`
- Status: 200 OK | 401 Unauthorized

**POST** `/api/auth/crear-usuario` (Admin solo)
- Headers: `Authorization: Bearer TOKEN`
- Request: `{ nombre_usuario, email, contraseña, rol }`
- Response: `{ usuario }`
- Status: 201 Created | 403 Forbidden

---

### Datos (requieren token)

**GET** `/api/datos/:tabla`
- Headers: `Authorization: Bearer TOKEN`
- Params: `tabla` = ventas | clientes | vendedores | productos
- Response: Array de registros
- Status: 200 OK | 401 Unauthorized

**POST** `/api/datos/:tabla`
- Headers: `Authorization: Bearer TOKEN`
- Body: Datos del registro
- Response: Registro creado
- Status: 201 Created

**PUT** `/api/datos/:tabla/:id`
- Headers: `Authorization: Bearer TOKEN`
- Body: Datos a actualizar
- Response: Registro actualizado
- Status: 200 OK

**DELETE** `/api/datos/:tabla/:id`
- Headers: `Authorization: Bearer TOKEN`
- Response: `{ mensaje: "Registro eliminado" }`
- Status: 200 OK

---

## 🔄 Ciclo de Vida de una Sesión

```
1. INICIO
   └─ Usuario abre gestion_comercial.html
   
2. DETECCIÓN
   └─ Frontend verifica localStorage.user
      ✅ Si existe → muestra dashboard
      ❌ Si no existe → muestra login

3. AUTENTICACIÓN
   └─ Usuario ingresa email + contraseña
   └─ Click "Entrar"
   └─ Frontend → POST /api/auth/login
   └─ Backend → valida con bcrypt
      ✅ Correcto → genera JWT (8h)
      ❌ Incorrecto → error 401
   └─ Frontend guarda token en localStorage

4. USO
   └─ Cada acción (crear, editar, etc.)
   └─ Envía header: Authorization: Bearer TOKEN
   └─ Backend valida JWT + permisos
   └─ Filtra datos según rol

5. CIERRE
   └─ Usuario cierra navegador/pestaña
   └─ beforeunload event limpia localStorage
   └─ Próxima vez debe autenticarse again
```

---

## 📊 Flujo de Datos: Crear Venta (Vendedor)

```
FRONTEND                            BACKEND                    SUPABASE
   │                                   │                           │
   ├─ Form: Crear venta                │                           │
   │  - Cliente: ABC                   │                           │
   │  - Monto: $1000                   │                           │
   │  - Método: Efectivo               │                           │
   │                                   │                           │
   └─ POST /api/datos/ventas ────────► │                           │
      + JWT token                      │                           │
                                       ├─ Validar JWT             │
                                       │  ✅ Valid & no expire    │
                                       │                           │
                                       ├─ Validar permisos        │
                                       │  ✅ Vendedor → crear OK  │
                                       │                           │
                                       ├─ Auto-asignar            │
                                       │  id_vendedor = 2         │
                                       │                           │
                                       └─ INSERT ventas ────────► │
                                          (cliente, monto,         │
                                           metodo, vendedor: 2)    │
                                                                    │
                                                           ✅ INSERT
                                                           id_venta=42
                                                                    │
                              JSON {id_venta: 42} ◄─────────────────┘
   ◄──── response + data ─────┤
   │
   ├─ Mostrar: "✅ Venta creada"
   ├─ Recargar tabla
   └─ Dashboard actualizado
```

---

## 🔑 JWT Token Payload

```json
{
  "id_usuario": 2,
  "nombre_usuario": "Vendedor",
  "email": "vendedor@example.com",
  "rol": "vendedor",
  "iat": 1717891234,
  "exp": 1717927234
}
```

- **iat:** Issued At (cuándo se creó)
- **exp:** Expiration (vence en 8 horas)

---

## 🛡️ Protecciones Implementadas

| Capa | Protección | Cómo |
|------|-----------|------|
| **Contraseñas** | bcrypt 10-rounds | Hash irreversible |
| **Sesiones** | JWT signed | Token verificado en cada request |
| **Base de datos** | Validación ORM | Previene SQL injection |
| **Permisos** | Servidor-side | No confiar en cliente |
| **CORS** | Whitelist headers | Solo frontend autorizado |
| **Datos** | Filtrado por rol | Vendedor solo ve sus datos |

---

## 📈 Performance

- Frontend: Single HTML (carga rápida)
- Backend: Node.js async (maneja múltiples conexiones)
- BD: Supabase PostgreSQL (optimizada)
- Token expira en 8h: Balance entre seguridad y usabilidad

---

## 🚀 Despliegue

### Frontend
```
Opción 1: GitHub Pages (gratis)
- Push a gh-pages branch
- URL: https://usuario.github.io/gestion-comercial

Opción 2: Netlify (gratis con SSL)
- Conectar GitHub
- Deploy automático

Opción 3: Tu servidor
- Copiar HTML a carpeta pública
```

### Backend
```
Opción 1: Heroku (gratis con limitaciones)
- git push heroku main

Opción 2: Railway.app
- Conectar GitHub
- Deploy automático

Opción 3: Tu servidor (AWS, DigitalOcean, etc)
- npm install
- npm start
```

---

**Arquitectura diseñada para:**
- ✅ Seguridad
- ✅ Escalabilidad
- ✅ Mantenibilidad
- ✅ Performance
