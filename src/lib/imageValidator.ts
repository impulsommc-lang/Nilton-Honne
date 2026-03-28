/**
 * Image validation and optimization utilities
 */

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_IMAGE_WIDTH = 4096;
export const MAX_IMAGE_HEIGHT = 4096;
export const VALID_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Validates an image file before upload
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `El archivo es demasiado grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Máximo: 5MB.`
    };
  }

  // Check file type
  if (!VALID_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Formato no soportado: ${file.type}. Usa JPG, PNG, WebP o GIF.`
    };
  }

  return { valid: true };
};

/**
 * Validates image dimensions
 */
export const validateImageDimensions = (
  width: number,
  height: number
): { valid: boolean; error?: string } => {
  if (width <= 0 || height <= 0) {
    return {
      valid: false,
      error: "Las dimensiones de la imagen no son válidas."
    };
  }

  if (width > MAX_IMAGE_WIDTH || height > MAX_IMAGE_HEIGHT) {
    return {
      valid: false,
      error: `Imagen demasiado grande (${width}x${height}px). Máximo: ${MAX_IMAGE_WIDTH}x${MAX_IMAGE_HEIGHT}px.`
    };
  }

  return { valid: true };
};

/**
 * Calculates optimal canvas size maintaining aspect ratio
 */
export const calculateOptimalSize = (
  width: number,
  height: number,
  maxWidth: number = 1024,
  maxHeight: number = 1024
): { width: number; height: number } => {
  let newWidth = width;
  let newHeight = height;

  if (width > height) {
    if (width > maxWidth) {
      newHeight *= maxWidth / width;
      newWidth = maxWidth;
    }
  } else {
    if (height > maxHeight) {
      newWidth *= maxHeight / height;
      newHeight = maxHeight;
    }
  }

  return { width: Math.round(newWidth), height: Math.round(newHeight) };
};

/**
 * Estimates if a base64 image is valid
 */
export const validateBase64Image = (base64Str: string): { valid: boolean; error?: string } => {
  if (!base64Str || typeof base64Str !== 'string') {
    return {
      valid: false,
      error: "Imagen inválida o vacía."
    };
  }

  // Rough check for minimum base64 length (very small images)
  if (base64Str.length < 100) {
    return {
      valid: false,
      error: "La imagen comprimida es demasiado pequeña o corrupta."
    };
  }

  return { valid: true };
};
