# 📊 Gestión Comercial - Sistema Completo

Sistema profesional de gestión comercial con autenticación segura, control de roles y dashboard interactivo.

**Stack:** Node.js + Express + Supabase + bcrypt + JWT + HTML5

---

## ✨ Características

### 🔐 Seguridad
- ✅ Autenticación con **bcrypt** (contraseñas hasheadas)
- ✅ Tokens **JWT** con expiración
- ✅ Validación de permisos en servidor
- ✅ CORS y protección de datos

### 👥 Control de Acceso
- ✅ 3 roles: Admin, Gerente, Vendedor
- ✅ Permisos granulares por tabla
- ✅ Filtrado automático de datos por rol
- ✅ Auditoría de acciones

### 📈 Funcionalidades
- ✅ CRUD completo: Ventas, Clientes, Vendedores, Productos
- ✅ Gestión de usuarios (Admin)
- ✅ Búsqueda y filtros
- ✅ Exportar CSV
- ✅ Interfaz responsiva

---

## 📦 Estructura del Proyecto

```
gestion-comercial/
├── frontend/
│   └── gestion_comercial.html      # Aplicación web (single-file)
├── backend/
│   ├── server.js                   # Servidor Node.js
│   ├── package.json                # Dependencias
│   ├── .env.example                # Variables de entorno (template)
│   └── README.md                   # Instrucciones backend
├── .gitignore
├── README.md                       # Este archivo
└── ARQUITECTURA.md                 # Diagrama técnico
```

---

## 🚀 Inicio Rápido

### Backend (Puerto 3000)

```bash
# 1. Entrar a carpeta backend
cd backend

# 2. Instalar dependencias
npm install

# 3. Crear archivo .env
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# 4. Iniciar servidor
npm start
```

### Frontend (Navegador)

```bash
# 1. Abrir archivo en navegador
open frontend/gestion_comercial.html

# O servir con HTTP local:
cd frontend
python -m http.server 8000
# Ir a: http://localhost:8000
```

---

## 🔑 Usuarios de Prueba

Después de crear la tabla de usuarios en Supabase:

```sql
INSERT INTO usuarios (nombre_usuario, email, contraseña, rol, activo) 
VALUES ('Admin', 'admin@example.com', 'admin123', 'admin', true);

INSERT INTO usuarios (nombre_usuario, email, contraseña, rol, activo) 
VALUES ('Gerente', 'gerente@example.com', 'gerente123', 'gerente', true);

INSERT INTO usuarios (nombre_usuario, email, contraseña, rol, activo) 
VALUES ('Vendedor', 'vendedor@example.com', 'vend123', 'vendedor', true);
```

⚠️ **IMPORTANTE:** Las contraseñas deben ser hasheadas con bcrypt. Ver instrucciones en `backend/README.md`

---

## 📋 Tabla de Permiso por Rol

| Acción | Admin | Gerente | Vendedor |
|--------|-------|---------|----------|
| **Ventas** | CRUD ✅ | CRUD ✅ | Ver + Crear ✅ |
| **Clientes** | CRUD ✅ | CRUD ✅ | Solo Editar ✅ |
| **Vendedores** | CRUD ✅ | CRUD ✅ | ❌ No acceso |
| **Productos** | CRUD ✅ | CRUD ✅ | ❌ No acceso |
| **Usuarios** | CRUD ✅ | ❌ No acceso | ❌ No acceso |

---

## 🔧 Requisitos

- **Node.js** 14+ ([descargar](https://nodejs.org))
- **npm** (viene con Node.js)
- Cuenta **Supabase** ([crear gratis](https://supabase.com))
- Navegador moderno (Chrome, Firefox, Safari, Edge)

---

## 📚 Documentación

- **[Backend](./backend/README.md)** - Instalación y API
- **[Seguridad](./SEGURIDAD.md)** - Detalles técnicos
- **[Arquitectura](./ARQUITECTURA.md)** - Diagrama de flujo

---

## 🔒 Seguridad

### ✅ Implementado
- Contraseñas con bcrypt (10 rounds)
- JWT tokens (8h expiración)
- Validación servidor-side
- CORS configurado
- Filtrado de datos por rol

### ⚠️ Para Producción
1. Cambiar `JWT_SECRET` a valor aleatorio largo
2. Usar HTTPS obligatorio
3. Habilitar RLS en Supabase
4. Configurar variables de entorno de forma segura
5. Usar variables de entorno para credenciales

---

## 🐛 Troubleshooting

**Backend no inicia**
```bash
npm install
```

**Puerto 3000 en uso**
```bash
# Cambiar en .env
PORT=3001
```

**CORS error en frontend**
- Verificar que backend esté corriendo
- Comprobar URL en archivo HTML

---

## 📞 Soporte

Para reportar bugs o sugerencias:
1. Abre un Issue en GitHub
2. Describe el problema detalladamente
3. Incluye versión de Node.js: `node --version`

---

## 📄 Licencia

MIT - Libre para uso personal y comercial

---

## 🎯 Roadmap

- [ ] Recuperación de contraseña
- [ ] Autenticación 2FA
- [ ] Reportes avanzados
- [ ] App móvil
- [ ] Integración con API de pagos

---

**Hecho con ❤️ para pequeños negocios**

Última actualización: Junio 2026
