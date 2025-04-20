# Guía de Pruebas

Esta guía explica cómo ejecutar y escribir pruebas para el proyecto Slainte Bar QR.

## Tipos de Pruebas

El proyecto incluye tres tipos de pruebas:

1. **Pruebas Unitarias**: Prueban componentes y servicios individuales.
2. **Pruebas de Integración**: Prueban la interacción entre diferentes componentes.
3. **Pruebas de Extremo a Extremo (E2E)**: Prueban flujos completos de la aplicación.

## Ejecutar Pruebas

### Todas las Pruebas

Para ejecutar todas las pruebas del proyecto:

```bash
npm test
```

Este comando ejecutará tanto las pruebas unitarias como las pruebas de integración.

### Pruebas Unitarias

Para ejecutar solo las pruebas unitarias:

```bash
npm run test:unit
```

Para ejecutar las pruebas unitarias en modo observador (útil durante el desarrollo):

```bash
cd frontend
npm run test:watch
```

Para generar un informe de cobertura:

```bash
cd frontend
npm run test:coverage
```

### Pruebas de Integración

Para ejecutar las pruebas de integración con la interfaz de Cypress:

```bash
npm run test:e2e
```

Para ejecutar las pruebas de integración en modo headless (sin interfaz gráfica):

```bash
cd frontend
npm run cypress:headless
```

## Estructura de las Pruebas

### Pruebas Unitarias

Las pruebas unitarias se encuentran en el directorio `frontend/__tests__/` y siguen la siguiente estructura:

- `components/`: Pruebas para componentes React.
- `services/`: Pruebas para servicios y utilidades.

Cada archivo de prueba debe seguir la convención de nomenclatura `*.test.tsx` o `*.test.ts`.

### Pruebas de Integración

Las pruebas de integración se encuentran en el directorio `frontend/cypress/e2e/` y cada archivo debe seguir la convención de nomenclatura `*.cy.ts`.

## Escribir Nuevas Pruebas

### Pruebas Unitarias

Para escribir una nueva prueba unitaria:

1. Crea un nuevo archivo en el directorio correspondiente (`components/` o `services/`).
2. Importa las dependencias necesarias:

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { ComponentToTest } from '@/components/component-to-test'
```

3. Escribe tus pruebas usando Jest y Testing Library:

```typescript
describe('ComponentToTest', () => {
  it('renders correctly', () => {
    render(<ComponentToTest />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
  
  it('handles user interaction', () => {
    render(<ComponentToTest />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('Result after click')).toBeInTheDocument()
  })
})
```

### Pruebas de Integración

Para escribir una nueva prueba de integración:

1. Crea un nuevo archivo en el directorio `frontend/cypress/e2e/`.
2. Escribe tus pruebas usando la API de Cypress:

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    cy.visit('/')
  })
  
  it('completes a specific flow', () => {
    cy.get('button').contains('Click Me').click()
    cy.url().should('include', '/expected-path')
    cy.contains('Expected Result').should('be.visible')
  })
})
```

## Comandos Personalizados

El proyecto incluye varios comandos personalizados para Cypress que facilitan las pruebas:

- `cy.login(email, password)`: Inicia sesión con las credenciales proporcionadas.
- `cy.addToCart(productId)`: Agrega un producto al carrito.
- `cy.scanQR(tableNumber)`: Simula el escaneo de un código QR de mesa.

Puedes encontrar estos comandos en `frontend/cypress/support/commands.ts`.

## Mocks y Stubs

### Mocking de Supabase

Para las pruebas unitarias, se recomienda mockear las llamadas a Supabase:

```typescript
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnValue({
      data: { /* mock data */ },
      error: null
    })
  }
}))
```

### Mocking de Autenticación

Para las pruebas que requieren autenticación:

```typescript
jest.mock('@/components/auth-provider', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    signIn: jest.fn(),
    signOut: jest.fn(),
    isLoading: false
  })
}))
```

## Depuración de Pruebas

### Pruebas Unitarias

Para depurar pruebas unitarias:

1. Agrega `console.log()` en tus pruebas o componentes.
2. Ejecuta las pruebas en modo observador: `npm run test:watch`
3. Usa la opción de Jest para ejecutar solo la prueba que estás depurando.

### Pruebas de Integración

Para depurar pruebas de integración:

1. Usa `cy.debug()` para pausar la ejecución en un punto específico.
2. Usa `cy.log('mensaje')` para agregar mensajes al registro de Cypress.
3. Ejecuta las pruebas con la interfaz de Cypress: `npm run test:e2e`
