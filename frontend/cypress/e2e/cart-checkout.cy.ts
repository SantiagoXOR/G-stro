describe('Cart and Checkout Flow', () => {
  beforeEach(() => {
    // Visitar la página de inicio antes de cada prueba
    cy.visit('/')
    
    // Limpiar el carrito (esto depende de cómo esté implementado en la aplicación)
    // Una forma es borrar el localStorage
    cy.window().then((win) => {
      win.localStorage.removeItem('cart-store')
    })
  })

  it('should navigate to the cart page', () => {
    cy.get('a[href="/cart"]').click()
    cy.url().should('include', '/cart')
    cy.contains('Tu Carrito').should('be.visible')
  })

  it('should show empty cart message when cart is empty', () => {
    cy.visit('/cart')
    cy.contains('Tu carrito está vacío').should('be.visible')
    cy.contains('Agregar productos').should('be.visible')
  })

  it('should add a product to the cart from the menu', () => {
    // Navegar al menú
    cy.visit('/menu')
    
    // Hacer clic en el primer producto
    cy.get('[data-testid="product-card"]').first().click()
    
    // En la página de detalle, agregar al carrito
    cy.get('button').contains('Agregar al carrito').click()
    
    // Verificar que se muestra notificación de éxito
    cy.contains('Producto agregado al carrito').should('be.visible')
    
    // Ir al carrito
    cy.get('a[href="/cart"]').click()
    
    // Verificar que el producto está en el carrito
    cy.get('[data-testid="cart-item"]').should('have.length.at.least', 1)
  })

  it('should update product quantity in cart', () => {
    // Primero agregar un producto al carrito
    cy.visit('/menu')
    cy.get('[data-testid="product-card"]').first().click()
    cy.get('button').contains('Agregar al carrito').click()
    
    // Ir al carrito
    cy.visit('/cart')
    
    // Aumentar la cantidad
    cy.get('button[aria-label="Aumentar cantidad"]').first().click()
    
    // Verificar que la cantidad se actualizó
    cy.get('[data-testid="item-quantity"]').first().should('contain', '2')
    
    // Disminuir la cantidad
    cy.get('button[aria-label="Disminuir cantidad"]').first().click()
    
    // Verificar que la cantidad se actualizó
    cy.get('[data-testid="item-quantity"]').first().should('contain', '1')
  })

  it('should remove a product from cart', () => {
    // Primero agregar un producto al carrito
    cy.visit('/menu')
    cy.get('[data-testid="product-card"]').first().click()
    cy.get('button').contains('Agregar al carrito').click()
    
    // Ir al carrito
    cy.visit('/cart')
    
    // Eliminar el producto
    cy.get('button[aria-label="Eliminar"]').first().click()
    
    // Verificar que el carrito está vacío
    cy.contains('Tu carrito está vacío').should('be.visible')
  })

  it('should redirect to login when trying to checkout without being logged in', () => {
    // Primero agregar un producto al carrito
    cy.visit('/menu')
    cy.get('[data-testid="product-card"]').first().click()
    cy.get('button').contains('Agregar al carrito').click()
    
    // Ir al carrito
    cy.visit('/cart')
    
    // Intentar hacer checkout
    cy.get('button').contains('Procesar Pedido').click()
    
    // Debería mostrar un mensaje o redirigir al login
    cy.url().should('include', '/auth/login')
  })

  // Esta prueba requiere un usuario autenticado
  it.skip('should complete checkout process when logged in', () => {
    // Iniciar sesión (usando el comando personalizado)
    cy.login('test@example.com', 'password123')
    
    // Agregar un producto al carrito
    cy.visit('/menu')
    cy.get('[data-testid="product-card"]').first().click()
    cy.get('button').contains('Agregar al carrito').click()
    
    // Ir al carrito
    cy.visit('/cart')
    
    // Hacer checkout
    cy.get('button').contains('Procesar Pedido').click()
    
    // Seleccionar método de pago (efectivo para simplificar)
    cy.get('[data-testid="payment-method-cash"]').click()
    
    // Confirmar pedido
    cy.get('button').contains('Confirmar Pedido').click()
    
    // Verificar redirección a página de confirmación
    cy.url().should('include', '/orders/confirmation')
    cy.contains('Pedido Confirmado').should('be.visible')
  })
})
