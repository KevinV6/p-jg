const { getAdminConnection } = require('../config/database');
const { generateTokens } = require('../middleware/auth');
const { 
  hashPassword, 
  comparePassword, 
  successResponse, 
  errorResponse,
  validateRequired 
} = require('../utils/helpers');

// Login
const login = async (req, res) => {
  try {
    const { nombreusuario, contrasenia } = req.body;
    
    // Validar campos
    const validation = validateRequired({ nombreusuario, contrasenia }, ['nombreusuario', 'contrasenia']);
    if (!validation.valid) {
      return errorResponse(res, `Campos requeridos: ${validation.missing.join(', ')}`, 400);
    }

    const supabase = getAdminConnection();
    
    // Buscar usuario
    const { data: user, error } = await supabase
      .from('usuario')
      .select('*')
      .eq('nombreusuario', nombreusuario)
      .eq('estado', 1)
      .single();

    if (error || !user) {
      return errorResponse(res, 'Usuario o contraseña incorrectos', 401);
    }

    // Verificar contraseña
    const isValidPassword = await comparePassword(contrasenia, user.contrasenia);
    if (!isValidPassword) {
      return errorResponse(res, 'Usuario o contraseña incorrectos', 401);
    }

    // Generar tokens
    const { token, refreshToken } = generateTokens(user);

    // Calcular fecha de expiración (24 horas)
    const fechaExpiracion = new Date();
    fechaExpiracion.setHours(fechaExpiracion.getHours() + 24);

    // Guardar sesión
    const { error: sessionError } = await supabase
      .from('sesion_token')
      .insert({
        usuarioid: user.idusuario,
        token,
        refresh_token: refreshToken,
        dispositivo: req.headers['user-agent'] || 'Unknown',
        fechaexpiracion: fechaExpiracion.toISOString(),
        estado: 1
      });

    if (sessionError) {
      console.error('Error guardando sesión:', sessionError);
    }

    // Respuesta sin contraseña
    const { contrasenia: _, ...userWithoutPassword } = user;

    return successResponse(res, {
      user: userWithoutPassword,
      token,
      refreshToken,
      expiresAt: fechaExpiracion.toISOString()
    }, 'Login exitoso');

  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Registro
const register = async (req, res) => {
  try {
    const { 
      nombreusuario, 
      contrasenia, 
      email,
      primernombre, 
      apellidopaterno, 
      apellidomaterno,
      rol = 'vendedor'
    } = req.body;

    // Validar campos
    const validation = validateRequired(
      { nombreusuario, contrasenia, primernombre, apellidopaterno },
      ['nombreusuario', 'contrasenia', 'primernombre', 'apellidopaterno']
    );
    
    if (!validation.valid) {
      return errorResponse(res, `Campos requeridos: ${validation.missing.join(', ')}`, 400);
    }

    if (contrasenia.length < 6) {
      return errorResponse(res, 'La contraseña debe tener al menos 6 caracteres', 400);
    }

    const supabase = getAdminConnection();

    // Verificar si usuario existe
    const { data: existingUser } = await supabase
      .from('usuario')
      .select('idusuario')
      .eq('nombreusuario', nombreusuario)
      .single();

    if (existingUser) {
      return errorResponse(res, 'El nombre de usuario ya está en uso', 400);
    }

    // Verificar email si se proporciona
    if (email) {
      const { data: existingEmail } = await supabase
        .from('usuario')
        .select('idusuario')
        .eq('email', email)
        .single();

      if (existingEmail) {
        return errorResponse(res, 'El email ya está registrado', 400);
      }
    }

    // Hash de contraseña
    const hashedPassword = await hashPassword(contrasenia);

    // Crear usuario
    const { data: newUser, error } = await supabase
      .from('usuario')
      .insert({
        nombreusuario,
        contrasenia: hashedPassword,
        email,
        primernombre,
        apellidopaterno,
        apellidomaterno,
        rol,
        photo: '',
        estado: 1
      })
      .select()
      .single();

    if (error) {
      console.error('Error creando usuario:', error);
      return errorResponse(res, 'Error al crear usuario', 500);
    }

    // Generar tokens
    const { token, refreshToken } = generateTokens(newUser);

    // Calcular fecha de expiración
    const fechaExpiracion = new Date();
    fechaExpiracion.setHours(fechaExpiracion.getHours() + 24);

    // Guardar sesión
    await supabase
      .from('sesion_token')
      .insert({
        usuarioid: newUser.idusuario,
        token,
        refresh_token: refreshToken,
        dispositivo: req.headers['user-agent'] || 'Unknown',
        fechaexpiracion: fechaExpiracion.toISOString(),
        estado: 1
      });

    const { contrasenia: _, ...userWithoutPassword } = newUser;

    return successResponse(res, {
      user: userWithoutPassword,
      token,
      refreshToken,
      expiresAt: fechaExpiracion.toISOString()
    }, 'Usuario registrado exitosamente', 201);

  } catch (error) {
    console.error('Register error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Logout
const logout = async (req, res) => {
  try {
    const supabase = getAdminConnection();
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      // Invalidar sesión
      await supabase
        .from('sesion_token')
        .update({ estado: 0 })
        .eq('token', token);
    }

    return successResponse(res, null, 'Sesión cerrada exitosamente');

  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse(res, 'Error al cerrar sesión', 500);
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: oldRefreshToken } = req.body;

    if (!oldRefreshToken) {
      return errorResponse(res, 'Refresh token requerido', 400);
    }

    const supabase = getAdminConnection();

    // Buscar sesión con el refresh token
    const { data: session, error } = await supabase
      .from('sesion_token')
      .select('*, usuario(*)')
      .eq('refresh_token', oldRefreshToken)
      .eq('estado', 1)
      .single();

    if (error || !session) {
      return errorResponse(res, 'Refresh token inválido', 401);
    }

    // Invalidar sesión anterior
    await supabase
      .from('sesion_token')
      .update({ estado: 0 })
      .eq('idsesion', session.idsesion);

    // Generar nuevos tokens
    const { token, refreshToken: newRefreshToken } = generateTokens(session.usuario);

    // Calcular nueva expiración
    const fechaExpiracion = new Date();
    fechaExpiracion.setHours(fechaExpiracion.getHours() + 24);

    // Crear nueva sesión
    await supabase
      .from('sesion_token')
      .insert({
        usuarioid: session.usuarioid,
        token,
        refresh_token: newRefreshToken,
        dispositivo: session.dispositivo,
        fechaexpiracion: fechaExpiracion.toISOString(),
        estado: 1
      });

    return successResponse(res, {
      token,
      refreshToken: newRefreshToken,
      expiresAt: fechaExpiracion.toISOString()
    }, 'Token renovado exitosamente');

  } catch (error) {
    console.error('Refresh token error:', error);
    return errorResponse(res, 'Error al renovar token', 500);
  }
};

// Obtener perfil actual
const getProfile = async (req, res) => {
  try {
    const supabase = getAdminConnection();

    const { data: user, error } = await supabase
      .from('usuario')
      .select('*')
      .eq('idusuario', req.user.idusuario)
      .eq('estado', 1)
      .single();

    if (error || !user) {
      return errorResponse(res, 'Usuario no encontrado', 404);
    }

    const { contrasenia, ...userWithoutPassword } = user;
    return successResponse(res, userWithoutPassword);

  } catch (error) {
    console.error('Get profile error:', error);
    return errorResponse(res, 'Error al obtener perfil', 500);
  }
};

// Actualizar perfil
const updateProfile = async (req, res) => {
  try {
    const { primernombre, apellidopaterno, apellidomaterno, email, photo } = req.body;

    const supabase = getAdminConnection();

    // Si se actualiza email, verificar que no exista
    if (email) {
      const { data: existingEmail } = await supabase
        .from('usuario')
        .select('idusuario')
        .eq('email', email)
        .neq('idusuario', req.user.idusuario)
        .single();

      if (existingEmail) {
        return errorResponse(res, 'El email ya está en uso', 400);
      }
    }

    const updateData = {};
    if (primernombre !== undefined) updateData.primernombre = primernombre;
    if (apellidopaterno !== undefined) updateData.apellidopaterno = apellidopaterno;
    if (apellidomaterno !== undefined) updateData.apellidomaterno = apellidomaterno;
    if (email !== undefined) updateData.email = email;
    if (photo !== undefined) updateData.photo = photo;

    const { data: updatedUser, error } = await supabase
      .from('usuario')
      .update(updateData)
      .eq('idusuario', req.user.idusuario)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando perfil:', error);
      return errorResponse(res, 'Error al actualizar perfil', 500);
    }

    const { contrasenia, ...userWithoutPassword } = updatedUser;
    return successResponse(res, userWithoutPassword, 'Perfil actualizado');

  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse(res, 'Error al actualizar perfil', 500);
  }
};

// Cambiar contraseña
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const validation = validateRequired(
      { currentPassword, newPassword },
      ['currentPassword', 'newPassword']
    );
    
    if (!validation.valid) {
      return errorResponse(res, `Campos requeridos: ${validation.missing.join(', ')}`, 400);
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 'La nueva contraseña debe tener al menos 6 caracteres', 400);
    }

    const supabase = getAdminConnection();

    // Obtener usuario con contraseña
    const { data: user, error } = await supabase
      .from('usuario')
      .select('*')
      .eq('idusuario', req.user.idusuario)
      .single();

    if (error || !user) {
      return errorResponse(res, 'Usuario no encontrado', 404);
    }

    // Verificar contraseña actual
    const isValidPassword = await comparePassword(currentPassword, user.contrasenia);
    if (!isValidPassword) {
      return errorResponse(res, 'Contraseña actual incorrecta', 400);
    }

    // Hash nueva contraseña
    const hashedPassword = await hashPassword(newPassword);

    // Actualizar
    await supabase
      .from('usuario')
      .update({ contrasenia: hashedPassword })
      .eq('idusuario', req.user.idusuario);

    // Invalidar todas las sesiones excepto la actual
    const token = req.headers.authorization?.split(' ')[1];
    await supabase
      .from('sesion_token')
      .update({ estado: 0 })
      .eq('usuarioid', req.user.idusuario)
      .neq('token', token);

    return successResponse(res, null, 'Contraseña actualizada exitosamente');

  } catch (error) {
    console.error('Change password error:', error);
    return errorResponse(res, 'Error al cambiar contraseña', 500);
  }
};

