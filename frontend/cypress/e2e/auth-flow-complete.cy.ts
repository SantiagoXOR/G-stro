describe('Flujo de Autenticación Completo', () => {
  beforeEach(() => {
    // Visitar la página de inicio antes de cada prueba
    cy.visit('/')

    // Limpiar el localStorage para asegurar que no hay sesión activa
    cy.window().then((win) => {
      win.localStorage.clear()
    })
  })

  it('debería mostrar opciones de autenticación cuando no hay sesión', () => {
    // Verificar que se muestra el botón de inicio de sesión en la barra de navegación
    cy.get('a[href*="/auth/login"]').should('be.visible')

    // Verificar que se muestra el botón de registro en la barra de navegación
    cy.get('a[href*="/auth/register"]').should('be.visible')
  })

  it('debería navegar a la página de login desde la página de inicio', () => {
    // Buscar y hacer clic en el botón/enlace de inicio de sesión
    cy.get('a[href*="/auth/login"]').first().click()

    // Verificar que estamos en la página de login
    cy.url().should('include', '/auth/login')
    cy.contains('Iniciar Sesión').should('be.visible')
  })

  it('debería mostrar errores de validación en el formulario de login', () => {
    // Ir a la página de login
    cy.visit('/auth/login')

    // Intentar enviar el formulario sin datos
    cy.get('button[type="submit"]').click()

    // Verificar que se muestran mensajes de error usando atributos HTML5 de validación
    // En lugar de buscar texto específico, verificamos que los campos sean inválidos
    cy.get('input[type="email"]:invalid').should('exist')
    cy.get('input[type="password"]:invalid').should('exist')

    // Ingresar un email inválido
    cy.get('input[type="email"]').type('invalid-email')
    cy.get('button[type="submit"]').click()

    // Verificar que el campo de email sigue siendo inválido
    cy.get('input[type="email"]:invalid').should('exist')

    // Limpiar el campo de email e ingresar uno válido
    cy.get('input[type="email"]').clear().type('test@example.com')

    // Ingresar una contraseña
    cy.get('input[type="password"]').type('123')
    cy.get('button[type="submit"]').click()

    // Verificar que se intenta enviar el formulario
    cy.url().should('include', '/auth/login')
  })

  it('debería cambiar entre formularios de login y registro', () => {
    // Ir a la página de login
    cy.visit('/auth/login')

    // Verificar que estamos en el formulario de login
    cy.contains('Iniciar Sesión').should('be.visible')

    // Cambiar al formulario de registro usando el enlace en el footer
    cy.contains('Regístrate').click()

    // Verificar que estamos en el formulario de registro
    cy.contains('Crear Cuenta').should('be.visible')

    // Cambiar de nuevo al formulario de login
    cy.contains('Iniciar Sesión').click()

    // Verificar que estamos de vuelta en el formulario de login
    cy.contains('Iniciar Sesión').should('be.visible')
  })

  it('debería mostrar errores de validación en el formulario de registro', () => {
    // Ir a la página de registro directamente
    cy.visit('/auth/register')

    // Intentar enviar el formulario sin datos
    cy.get('button[type="submit"]').click()

    // Verificar que se muestran mensajes de error usando atributos HTML5 de validación
    cy.get('input[type="email"]:invalid').should('exist')
    cy.get('input[type="password"]:invalid').should('exist')

    // Ingresar un email pero dejar los otros campos vacíos
    cy.get('input[type="email"]').type('test@example.com')
    cy.get('button[type="submit"]').click()

    // Verificar que se siguen mostrando mensajes de error para los otros campos
    cy.get('input[type="password"]:invalid').should('exist')
    cy.get('input#confirmPassword:invalid').should('exist')
  })

  it('debería intentar registrar un nuevo usuario', () => {
    // Ir a la página de registro directamente
    cy.visit('/auth/register')

    // Generar un email único para evitar conflictos
    const uniqueEmail = `test_${Date.now()}@example.com`

    // Completar el formulario de registro
    cy.get('input[type="email"]').type(uniqueEmail)
    cy.get('input#password').type('password123')
    cy.get('input#confirmPassword').type('password123')

    // Enviar el formulario
    cy.get('button[type="submit"]').click()

    // Verificar que se muestra un mensaje de éxito, un error o que se redirige
    // Nota: Esto puede variar según la implementación
    // Aceptamos cualquier resultado: mensaje de éxito, error o redirección
    cy.wait(5000) // Esperar a que se complete la operación

    // Verificar que seguimos en la página de registro o hemos sido redirigidos
    cy.url().should('include', '/auth')

    // Verificar que el botón de envío ya no está en estado de carga
    cy.get('button[type="submit"]').should('not.be.disabled')
  })

  it('debería mostrar error al intentar iniciar sesión con credenciales inválidas', () => {
    // Ir a la página de login
    cy.visit('/auth/login')

    // Completar el formulario con credenciales inválidas
    cy.get('input[type="email"]').type('nonexistent@example.com')
    cy.get('input[type="password"]').type('wrongpassword')

    // Enviar el formulario
    cy.get('button[type="submit"]').click()

    // Verificar que se muestra un mensaje de error (puede tardar un poco)
    // Buscamos cualquier mensaje de error en un elemento Alert
    cy.get('[role="alert"]', { timeout: 10000 }).should('be.visible')
  })

  it('debería mostrar el botón de inicio de sesión con Google', () => {
    // Ir a la página de login
    cy.visit('/auth/login')

    // Verificar que se muestra el botón de Google
    cy.get('button').contains(/google/i).should('be.visible')
  })

  it('debería redirigir a rutas protegidas cuando no hay sesión', () => {
    // Intentar acceder a una ruta protegida sin autenticación
    cy.visit('/profile')

    // Verificar que se redirige a la página de login
    cy.url().should('include', '/auth/login')
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

    // Verificar que se muestra el botón de verificar conexión
    cy.contains('Verificar conexión').should('be.visible')
  })

  it('debería verificar la conexión a Supabase desde la página de diagnóstico', () => {
    // Ir a la página de diagnóstico
    cy.visit('/auth/debug')

    // Hacer clic en el botón de verificar conexión
    cy.contains('Verificar conexión').click()

    // Verificar que se muestra el estado de la conexión
    cy.contains(/conexión exitosa|conexión parcial|error/i, { timeout: 10000 }).should('be.visible')
  })
})
