describe('Cart and Checkout Flow', () => {
  beforeEach(() => {
    // Visitar la página de inicio antes de cada prueba
    cy.visit('/')

    // Limpiar el carrito y sesión
    cy.window().then((win) => {
      win.localStorage.removeItem('cart-store')
      win.localStorage.clear()
      win.sessionStorage.clear()
    })
  })

  it('should navigate to the cart page', () => {
    cy.get('a[href="/cart"]').click()
    cy.url().should('include', '/cart')
    cy.contains('Tu carrito está vacío').should('be.visible')
  })

  it('should show empty cart message when cart is empty', () => {
    cy.visit('/cart')
    cy.contains('Tu carrito está vacío').should('be.visible')
    cy.contains('Ver Menú').should('be.visible')
  })

  it('should navigate to product detail page', () => {
    // Navegar al menú
    cy.visit('/menu')

    // Esperar a que carguen los productos
    cy.get('.food-card', { timeout: 10000 }).should('have.length.at.least', 1)

    // Hacer clic en el primer producto
    cy.get('.food-card').first().click()

    // Verificar que estamos en la página de detalle
    cy.url().should('include', '/menu/')

    // Verificar que hay un botón de acción (puede ser "Agregar al Carrito" o estar deshabilitado)
    cy.get('button').should('have.length.at.least', 1)
  })

  it('should show product details correctly', () => {
    // Navegar al menú
    cy.visit('/menu')
    cy.get('.food-card', { timeout: 10000 }).first().click()

    // Verificar que la página de detalle carga
    cy.url().should('include', '/menu/')

    // Verificar que hay información del producto
    cy.get('h1, h2, h3').should('have.length.at.least', 1)

    // Verificar que hay controles de cantidad o botones
    cy.get('button').should('have.length.at.least', 1)
  })

  it('should show menu categories correctly', () => {
    // Navegar al menú
    cy.visit('/menu')

    // Verificar que hay categorías o botones de filtro
    cy.get('button').should('have.length.at.least', 1)

    // Verificar que la página carga correctamente
    cy.get('body').should('contain.text', 'Menú')
  })

  it('should show cart page correctly', () => {
    // Ir directamente al carrito
    cy.visit('/cart')

    // Verificar que la página del carrito carga
    cy.url().should('include', '/cart')

    // Verificar que muestra el mensaje de carrito vacío
    cy.contains('Tu carrito está vacío').should('be.visible')

    // Verificar que hay un enlace para ver el menú
    cy.contains('Ver Menú').should('be.visible')
  })

  it('should show menu page correctly', () => {
    // Verificar que la página de menú carga correctamente
    cy.visit('/menu')

    // Verificar que hay productos o mensaje de carga
    cy.get('body').should('contain.text', 'Cargando menú')

    // Esperar a que carguen los productos
    cy.get('.food-card', { timeout: 10000 }).should('have.length.at.least', 1)
  })

  it('should navigate between pages correctly', () => {
    // Verificar navegación desde home a menú
    cy.visit('/')
    cy.get('a[href="/menu"]').first().click()
    cy.url().should('include', '/menu')

    // Verificar navegación a carrito
    cy.get('a[href="/cart"]').first().click()
    cy.url().should('include', '/cart')
    cy.contains('Tu carrito está vacío').should('be.visible')
  })
})
