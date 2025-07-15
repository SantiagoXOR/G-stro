describe('Authentication Flow', () => {
  beforeEach(() => {
    // Visitar la página de inicio antes de cada prueba
    cy.visit('/')

    // Limpiar el localStorage para asegurar que no hay sesión activa
    cy.window().then((win) => {
      win.localStorage.clear()
      win.sessionStorage.clear()
    })
  })

  it('navigates to login page from homepage', () => {
    // Hacer clic en el enlace de perfil que debería redirigir al login
    cy.get('a[href="/profile"]').click()

    // Verificar que se redirige a la página de login
    cy.url().should('include', '/auth/sign-in')
    cy.contains('Iniciar sesión en Gëstro').should('be.visible')
  })

  it('shows Clerk authentication form', () => {
    // Ir a la página de login
    cy.visit('/auth/sign-in')

    // Verificar que el formulario de Clerk está presente
    cy.contains('Iniciar sesión en Gëstro').should('be.visible')
    cy.contains('Bienvenido de vuelta').should('be.visible')

    // Verificar que hay elementos del formulario de Clerk
    cy.get('.cl-rootBox, .cl-card, [data-testid="sign-in-form"]', { timeout: 10000 }).should('be.visible')
  })

  it('switches between login and register forms', () => {
    // Ir a la página de login
    cy.visit('/auth/sign-in')

    // Verificar que estamos en el formulario de login
    cy.contains('Iniciar sesión en Gëstro').should('be.visible')

    // Cambiar al formulario de registro usando el enlace
    cy.get('a[href="/auth/sign-up"]').click()

    // Verificar que estamos en el formulario de registro
    cy.url().should('include', '/auth/sign-up')
    cy.contains('Crear cuenta en Gëstro').should('be.visible')

    // Volver al formulario de login
    cy.get('a[href="/auth/sign-in"]').click()

    // Verificar que estamos de vuelta en el formulario de login
    cy.url().should('include', '/auth/sign-in')
    cy.contains('Iniciar sesión en Gëstro').should('be.visible')
  })

  it('shows sign-up page correctly', () => {
    // Ir a la página de registro directamente
    cy.visit('/auth/sign-up')

    // Verificar que estamos en la página de registro
    cy.contains('Crear cuenta en Gëstro').should('be.visible')
    cy.contains('Únete a nosotros').should('be.visible')

    // Verificar que el formulario de Clerk está presente
    cy.get('.cl-rootBox, .cl-card, [data-testid="sign-up-form"]', { timeout: 10000 }).should('be.visible')
  })

  it('redirects protected routes to login when not authenticated', () => {
    // Intentar acceder a una ruta protegida sin autenticación
    cy.visit('/profile')

    // Verificar que se redirige a la página de login
    cy.url().should('include', '/auth/sign-in')
    cy.contains('Iniciar sesión en Gëstro').should('be.visible')
  })
})
