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
    cy.get('button[type="submit"]').click()
    
    // Verificar mensajes de error
    cy.contains('El correo electrónico es requerido').should('be.visible')
    cy.contains('La contraseña es requerida').should('be.visible')
    
    // Ingresar email inválido
    cy.get('input[type="email"]').type('invalid-email')
    cy.get('button[type="submit"]').click()
    
    // Verificar mensaje de error de formato de email
    cy.contains('Correo electrónico no válido').should('be.visible')
    
    // Corregir email e ingresar contraseña corta
    cy.get('input[type="email"]').clear().type('test@example.com')
    cy.get('input[type="password"]').type('123')
    cy.get('button[type="submit"]').click()
    
    // Verificar mensaje de error de longitud de contraseña
    cy.contains('La contraseña debe tener al menos 6 caracteres').should('be.visible')
  })

  it('switches between login and register forms', () => {
    // Ir a la página de login
    cy.visit('/auth/login')
    
    // Verificar que estamos en el formulario de login
    cy.contains('Iniciar Sesión').should('be.visible')
    
    // Cambiar al formulario de registro
    cy.contains('Crear una cuenta').click()
    
    // Verificar que estamos en el formulario de registro
    cy.contains('Crear Cuenta').should('be.visible')
    cy.get('input[name="name"]').should('be.visible')
    
    // Volver al formulario de login
    cy.contains('Ya tienes una cuenta').click()
    
    // Verificar que estamos de vuelta en el formulario de login
    cy.contains('Iniciar Sesión').should('be.visible')
    cy.get('input[name="name"]').should('not.exist')
  })

  it('attempts to register a new user', () => {
    // Ir a la página de login
    cy.visit('/auth/login')
    
    // Cambiar al formulario de registro
    cy.contains('Crear una cuenta').click()
    
    // Generar un email único para evitar conflictos
    const uniqueEmail = `test_${Date.now()}@example.com`
    
    // Completar el formulario de registro
    cy.get('input[name="name"]').type('Test User')
    cy.get('input[type="email"]').type(uniqueEmail)
    cy.get('input[type="password"]').type('password123')
    
    // Enviar el formulario
    cy.get('button[type="submit"]').click()
    
    // Verificar que se muestra un mensaje de éxito o que se redirige
    // Nota: Esto puede variar según la implementación
    cy.contains(/cuenta creada|verificar email|inicio de sesión exitoso/i, { timeout: 10000 }).should('be.visible')
  })

  it('attempts to login with valid credentials', () => {
    // Esta prueba asume que ya existe un usuario con estas credenciales
    // En un entorno de prueba real, deberías crear este usuario previamente
    
    // Ir a la página de login
    cy.visit('/auth/login')
    
    // Completar el formulario de login
    cy.get('input[type="email"]').type('test@example.com')
    cy.get('input[type="password"]').type('password123')
    
    // Enviar el formulario
    cy.get('button[type="submit"]').click()
    
    // Verificar que se redirige a la página principal o dashboard
    // Esto puede variar según la implementación
    cy.url().should('not.include', '/auth/login', { timeout: 10000 })
  })

  it('shows error message for invalid credentials', () => {
    // Ir a la página de login
    cy.visit('/auth/login')
    
    // Completar el formulario con credenciales inválidas
    cy.get('input[type="email"]').type('nonexistent@example.com')
    cy.get('input[type="password"]').type('wrongpassword')
    
    // Enviar el formulario
    cy.get('button[type="submit"]').click()
    
    // Verificar que se muestra un mensaje de error
    cy.contains(/credenciales inválidas|usuario no encontrado|contraseña incorrecta/i, { timeout: 10000 }).should('be.visible')
  })

  it('redirects protected routes to login when not authenticated', () => {
    // Intentar acceder a una ruta protegida sin autenticación
    cy.visit('/profile')
    
    // Verificar que se redirige a la página de login
    cy.url().should('include', '/auth/login')
  })
})