// Solicitar recuperación de contraseña
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, 'Email requerido', 400);
    }

    const supabase = getAdminConnection();

    // Buscar usuario por email
    const { data: user } = await supabase
      .from('usuario')
      .select('idusuario, email, nombreusuario')
      .eq('email', email)
      .eq('estado', 1)
      .single();

    // Por seguridad, siempre responder igual
    if (!user) {
      return successResponse(res, null, 'Si el email existe, recibirás instrucciones para restablecer tu contraseña');
    }

    // Aquí iría la lógica de envío de email
    // Por ahora solo respondemos éxito
    // TODO: Implementar envío de email con código de recuperación

    return successResponse(res, null, 'Si el email existe, recibirás instrucciones para restablecer tu contraseña');

  } catch (error) {
    console.error('Request password reset error:', error);
    return errorResponse(res, 'Error en el servidor', 500);
  }
};

// Actualizar avatar de usuario
const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No se proporcionó imagen', 400);
    }

    const { uploadImage, deleteImage } = require('../config/storage');
    const supabase = getAdminConnection();

    // Obtener foto actual para eliminarla
    const { data: currentUser } = await supabase
      .from('usuario')
      .select('photo')
      .eq('idusuario', req.user.idusuario)
      .single();

    // Subir nueva imagen
    const result = await uploadImage(req.file, 'usuarios');

    // Eliminar imagen anterior si existe
    if (currentUser?.photo) {
      await deleteImage(currentUser.photo).catch(err => {
        console.error('Error eliminando avatar anterior:', err);
      });
    }

    // Actualizar usuario con nueva foto
    const { data: updatedUser, error } = await supabase
      .from('usuario')
      .update({ photo: result.url })
      .eq('idusuario', req.user.idusuario)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando avatar:', error);
      return errorResponse(res, 'Error al actualizar avatar', 500);
    }

    const { contrasenia, ...userWithoutPassword } = updatedUser;
    return successResponse(res, userWithoutPassword, 'Avatar actualizado');

  } catch (error) {
    console.error('Update avatar error:', error);
    return errorResponse(res, error.message || 'Error al actualizar avatar', 500);
  }
};

module.exports = {
  login,
  register,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  updateAvatar,
  changePassword,
  requestPasswordReset
};
