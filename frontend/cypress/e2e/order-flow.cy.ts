describe('Order Flow', () => {
  beforeEach(() => {
    // Limpiar el localStorage para asegurar que no hay sesión activa
    cy.window().then((win) => {
      win.localStorage.clear()
      win.sessionStorage.clear()
    })

    // Visitar la página de inicio
    cy.visit('/')
  })

  it('should navigate to menu and show products', () => {
    // Navegar al menú
    cy.visit('/menu')

    // Verificar que la página del menú carga
    cy.url().should('include', '/menu')

    // Verificar que hay productos o mensaje de carga
    cy.get('body').should('contain.text', 'Cargando menú')

    // Esperar a que carguen los productos
    cy.get('.food-card', { timeout: 10000 }).should('have.length.at.least', 1)
  })

  it('should show product detail page', () => {
    // Navegar al menú
    cy.visit('/menu')

    // Esperar a que carguen los productos
    cy.get('.food-card', { timeout: 10000 }).first().click()

    // Verificar que estamos en la página de detalle
    cy.url().should('include', '/menu/')

    // Verificar que hay información del producto
    cy.get('h1, h2, h3').should('have.length.at.least', 1)
  })

  it('should handle table parameter in URL', () => {
    // Simular escaneo de QR de mesa
    cy.visit('/menu?table=5')

    // Verificar que la página del menú carga con parámetro de mesa
    cy.url().should('include', '/menu')
    cy.url().should('include', 'table=5')

    // Verificar que la página carga correctamente
    cy.get('body').should('be.visible')

    // Verificar que hay productos o mensaje de carga
    cy.get('body').should('contain.text', 'Cargando menú')
  })

  it('should redirect to login when accessing protected routes', () => {
    // Intentar acceder a una ruta protegida sin autenticación
    cy.visit('/profile')

    // Debería redirigir al login
    cy.url().should('include', '/auth/sign-in')
    cy.contains('Iniciar sesión en Gëstro').should('be.visible')
  })

  it('should show cart page correctly', () => {
    // Ir al carrito sin agregar productos
    cy.visit('/cart')

    // Verificar que se muestra mensaje de carrito vacío
    cy.contains('Tu carrito está vacío').should('be.visible')

    // Verificar que hay un botón para ir al menú
    cy.get('a').contains('Ver Menú').should('be.visible')

    // Hacer clic en el botón para ir al menú
    cy.get('a').contains('Ver Menú').click()

    // Verificar que se redirige al menú
    cy.url().should('include', '/menu')
  })

  it('should navigate between main pages', () => {
    // Verificar navegación desde home
    cy.visit('/')
    cy.get('a[href="/menu"]').first().click()
    cy.url().should('include', '/menu')

    // Verificar navegación al carrito
    cy.get('a[href="/cart"]').first().click()
    cy.url().should('include', '/cart')
    cy.contains('Tu carrito está vacío').should('be.visible')
  })
})
