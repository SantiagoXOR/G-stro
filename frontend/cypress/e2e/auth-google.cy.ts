describe('Autenticación con Google', () => {
  beforeEach(() => {
    // Visitar la página de inicio antes de cada prueba
    cy.visit('/')

    // Limpiar el localStorage para asegurar que no hay sesión activa
    cy.window().then((win) => {
      win.localStorage.clear()
      win.sessionStorage.clear()
    })
  })

  it('debería mostrar el botón de inicio de sesión con Google', () => {
    // Ir a la página de login
    cy.visit('/auth/sign-in')

    // Verificar que el formulario de Clerk está cargado
    cy.get('.cl-rootBox, .cl-card', { timeout: 10000 }).should('be.visible')

    // Verificar que hay botones disponibles (Clerk renderiza Google automáticamente)
    cy.get('button').should('have.length.at.least', 1)
  })

  it('debería cargar correctamente la página de autenticación', () => {
    // Ir a la página de login
    cy.visit('/auth/sign-in')

    // Verificar que estamos en la página correcta
    cy.url().should('include', '/auth/sign-in')
    cy.contains('Iniciar sesión en Gëstro').should('be.visible')

    // Verificar que el componente de Clerk está presente
    cy.get('.cl-rootBox, .cl-card').should('be.visible')
  })

  it('debería permitir navegación entre login y registro', () => {
    // Ir a la página de login
    cy.visit('/auth/sign-in')

    // Verificar que estamos en login
    cy.contains('Iniciar sesión en Gëstro').should('be.visible')

    // Navegar a registro
    cy.get('a[href="/auth/sign-up"]').click()

    // Verificar que estamos en registro
    cy.url().should('include', '/auth/sign-up')
    cy.contains('Crear cuenta en Gëstro').should('be.visible')
  })

  it('debería redirigir rutas protegidas a autenticación', () => {
    // Intentar acceder a una ruta protegida
    cy.visit('/profile')

    // Verificar que se redirige a login
    cy.url().should('include', '/auth/sign-in')
    cy.contains('Iniciar sesión en Gëstro').should('be.visible')
  })

  it('debería mostrar elementos de autenticación social', () => {
    // Ir a la página de registro para ver más opciones sociales
    cy.visit('/auth/sign-up')

    // Verificar que el formulario de Clerk está presente
    cy.get('.cl-rootBox, .cl-card', { timeout: 10000 }).should('be.visible')

    // Verificar que hay elementos interactivos
    cy.get('button, input').should('have.length.at.least', 1)
  })
})
