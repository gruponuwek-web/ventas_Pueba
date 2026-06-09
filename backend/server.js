/**
 * Backend Seguro - Gestión Comercial
 * Node.js + Express + Supabase + bcrypt + JWT
 * 
 * INSTALACIÓN:
 * npm install express cors dotenv bcryptjs jsonwebtoken @supabase/supabase-js
 * 
 * USO:
 * node server.js
 * 
 * El servidor corre en: http://localhost:3000
 */

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();

// Configuración
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'tu-super-secreto-cambiar-en-produccion';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://eirhihyztutqlxaeqpnb.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_-mqI1RpOmiaetWBlNCB-Lw_VnWXmD8A';

// Inicializar Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Middleware de autenticación JWT
const autenticar = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// ============================================================
// AUTENTICACIÓN - ENDPOINTS PÚBLICOS
// ============================================================

/**
 * POST /api/auth/login
 * Login de usuario
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, contraseña } = req.body;
    
    if (!email || !contraseña) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }
    
    // Buscar usuario en Supabase
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .eq('activo', true);
    
    if (error || !usuarios || usuarios.length === 0) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }
    
    const usuario = usuarios[0];
    
    // Comparar contraseña con hash bcrypt
    const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);
    
    if (!contraseñaValida) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }
    
    // Generar JWT token
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        nombre_usuario: usuario.nombre_usuario,
        email: usuario.email,
        rol: usuario.rol
      },
      JWT_SECRET,
      { expiresIn: '8h' } // Token expira en 8 horas
    );
    
    res.json({
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre_usuario: usuario.nombre_usuario,
        email: usuario.email,
        rol: usuario.rol
      }
    });
    
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * POST /api/auth/crear-usuario
 * Crear nuevo usuario (solo Admin)
 */
