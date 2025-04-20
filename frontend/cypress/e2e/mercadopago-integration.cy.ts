describe('MercadoPago Integration', () => {
  // Esta prueba verifica que la configuración de MercadoPago esté correcta
  it('should load MercadoPago configuration', () => {
    cy.request('/api/payments/test')
      .then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('success')
        
        // Si la configuración es correcta, success debería ser true
        if (response.body.success) {
          expect(response.body.config).to.deep.equal({
            accessToken: 'Configurado',
            publicKey: 'Configurado'
          })
        } else {
          // Si falta configuración, mostrar qué falta
          cy.log('Falta configuración de MercadoPago:', response.body.config)
        }
      })
  })

  // Esta prueba requiere un usuario autenticado y configuración de MercadoPago
  it.skip('should show MercadoPago payment form during checkout', () => {
    // Iniciar sesión
    cy.login('test@example.com', 'password123')
    
    // Agregar un producto al carrito
    cy.visit('/menu')
    cy.get('[data-testid="product-card"]').first().click()
    cy.get('button').contains('Agregar al carrito').click()
    
    // Ir al carrito
    cy.visit('/cart')
    
    // Hacer checkout
    cy.get('button').contains('Procesar Pedido').click()
    
    // Seleccionar MercadoPago como método de pago
    cy.get('[data-testid="payment-method-mercadopago"]').click()
    
    // Verificar que se muestra el formulario de pago
    cy.contains('Procesar Pago').should('be.visible')
    cy.get('input[id="cardNumber"]').should('be.visible')
    cy.get('input[id="cardholderName"]').should('be.visible')
    cy.get('input[id="expirationDate"]').should('be.visible')
    cy.get('input[id="securityCode"]').should('be.visible')
    cy.get('input[id="email"]').should('be.visible')
  })

  // Esta prueba simula el proceso de pago completo
  it.skip('should process payment with MercadoPago', () => {
    // Iniciar sesión
    cy.login('test@example.com', 'password123')
    
    // Agregar un producto al carrito
    cy.visit('/menu')
    cy.get('[data-testid="product-card"]').first().click()
    cy.get('button').contains('Agregar al carrito').click()
    
    // Ir al carrito
    cy.visit('/cart')
    
    // Hacer checkout
    cy.get('button').contains('Procesar Pedido').click()
    
    // Seleccionar MercadoPago como método de pago
    cy.get('[data-testid="payment-method-mercadopago"]').click()
    
    // Completar el formulario de pago
    cy.get('input[id="cardNumber"]').type('4111 1111 1111 1111')
    cy.get('input[id="cardholderName"]').type('Test User')
    cy.get('input[id="expirationDate"]').type('12/25')
    cy.get('input[id="securityCode"]').type('123')
    cy.get('input[id="email"]').type('test@example.com')
    
    // Seleccionar cuotas
    cy.get('button[id="installments"]').click()
    cy.get('[data-value="1"]').click()
    
    // Procesar pago
    cy.contains('Pagar').click()
    
    // Verificar redirección a página de confirmación
    cy.url().should('include', '/orders/confirmation', { timeout: 10000 })
    cy.contains('Pedido Confirmado').should('be.visible')
  })
})
