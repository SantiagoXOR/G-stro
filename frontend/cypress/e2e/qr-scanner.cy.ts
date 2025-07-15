describe('QR Scanner', () => {
  beforeEach(() => {
    // Limpiar sesión antes de cada test
    cy.window().then((win) => {
      win.localStorage.clear()
      win.sessionStorage.clear()
    })
  })

  it('should show QR scanner button on homepage', () => {
    cy.visit('/')

    // Verificar que hay un botón para escanear mesa
    cy.contains('Escanear Mesa').should('be.visible')

    // Verificar que la página principal carga correctamente
    cy.get('h1').contains('Gëstro').should('be.visible')
  })

  it('should handle QR scanner functionality', () => {
    cy.visit('/')

    // Buscar elementos relacionados con QR scanner
    cy.get('body').should('contain.text', 'Escanear Mesa')

    // Verificar que hay navegación disponible
    cy.get('nav').should('be.visible')
  })

  it('should navigate to menu from homepage', () => {
    cy.visit('/')

    // Hacer clic en el botón de ordenar ahora
    cy.contains('Ordenar Ahora').click()

    // Verificar que navega al menú
    cy.url().should('include', '/menu')
  })

  // Simulación de escaneo (no podemos probar la cámara real en Cypress)
  it('should handle QR code data via URL parameters', () => {
    // Simular que se ha escaneado un código QR de una mesa
    cy.visit('/menu?table=5')
    cy.url().should('include', 'table=5')

    // Verificar que la página del menú carga
    cy.url().should('include', '/menu')
    cy.get('body').should('contain.text', 'Cargando menú')
  })
})
