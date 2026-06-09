# 📤 Cómo Subir a GitHub

## Paso 1: Crear Repositorio en GitHub

1. Ve a [github.com](https://github.com)
2. Inicia sesión en tu cuenta
3. Haz clic en **"+"** (arriba a la derecha) → **"New repository"**
4. Rellena:
   - **Repository name:** `gestion-comercial`
   - **Description:** Sistema de gestión comercial con autenticación segura
   - **Public** (para que sea visible)
   - **✅ Add a README file**
5. Haz clic en **"Create repository"**

---

## Paso 2: Descargar GitHub Desktop (Recomendado)

**Opción A: Interfaz gráfica (fácil)**
- Descarga [GitHub Desktop](https://desktop.github.com)
- Abre la app
- "Clone a repository from the Internet"
- Selecciona tu repositorio
- Elige carpeta local

**Opción B: Terminal (más rápido)**
- Sigue Paso 3

---

## Paso 3: Usando Terminal (Git)

### 3.1 Clonar el repositorio

```bash
# Ir a carpeta donde quieres el proyecto
cd ~/Documentos

# Clonar (reemplaza USUARIO con tu username)
git clone https://github.com/USUARIO/gestion-comercial.git

# Entrar a la carpeta
cd gestion-comercial
```

### 3.2 Crear estructura de carpetas

```bash
# Frontend
mkdir -p frontend
mv gestion_comercial.html frontend/
mv gestion_comercial.html frontend/index.html  # Renombrar

# Backend
mkdir -p backend
mv server.js backend/
mv package.json backend/
mv .env.example backend/
mv README_BACKEND.md backend/README.md
```

### 3.3 Copiar archivos de configuración

```bash
# En la raíz del proyecto
cp .gitignore .gitignore
cp README.md README.md
cp ARQUITECTURA.md ARQUITECTURA.md

# Backend - crear .env (no se sube a GitHub)
cd backend
cp .env.example .env
# Editar .env con tus credenciales
```

### 3.4 Agregar cambios a Git

```bash
# Verificar estado
git status

# Agregar TODOS los archivos
git add .

# Ver cambios preparados
git status
```

### 3.5 Commit (guardar cambios)

```bash
git commit -m "Inicial: Sistema de gestión comercial con backend seguro"
```

### 3.6 Push (enviar a GitHub)

```bash
git push origin main
```

---

## Paso 4: Verificar en GitHub

1. Ve a tu repositorio en GitHub
2. Verifica que veas:
   - ✅ `frontend/gestion_comercial.html`
   - ✅ `backend/server.js`
   - ✅ `backend/package.json`
   - ✅ `backend/.env.example`
   - ✅ `README.md`
   - ✅ `ARQUITECTURA.md`

---

## Paso 5: Actualizar desde GitHub

Cuando hagas cambios locales:

```bash
# Terminal - en carpeta del proyecto
git add .
git commit -m "Descripción del cambio"
git push origin main
```

O con GitHub Desktop:
1. Abre GitHub Desktop
2. Verás "Changes"
3. Escribe resumen en "Summary"
4. Haz clic en "Commit to main"
5. Haz clic en "Push origin"

---

## Paso 6: Clonar en otra computadora

```bash
git clone https://github.com/USUARIO/gestion-comercial.git
cd gestion-comercial

# Backend
cd backend
npm install
cp .env.example .env
# Editar .env
npm start

# Frontend
# Abrir: frontend/gestion_comercial.html en navegador
```

---

## 📋 Estructura Final en GitHub

```
gestion-comercial/
├── frontend/
│   └── gestion_comercial.html
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── README.md
├── .gitignore
├── README.md
├── ARQUITECTURA.md
└── SEGURIDAD.md (si creas este)
```

---

## 🚀 Desplegar Frontend desde GitHub

### Opción 1: GitHub Pages (Gratis)

1. En GitHub, ve a tu repositorio → **Settings**
2. En el menú izquierdo: **Pages**
3. Source: Selecciona "main" branch
4. Folder: `/frontend`
5. Haz clic en **Save**
6. Espera 2-3 minutos
7. Tu sitio estará en: `https://usuario.github.io/gestion-comercial`

### Opción 2: Vercel (Gratis, más fácil)

1. Ve a [vercel.com](https://vercel.com)
2. "New Project"
3. "Import Git Repository"
4. Selecciona `gestion-comercial`
5. Configure:
   - Root Directory: `frontend`
6. Deploy
7. Tu sitio estará automáticamente en URL de Vercel

### Opción 3: Netlify (Gratis)

1. Ve a [netlify.com](https://netlify.com)
2. "Add new site" → "Import an existing project"
3. Conecta GitHub
4. Selecciona tu repositorio
5. Configure:
   - Base directory: `frontend`
6. Deploy

---

## 🔒 Proteger datos sensibles

### NO SUBIR A GITHUB:
```
❌ .env (archivo con credenciales)
❌ node_modules/ (se puede instalar con npm)
❌ package-lock.json (opcional)
```

### SIEMPRE SUBIR:
```
✅ .env.example (template sin valores reales)
✅ .gitignore (lista de archivos a ignorar)
✅ Code fuente
✅ README.md
```

---

## 💡 Comandos Git útiles

```bash
# Ver historial de cambios
git log --oneline

# Ver cambios no guardados
git status

# Descartar cambios
git checkout -- .

# Ver branch actual
git branch

# Crear nuevo branch
git checkout -b nombre-rama

# Ver diferencias
git diff

# Actualizar desde GitHub
git pull origin main
```

---

## 🆘 Problemas comunes

**Error: "fatal: not a git repository"**
```bash
# Estar en la carpeta correcta
cd gestion-comercial
git status
```

**Error: "fatal: the current branch main has no upstream branch"**
```bash
git push -u origin main
```

**No quiero subir mis cambios locales**
```bash
git reset --hard origin/main
```

**Olvidé agregar .env a .gitignore**
```bash
# Eliminar del seguimiento (no borrar archivo)
git rm --cached backend/.env
# Confirmar
git commit -m "Remover .env del repositorio"
git push origin main
```

---

## 📊 Próximos pasos

1. ✅ Código en GitHub
2. ⏳ Frontend desplegado en GitHub Pages / Vercel
3. ⏳ Backend desplegado en Railway / Heroku
4. ⏳ Dominio personalizado (opcional)

---

## 📞 Compartir tu proyecto

Una vez en GitHub, puedes compartir:
- Enlace del repo: `https://github.com/USUARIO/gestion-comercial`
- Frontend desplegado: `https://usuario.github.io/gestion-comercial`
- Documentación completa en el README

---

**¡Listo para compartir tu sistema! 🎉**
