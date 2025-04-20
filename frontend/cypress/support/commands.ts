/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })

// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })

// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })

// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Comando personalizado para iniciar sesión
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/auth/login')
  cy.get('input[type="email"]').type(email)
  cy.get('input[type="password"]').type(password)
  cy.get('button[type="submit"]').click()
  cy.url().should('not.include', '/auth/login')
})

// Comando para agregar un producto al carrito
Cypress.Commands.add('addToCart', (productId: string) => {
  cy.visit(`/products/${productId}`)
  cy.get('button').contains('Agregar al carrito').click()
  cy.get('[data-testid="cart-count"]').should('be.visible')
})

// Comando para escanear un código QR (simulado)
Cypress.Commands.add('scanQR', (tableNumber: number) => {
  cy.visit(`/menu?table=${tableNumber}`)
  cy.url().should('include', `table=${tableNumber}`)
})

// Declaración de tipos para los comandos personalizados
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      addToCart(productId: string): Chainable<void>
      scanQR(tableNumber: number): Chainable<void>
    }
  }
}
