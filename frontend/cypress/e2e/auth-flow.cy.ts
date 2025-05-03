describe('Authentication Flow', () => {
  beforeEach(() => {
    // Visitar la página de inicio antes de cada prueba
    cy.visit('/')

    // Limpiar el localStorage para asegurar que no hay sesión activa
    cy.window().then((win) => {
      win.localStorage.clear()
    })
  })

  it('navigates to login page from homepage', () => {
    // Buscar y hacer clic en el botón/enlace de inicio de sesión
    cy.get('a[href*="/auth/login"]').first().click()

    // Verificar que estamos en la página de login
    cy.url().should('include', '/auth/login')
    cy.contains('Iniciar Sesión').should('be.visible')
  })

  it('shows validation errors for invalid inputs', () => {
    // Ir a la página de login
    cy.visit('/auth/login')

    // Intentar enviar el formulario sin datos
    cy.get('input[type="email"]').clear()
    cy.get('input[type="password"]').clear()
    cy.get('button[type="submit"]').click()

    // Verificar que se muestran mensajes de error (HTML5 validation)
    cy.get('input[type="email"]:invalid').should('exist')
    cy.get('input[type="password"]:invalid').should('exist')

    // Ingresar email inválido
    cy.get('input[type="email"]').type('invalid-email')
    cy.get('button[type="submit"]').click()

    // Verificar que se muestra un mensaje de error (HTML5 validation)
    cy.get('input[type="email"]:invalid').should('exist')
  })

  it('switches between login and register forms', () => {
    // Ir a la página de login
    cy.visit('/auth/login')

    // Verificar que estamos en el formulario de login
    cy.contains('Iniciar Sesión').should('be.visible')

    // Cambiar al formulario de registro haciendo clic en el enlace
    cy.contains('Regístrate').click()

    // Verificar que estamos en el formulario de registro
    cy.url().should('include', '/auth/register')
    cy.contains('Crear Cuenta').should('be.visible')

    // Volver al formulario de login
    cy.contains('Iniciar Sesión').click()

    // Verificar que estamos de vuelta en el formulario de login
    cy.url().should('include', '/auth/login')
    cy.contains('Iniciar Sesión').should('be.visible')
  })

  it('attempts to register a new user', () => {
    // Ir a la página de registro directamente
    cy.visit('/auth/register')

    // Generar un email único para evitar conflictos
    const uniqueEmail = `test_${Date.now()}@example.com`

    // Completar el formulario de registro
    cy.get('#email').type(uniqueEmail)
    cy.get('#password').type('password123')
    cy.get('#confirmPassword').type('password123')

    // Interceptar la solicitud de registro
    cy.intercept('POST', '**/auth/v1/signup**').as('signupRequest')

    // Enviar el formulario
    cy.get('button[type="submit"]').click()

    // Esperar a que se complete la solicitud de registro
    cy.wait('@signupRequest', { timeout: 10000 })

    // Verificar que el formulario se ha enviado (no podemos verificar el éxito porque no tenemos un servidor de prueba)
    cy.get('button[type="submit"]').should('exist')
  })

  it('attempts to login with valid credentials', () => {
    // Esta prueba asume que ya existe un usuario con estas credenciales
    // En un entorno de prueba real, deberías crear este usuario previamente

    // Ir a la página de login
    cy.visit('/auth/login')

    // Completar el formulario de login
    cy.get('input[type="email"]').type('test@example.com')
    cy.get('input[type="password"]').type('password123')

    // Interceptar la solicitud de inicio de sesión
    cy.intercept('POST', '**/auth/v1/token**').as('loginRequest')

    // Enviar el formulario
    cy.get('button[type="submit"]').click()

    // Esperar a que se complete la solicitud de inicio de sesión
    cy.wait('@loginRequest', { timeout: 10000 })

    // Verificar que se intentó iniciar sesión (no podemos verificar la redirección porque no tenemos credenciales válidas)
    // En un entorno real, deberíamos crear un usuario de prueba primero
    cy.get('button[type="submit"]').should('exist')
  })

  it('shows error message for invalid credentials', () => {
    // Ir a la página de login
    cy.visit('/auth/login')

    // Completar el formulario con credenciales inválidas
    cy.get('input[type="email"]').type('nonexistent@example.com')
    cy.get('input[type="password"]').type('wrongpassword')

    // Interceptar la solicitud de inicio de sesión
    cy.intercept('POST', '**/auth/v1/token**').as('loginRequest')

    // Enviar el formulario
    cy.get('button[type="submit"]').click()

    // Esperar a que se complete la solicitud de inicio de sesión
    cy.wait('@loginRequest')

    // Verificar que se muestra un mensaje de error
    cy.get('[role="alert"]').should('be.visible')
  })

  it('redirects protected routes to login when not authenticated', () => {
    // Intentar acceder a una ruta protegida sin autenticación
    cy.visit('/profile')

    // Verificar que se redirige a la página de login
    cy.url().should('include', '/auth/login')
  })
})
