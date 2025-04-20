describe('Order Flow', () => {
  // Esta prueba requiere un usuario autenticado
  // Usamos el comando personalizado login definido en commands.ts
  
  beforeEach(() => {
    // Limpiar el localStorage para asegurar que no hay sesión activa
    cy.window().then((win) => {
      win.localStorage.clear()
    })
    
    // Visitar la página de inicio
    cy.visit('/')
  })

  it('completes the full order flow from menu to confirmation', () => {
    // Iniciar sesión (esto es un ejemplo, ajustar según la implementación real)
    // Si el comando login no funciona, puedes usar el flujo manual de login
    cy.visit('/auth/login')
    cy.get('input[type="email"]').type('test@example.com')
    cy.get('input[type="password"]').type('password123')
    cy.get('button[type="submit"]').click()
    
    // Verificar que el login fue exitoso
    cy.url().should('not.include', '/auth/login', { timeout: 10000 })
    
    // Navegar al menú
    cy.visit('/menu')
    
    // Seleccionar una categoría (si existe)
    cy.get('[data-testid="category-filter"]').first().click({ force: true })
    
    // Seleccionar un producto
    cy.get('[data-testid="product-card"]').first().click()
    
    // En la página de detalle, agregar al carrito
    cy.get('button').contains('Agregar al carrito').click()
    
    // Verificar que se muestra notificación de éxito
    cy.contains('Producto agregado al carrito').should('be.visible')
    
    // Ir al carrito
    cy.get('a[href="/cart"]').click()
    
    // Verificar que el producto está en el carrito
    cy.get('[data-testid="cart-item"]').should('have.length.at.least', 1)
    
    // Proceder al checkout
    cy.get('button').contains('Procesar Pedido').click()
    
    // Seleccionar método de pago (efectivo para simplificar)
    cy.get('[data-testid="payment-method-cash"]').click()
    
    // Confirmar pedido
    cy.get('button').contains('Confirmar Pedido').click()
    
    // Verificar redirección a página de confirmación
    cy.url().should('include', '/orders/confirmation')
    cy.contains('Pedido Confirmado').should('be.visible')
    
    // Verificar que se muestra el número de pedido
    cy.get('[data-testid="order-number"]').should('be.visible')
    
    // Verificar que hay un botón para ver detalles del pedido
    cy.get('a').contains('Ver Detalles').should('be.visible')
  })

  it('handles table scanning and ordering from a table', () => {
    // Simular escaneo de QR de mesa
    cy.visit('/menu?table=5')
    
    // Verificar que se muestra la mesa
    cy.contains(/mesa 5|mesa #5/i).should('be.visible')
    
    // Seleccionar un producto
    cy.get('[data-testid="product-card"]').first().click()
    
    // En la página de detalle, agregar al carrito
    cy.get('button').contains('Agregar al carrito').click()
    
    // Ir al carrito
    cy.get('a[href="/cart"]').click()
    
    // Verificar que el producto está en el carrito
    cy.get('[data-testid="cart-item"]').should('have.length.at.least', 1)
    
    // Verificar que se muestra la información de la mesa
    cy.contains(/mesa 5|mesa #5/i).should('be.visible')
    
    // Iniciar sesión para completar el pedido
    cy.get('button').contains('Procesar Pedido').click()
    
    // Debería redirigir al login si no está autenticado
    cy.url().should('include', '/auth/login')
    
    // Completar login
    cy.get('input[type="email"]').type('test@example.com')
    cy.get('input[type="password"]').type('password123')
    cy.get('button[type="submit"]').click()
    
    // Debería volver al carrito
    cy.url().should('include', '/cart')
    
    // Proceder al checkout
    cy.get('button').contains('Procesar Pedido').click()
    
    // Seleccionar método de pago
    cy.get('[data-testid="payment-method-cash"]').click()
    
    // Confirmar pedido
    cy.get('button').contains('Confirmar Pedido').click()
    
    // Verificar redirección a página de confirmación
    cy.url().should('include', '/orders/confirmation')
    cy.contains('Pedido Confirmado').should('be.visible')
  })

  it('allows viewing order history and details', () => {
    // Iniciar sesión
    cy.visit('/auth/login')
    cy.get('input[type="email"]').type('test@example.com')
    cy.get('input[type="password"]').type('password123')
    cy.get('button[type="submit"]').click()
    
    // Ir a la página de pedidos
    cy.visit('/orders')
    
    // Verificar que se muestra la lista de pedidos
    cy.contains('Mis Pedidos').should('be.visible')
    
    // Si hay pedidos, hacer clic en el primero para ver detalles
    cy.get('[data-testid="order-item"]').first().click()
    
    // Verificar que se muestra la página de detalles del pedido
    cy.url().should('include', '/orders/')
    cy.contains('Detalles del Pedido').should('be.visible')
    
    // Verificar que se muestran los productos del pedido
    cy.get('[data-testid="order-item"]').should('have.length.at.least', 1)
    
    // Verificar que se muestra el estado del pedido
    cy.get('[data-testid="order-status"]').should('be.visible')
  })

  it('handles empty cart state', () => {
    // Ir al carrito sin agregar productos
    cy.visit('/cart')
    
    // Verificar que se muestra mensaje de carrito vacío
    cy.contains('Tu carrito está vacío').should('be.visible')
    
    // Verificar que hay un botón para ir al menú
    cy.get('a').contains('Agregar productos').should('be.visible')
    
    // Hacer clic en el botón para ir al menú
    cy.get('a').contains('Agregar productos').click()
    
    // Verificar que se redirige al menú
    cy.url().should('include', '/menu')
  })
})
