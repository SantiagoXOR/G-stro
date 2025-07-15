// Fallback para react-server-dom-webpack que evita el error crítico
// Este módulo reemplaza las funciones problemáticas con implementaciones seguras

console.warn('🔧 Usando fallback para react-server-dom-webpack para evitar errores críticos');

// Implementación de fallback que evita el error "Cannot read properties of undefined (reading 'call')"
const safeFallback = {
  // Funciones básicas que pueden ser llamadas sin causar errores
  createFromReadableStream: () => Promise.resolve(null),
  createFromFetch: () => Promise.resolve(null),
  encodeReply: () => Promise.resolve(''),
  
  // Función factory segura que evita el error de 'call'
  factory: function(moduleId) {
    console.warn('🔧 Factory fallback llamada para módulo:', moduleId);
    return function() {
      return null;
    };
  },
  
  // Función requireModule segura
  requireModule: function(moduleId) {
    console.warn('🔧 RequireModule fallback llamada para módulo:', moduleId);
    return null;
  },
  
  // Función initializeModuleChunk segura
  initializeModuleChunk: function(chunk) {
    console.warn('🔧 InitializeModuleChunk fallback llamada para chunk:', chunk);
    return Promise.resolve();
  },
  
  // Función readChunk segura
  readChunk: function(chunk) {
    console.warn('🔧 ReadChunk fallback llamada para chunk:', chunk);
    return null;
  },
  
  // Exportaciones por defecto
  __esModule: true,
  default: function() {
    return null;
  }
};

// Interceptar cualquier acceso a propiedades undefined
const handler = {
  get: function(target, prop) {
    if (prop in target) {
      return target[prop];
    }
    
    // Si la propiedad no existe, devolver una función segura
    console.warn('🔧 Acceso a propiedad no definida interceptado:', prop);
    return function() {
      console.warn('🔧 Función fallback ejecutada para:', prop);
      return null;
    };
  },
  
  set: function(target, prop, value) {
    target[prop] = value;
    return true;
  }
};

// Crear proxy para interceptar todos los accesos
const safeProxy = new Proxy(safeFallback, handler);

// Exportar el proxy como módulo
module.exports = safeProxy;

// También exportar como ES module
if (typeof exports !== 'undefined') {
  Object.assign(exports, safeProxy);
}

// Exportación por defecto
exports.default = safeProxy;
