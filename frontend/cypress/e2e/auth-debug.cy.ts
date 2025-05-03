describe('Página de Diagnóstico de Autenticación', () => {
  beforeEach(() => {
    // Visitar la página de diagnóstico antes de cada prueba
    cy.visit('/auth/debug')
  })

  it('debería mostrar la página de diagnóstico de autenticación', () => {
    // Verificar que se muestra la página de diagnóstico
    cy.contains('Diagnóstico de Autenticación').should('be.visible')
  })

  it('debería mostrar la sección de configuración de Supabase', () => {
    // Verificar que se muestra la sección de configuración de Supabase
    cy.contains('Configuración de Supabase').should('be.visible')

    // Verificar que se muestra la URL de Supabase
    cy.contains('URL:').should('be.visible')

    // Verificar que se muestra la clave anónima de Supabase
    cy.contains('Clave anónima:').should('be.visible')

    // Verificar que se muestra el estado de conexión
    cy.contains('Estado de conexión:').should('be.visible')
  })

  it('debería mostrar la sección de LocalStorage', () => {
    // Verificar que se muestra la sección de LocalStorage
    cy.contains('LocalStorage').should('be.visible')

    // Verificar que se muestran los elementos almacenados en localStorage
    cy.contains('Elementos almacenados en localStorage').should('be.visible')
  })

  it('debería verificar la conexión a Supabase', () => {
    // Hacer clic en el botón de verificar conexión
    cy.contains('Verificar conexión').click()

    // Verificar que se muestra el estado de la conexión
    cy.contains(/conexión exitosa|conexión parcial|error/i, { timeout: 10000 }).should('be.visible')
  })

  it('debería mostrar los botones de reparación de perfiles', () => {
    // Verificar que se muestra el botón de verificar y reparar perfiles
    cy.contains('Verificar y reparar perfiles').should('be.visible')

    // Verificar que se muestra el botón de reparar políticas RLS
    cy.contains('Reparar políticas RLS').should('be.visible')
  })

  it('debería mostrar la sección de pruebas de autenticación', () => {
    // Verificar que se muestra la sección de pruebas de autenticación
    cy.contains('Pruebas de Autenticación').should('be.visible')

    // Verificar que se muestra el botón de prueba de autenticación con Google desde el cliente
    cy.contains('Iniciar prueba cliente').should('be.visible')

    // Verificar que se muestra el botón de prueba de autenticación con Google desde el servidor
    cy.contains('Iniciar prueba servidor').should('be.visible')
  })

  it('debería mostrar la sección de pruebas de autenticación con email', () => {
    // Verificar que se muestra la sección de pruebas de autenticación con email
    cy.contains('Pruebas de Autenticación con Email').should('be.visible')

    // Verificar que se muestra el formulario de prueba de autenticación con email
    cy.get('#email').should('be.visible')
    cy.get('#password').should('be.visible')

    // Verificar que se muestran los botones de prueba
    cy.contains('Iniciar Sesión (Cliente)').should('be.visible')
    cy.contains('Registrarse (Cliente)').should('be.visible')
  })

  it('debería actualizar la información de localStorage', () => {
    // Hacer clic en el botón de actualizar
    cy.contains('Actualizar').click()

    // Verificar que se muestra la información actualizada
    cy.contains('Elementos almacenados en localStorage').should('be.visible')
  })

  it('debería limpiar la información de localStorage', () => {
    // Hacer clic en el botón de limpiar
    cy.contains('Limpiar').click()

    // Verificar que se ha limpiado la información
    cy.contains('Elementos almacenados en localStorage').should('be.visible')
  })
})