app.post('/api/auth/crear-usuario', autenticar, async (req, res) => {
  try {
    // Validar que sea Admin
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ error: 'Solo admins pueden crear usuarios' });
    }
    
    const { nombre_usuario, email, contraseña, rol } = req.body;
    
    if (!nombre_usuario || !email || !contraseña || !rol) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    
    // Hash de la contraseña con bcrypt (10 rounds)
    const salt = await bcrypt.genSalt(10);
    const contraseñaHash = await bcrypt.hash(contraseña, salt);
    
    // Insertar en Supabase
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{
        nombre_usuario,
        email,
        contraseña: contraseñaHash,
        rol,
        activo: true
      }])
      .select();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(201).json({
      mensaje: 'Usuario creado exitosamente',
      usuario: data[0]
    });
    
  } catch (err) {
    console.error('Error creando usuario:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ============================================================
// USUARIOS - ENDPOINTS PROTEGIDOS
// ============================================================

/**
 * GET /api/usuarios
 * Obtener todos los usuarios (solo Admin)
 */
app.get('/api/usuarios', autenticar, async (req, res) => {
  try {
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ error: 'Solo admins pueden ver usuarios' });
    }
    
    const { data, error } = await supabase
      .from('usuarios')
      .select('id_usuario, nombre_usuario, email, rol, activo, fecha_creacion')
      .order('fecha_creacion', { ascending: false });
    
    if (error) throw error;
    
    res.json(data);
    
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * PUT /api/usuarios/:id
 * Editar usuario (Admin o el mismo usuario)
 */
app.put('/api/usuarios/:id', autenticar, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_usuario, email, rol, activo, contraseña } = req.body;
    
    // Solo Admin puede editar otros, o el usuario puede editarse a sí mismo
    if (req.usuario.rol !== 'admin' && req.usuario.id_usuario !== parseInt(id)) {
      return res.status(403).json({ error: 'No tienes permiso' });
    }
    
    const updateData = {};
    if (nombre_usuario) updateData.nombre_usuario = nombre_usuario;
    if (email) updateData.email = email;
    if (rol && req.usuario.rol === 'admin') updateData.rol = rol;
    if (activo !== undefined && req.usuario.rol === 'admin') updateData.activo = activo;
    
    // Si se proporciona contraseña, hashearla
    if (contraseña && contraseña.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updateData.contraseña = await bcrypt.hash(contraseña, salt);
    }
    
    const { data, error } = await supabase
      .from('usuarios')
      .update(updateData)
      .eq('id_usuario', id)
      .select();
    
    if (error) throw error;
    
    res.json({
      mensaje: 'Usuario actualizado',
      usuario: data[0]
    });
    
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * DELETE /api/usuarios/:id
 * Eliminar usuario (solo Admin)
 */
app.delete('/api/usuarios/:id', autenticar, async (req, res) => {
  try {
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ error: 'Solo admins pueden eliminar usuarios' });
    }
    
    const { id } = req.params;
    
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id_usuario', id);
    
    if (error) throw error;
    
    res.json({ mensaje: 'Usuario eliminado' });
    
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ============================================================
// DATOS - ENDPOINTS PROTEGIDOS
// ============================================================

/**
 * GET /api/datos/:tabla
 * Obtener datos de una tabla
 */
app.get('/api/datos/:tabla', autenticar, async (req, res) => {
  try {
    const { tabla } = req.params;
    
    // Whitelist de tablas permitidas
    const tablasPermitidas = ['ventas', 'clientes', 'vendedores', 'productos'];
    if (!tablasPermitidas.includes(tabla)) {
      return res.status(400).json({ error: 'Tabla no válida' });
    }
    
    let query = supabase.from(tabla).select('*');
    
    // Si es vendedor y está pidiendo ventas, filtrar solo sus ventas
    if (req.usuario.rol === 'vendedor' && tabla === 'ventas') {
      query = query.eq('id_vendedor', req.usuario.id_usuario);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json(data);
    
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * POST /api/datos/:tabla
 * Crear registro
 */
app.post('/api/datos/:tabla', autenticar, async (req, res) => {
  try {
    const { tabla } = req.params;
    
    // Whitelist de tablas
    const tablasPermitidas = ['ventas', 'clientes', 'vendedores', 'productos'];
    if (!tablasPermitidas.includes(tabla)) {
      return res.status(400).json({ error: 'Tabla no válida' });
    }
    
    const datos = req.body;
    
    // Si es vendedor creando venta, auto-asignar id_vendedor
    if (req.usuario.rol === 'vendedor' && tabla === 'ventas') {
      datos.id_vendedor = req.usuario.id_usuario;
    }
    
    const { data, error } = await supabase
      .from(tabla)
      .insert([datos])
      .select();
    
    if (error) throw error;
    
    res.status(201).json(data[0]);
    
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * PUT /api/datos/:tabla/:id
 * Actualizar registro
 */
app.put('/api/datos/:tabla/:id', autenticar, async (req, res) => {
  try {
    const { tabla, id } = req.params;
    
    const tablasPermitidas = ['ventas', 'clientes', 'vendedores', 'productos'];
    if (!tablasPermitidas.includes(tabla)) {
      return res.status(400).json({ error: 'Tabla no válida' });
    }
    
    const datos = req.body;
    
    // Vendedor solo puede editar sus propias ventas
    if (req.usuario.rol === 'vendedor' && tabla === 'ventas') {
      const { data: venta } = await supabase
        .from(tabla)
        .select('id_vendedor')
        .eq('id_venta', id)
        .single();
      
      if (venta.id_vendedor !== req.usuario.id_usuario) {
        return res.status(403).json({ error: 'No puedes editar ventas de otros' });
      }
    }
    
    const pkCol = tabla === 'clientes' ? 'id_cliente' : 
                  tabla === 'vendedores' ? 'id_vendedor' :
                  tabla === 'productos' ? 'id_producto' : 'id_venta';
    
    const { data, error } = await supabase
      .from(tabla)
      .update(datos)
      .eq(pkCol, id)
      .select();
    
    if (error) throw error;
    
    res.json(data[0]);
    
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * DELETE /api/datos/:tabla/:id
 * Eliminar registro
 */
app.delete('/api/datos/:tabla/:id', autenticar, async (req, res) => {
  try {
    const { tabla, id } = req.params;
    
    const tablasPermitidas = ['ventas', 'clientes', 'vendedores', 'productos'];
    if (!tablasPermitidas.includes(tabla)) {
      return res.status(400).json({ error: 'Tabla no válida' });
    }
    
    const pkCol = tabla === 'clientes' ? 'id_cliente' : 
                  tabla === 'vendedores' ? 'id_vendedor' :
                  tabla === 'productos' ? 'id_producto' : 'id_venta';
    
    const { error } = await supabase
      .from(tabla)
      .delete()
      .eq(pkCol, id);
    
    if (error) throw error;
    
    res.json({ mensaje: 'Registro eliminado' });
    
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ============================================================
// HEALTH CHECK
// ============================================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ============================================================
// INICIAR SERVIDOR
// ============================================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  🚀 Backend Seguro - EN VIVO           ║
╠════════════════════════════════════════╣
║  Puerto: ${PORT}                          ║
║  URL: http://localhost:${PORT}           ║
║  Encriptación: bcrypt + JWT            ║
╚════════════════════════════════════════╝
  `);
});
