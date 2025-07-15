/**
 * Configuración de desarrollo para Gëstro
 * Incluye configuraciones específicas para Fast Refresh y debugging
 */

module.exports = {
  // Configuración de Fast Refresh
  fastRefresh: {
    enabled: true,
    monitor: true,
    autoFix: false, // Cambiar a true para auto-corrección
    showStatus: true
  },

  // Configuración de debugging
  debugging: {
    showComponentUpdates: false,
    logStateChanges: false,
    trackRerenders: true
  },

  // Configuración de linting
  linting: {
    strictMode: true,
    autoFix: true,
    showWarnings: true
  },

  // Configuración de hot reload
  hotReload: {
    enabled: true,
    preserveState: true,
    showReloadReason: true
  }
};
