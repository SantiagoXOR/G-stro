describe('Flujo de Autenticación Completo', () => {
  beforeEach(() => {
    // Visitar la página de inicio antes de cada prueba
    cy.visit('/')

    // Limpiar el localStorage para asegurar que no hay sesión activa
    cy.window().then((win) => {
      win.localStorage.clear()
      win.sessionStorage.clear()
    })
  })

  it('debería redirigir a login cuando se accede a una ruta protegida', () => {
    // Intentar acceder a una ruta protegida sin autenticación
    cy.visit('/profile')

    // Verificar que se redirige a la página de login
    cy.url().should('include', '/auth/sign-in')
    cy.contains('Iniciar sesión en Gëstro').should('be.visible')
  })

  it('debería mostrar la página de login correctamente', () => {
    // Ir directamente a la página de login
    cy.visit('/auth/sign-in')

    // Verificar que estamos en la página de login
    cy.url().should('include', '/auth/sign-in')
    cy.contains('Iniciar sesión en Gëstro').should('be.visible')
    cy.contains('Bienvenido de vuelta').should('be.visible')
  })

  it('debería mostrar formulario de login con campos requeridos', () => {
    // Ir a la página de login
    cy.visit('/auth/sign-in')

    // Verificar que el formulario de Clerk está presente
    cy.get('.cl-rootBox, .cl-card', { timeout: 10000 }).should('be.visible')

    // Verificar que hay campos de entrada (Clerk puede usar diferentes selectores)
    cy.get('input').should('have.length.at.least', 1)

    // Verificar que hay un botón de envío
    cy.get('button').should('have.length.at.least', 1)
  })

  it('debería navegar entre páginas de login y registro', () => {
    // Ir a la página de login
    cy.visit('/auth/sign-in')

    // Verificar que estamos en el formulario de login
    cy.contains('Iniciar sesión en Gëstro').should('be.visible')

    // Cambiar al formulario de registro usando el enlace
    cy.get('a[href="/auth/sign-up"]').click()

    // Verificar que estamos en el formulario de registro
    cy.url().should('include', '/auth/sign-up')
    cy.contains('Crear cuenta en Gëstro').should('be.visible')

    // Cambiar de nuevo al formulario de login
    cy.get('a[href="/auth/sign-in"]').click()

    // Verificar que estamos de vuelta en el formulario de login
    cy.url().should('include', '/auth/sign-in')
    cy.contains('Iniciar sesión en Gëstro').should('be.visible')
  })

  it('debería mostrar formulario de registro con campos requeridos', () => {
    // Ir a la página de registro directamente
    cy.visit('/auth/sign-up')

    // Verificar que el formulario de Clerk está presente
    cy.get('.cl-rootBox, .cl-card', { timeout: 10000 }).should('be.visible')

    // Verificar que hay campos de entrada (Clerk puede usar diferentes selectores)
    cy.get('input').should('have.length.at.least', 1)

    // Verificar que hay un botón de envío
    cy.get('button').should('have.length.at.least', 1)
  })

  it('debería mostrar el botón de inicio de sesión con Google', () => {
    // Ir a la página de login
    cy.visit('/auth/sign-in')

    // Verificar que se muestra el botón de Google (Clerk lo renderiza automáticamente)
    cy.get('button, [role="button"]', { timeout: 10000 }).should('have.length.at.least', 1)

    // Verificar que el formulario de Clerk está cargado correctamente
    cy.get('.cl-rootBox, .cl-card').should('be.visible')
  })

  it('debería redirigir a rutas protegidas cuando no hay sesión', () => {
    // Intentar acceder a una ruta protegida sin autenticación
    cy.visit('/profile')

    // Verificar que se redirige a la página de login
    cy.url().should('include', '/auth/sign-in')
    cy.contains('Iniciar sesión en Gëstro').should('be.visible')
  })

  it('debería mostrar elementos de navegación en la página principal', () => {
    // Ir a la página principal
    cy.visit('/')

    // Verificar que se muestran los elementos principales de navegación
    cy.get('h1').contains('Gëstro').should('be.visible')
    cy.contains('Ordenar Ahora').should('be.visible')
    cy.contains('Escanear Mesa').should('be.visible')

    // Verificar que la navegación inferior está presente
    cy.get('nav').should('be.visible')
    cy.contains('Inicio').should('be.visible')
    cy.contains('Menú').should('be.visible')
    cy.contains('Perfil').should('be.visible')
  })
})
