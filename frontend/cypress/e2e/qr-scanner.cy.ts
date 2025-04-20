describe('QR Scanner', () => {
  it('should navigate to the scanner page', () => {
    cy.visit('/')
    cy.get('a[href="/scan"]').click()
    cy.url().should('include', '/scan')
    cy.contains('Escanear Mesa').should('be.visible')
  })

  it('should show camera access UI', () => {
    cy.visit('/scan')
    cy.contains('Escanear código QR').should('be.visible')
    cy.contains('Escanea el código QR de tu mesa para realizar un pedido').should('be.visible')
    cy.get('button').contains(/iniciar escáner|permitir acceso a la cámara/i).should('be.visible')
  })

  it('should redirect back to home when cancel is clicked', () => {
    cy.visit('/scan')
    cy.get('a[href="/"]').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })

  // Simulación de escaneo (no podemos probar la cámara real en Cypress)
  it('should handle QR code data via URL parameters', () => {
    // Simular que se ha escaneado un código QR de una mesa
    cy.visit('/menu?table=5')
    cy.url().should('include', 'table=5')
    cy.contains(/mesa 5|mesa #5/i, { timeout: 10000 }).should('be.visible')
  })
})
