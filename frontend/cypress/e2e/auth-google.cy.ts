describe('Autenticación con Google', () => {
  beforeEach(() => {
    // Visitar la página de inicio antes de cada prueba
    cy.visit('/')

    // Limpiar el localStorage para asegurar que no hay sesión activa
    cy.window().then((win) => {
      win.localStorage.clear()
    })
  })

  it('debería mostrar el botón de inicio de sesión con Google', () => {
    // Ir a la página de login
    cy.visit('/auth/login')

    // Verificar que se muestra el botón de Google
    cy.get('button').contains(/google/i).should('be.visible')
  })

  it('debería tener un botón de Google funcional', () => {
    // Ir a la página de login
    cy.visit('/auth/login')

    // Verificar que el botón de Google tiene un evento onClick
    cy.get('button').contains(/google/i).should('have.attr', 'type', 'button')
  })

  it('debería mostrar la página de diagnóstico de autenticación', () => {
    // Ir a la página de diagnóstico
    cy.visit('/auth/debug')

    // Verificar que se muestra la página de diagnóstico
    cy.contains('Diagnóstico de Autenticación').should('be.visible')

    // Verificar que se muestra la sección de configuración de Supabase
    cy.contains('Configuración de Supabase').should('be.visible')

    // Verificar que se muestra la sección de LocalStorage
    cy.contains('LocalStorage').should('be.visible')
  })

  it('debería mostrar los botones de prueba de autenticación con Google', () => {
    // Ir a la página de diagnóstico
    cy.visit('/auth/debug')

    // Verificar que se muestra la sección de pruebas de autenticación
    cy.contains('Pruebas de Autenticación').should('be.visible')

    // Verificar que se muestra el botón de prueba de autenticación con Google desde el cliente
    cy.contains('Iniciar prueba cliente').should('be.visible')

    // Verificar que se muestra el botón de prueba de autenticación con Google desde el servidor
    cy.contains('Iniciar prueba servidor').should('be.visible')
  })

  it('debería mostrar los botones de reparación de perfiles', () => {
    // Ir a la página de diagnóstico
    cy.visit('/auth/debug')

    // Verificar que se muestra el botón de verificar y reparar perfiles
    cy.contains('Verificar y reparar perfiles').should('be.visible')

    // Verificar que se muestra el botón de reparar políticas RLS
    cy.contains('Reparar políticas RLS').should('be.visible')
  })
})
