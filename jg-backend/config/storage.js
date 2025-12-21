const { v4: uuidv4 } = require('uuid');
const path = require('path');
const multer = require('multer');
const { getAdminConnection, supabaseUrl } = require('./database');

const BUCKET_NAME = 'imagenes';

// Configuración de Multer para usar memoria
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    
    if (!allowedExtensions.includes(ext)) {
      return cb(new Error(`Extensión no permitida: ${ext}`));
    }
    cb(null, true);
  }
});

// Middleware para un solo archivo
const uploadSingle = upload.single('file');

// Carpetas permitidas
const ALLOWED_FOLDERS = {
  usuarios: 'usuarios',
  productos: 'productos',
  variantes: 'variantes'
};

// Extensiones permitidas
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// Genera nombre único para el archivo
const generateUniqueFileName = (originalName) => {
  const ext = path.extname(originalName).toLowerCase();
  const baseName = path.basename(originalName, ext)
    .replace(/[^a-zA-Z0-9]/g, '-')
    .substring(0, 50);
  const uniqueId = uuidv4().split('-').slice(0, 2).join('');
  return `${uniqueId}-${baseName}${ext}`;
};

// Valida el tipo de archivo
const validateFile = (file) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error(`Extensión no permitida: ${ext}. Permitidas: ${ALLOWED_EXTENSIONS.join(', ')}`);
  }
  
  // Validar tamaño (máximo 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('El archivo excede el tamaño máximo de 5MB');
  }
  
  return true;
};

// Sube una imagen al storage
const uploadImage = async (file, folder) => {
  if (!ALLOWED_FOLDERS[folder]) {
    throw new Error(`Carpeta no válida: ${folder}. Permitidas: ${Object.keys(ALLOWED_FOLDERS).join(', ')}`);
  }
  
  validateFile(file);
  
  const supabase = getAdminConnection();
  const fileName = generateUniqueFileName(file.originalname);
  const filePath = `${folder}/${fileName}`;
  
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });
  
  if (error) {
    throw new Error(`Error al subir imagen: ${error.message}`);
  }
  
  // Obtener URL pública
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);
  
  return {
    path: filePath,
    url: publicUrl,
    fileName: fileName
  };
};

// Elimina una imagen del storage
const deleteImage = async (filePath) => {
  if (!filePath) return true;
  
  const supabase = getAdminConnection();
  
  // Extraer solo el path relativo si viene URL completa
  let relativePath = filePath;
  if (filePath.includes(BUCKET_NAME)) {
    const parts = filePath.split(`${BUCKET_NAME}/`);
    relativePath = parts[parts.length - 1];
  }
  
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([relativePath]);
  
  if (error) {
    console.error('Error al eliminar imagen:', error.message);
    return false;
  }
  
  return true;
};

// Reemplaza una imagen (elimina la anterior y sube la nueva)
const replaceImage = async (file, folder, oldFilePath) => {
  // Primero subir la nueva
  const newImage = await uploadImage(file, folder);
  
  // Luego eliminar la anterior (si existe)
  if (oldFilePath) {
    await deleteImage(oldFilePath).catch(err => {
      console.error('Error eliminando imagen anterior:', err);
    });
  }
  
  return newImage;
};

// Lista archivos en una carpeta
const listImages = async (folder) => {
  if (!ALLOWED_FOLDERS[folder]) {
    throw new Error(`Carpeta no válida: ${folder}`);
  }
  
  const supabase = getAdminConnection();
  
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list(folder, {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' }
    });
  
  if (error) {
    throw new Error(`Error listando imágenes: ${error.message}`);
  }
  
  return data.map(file => ({
    name: file.name,
    path: `${folder}/${file.name}`,
    url: `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${folder}/${file.name}`,
    createdAt: file.created_at
  }));
};

module.exports = {
  uploadImage,
  deleteImage,
  replaceImage,
  listImages,
  uploadSingle,
  ALLOWED_FOLDERS,
  BUCKET_NAME,
  generateUniqueFileName
};
