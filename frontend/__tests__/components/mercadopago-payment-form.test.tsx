import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MercadoPagoPaymentForm } from '@/components/mercadopago-payment-form'

describe('MercadoPagoPaymentForm Component', () => {
  const mockProps = {
    amount: 1500,
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
    isProcessing: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the payment form correctly', () => {
    render(<MercadoPagoPaymentForm {...mockProps} />)
    
    // Verificar que los campos del formulario están presentes
    expect(screen.getByLabelText(/número de tarjeta/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nombre del titular/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/vencimiento/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/código de seguridad/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/cuotas/i)).toBeInTheDocument()
    
    // Verificar que los botones están presentes
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: new RegExp(`pagar \\$${mockProps.amount.toLocaleString()}`, 'i') })).toBeInTheDocument()
  })

  it('disables the submit button when form is invalid', () => {
    render(<MercadoPagoPaymentForm {...mockProps} />)
    
    // El botón de pago debería estar deshabilitado inicialmente
    const payButton = screen.getByRole('button', { name: new RegExp(`pagar \\$${mockProps.amount.toLocaleString()}`, 'i') })
    expect(payButton).toBeDisabled()
  })

  it('enables the submit button when form is valid', async () => {
    render(<MercadoPagoPaymentForm {...mockProps} />)
    
    // Completar el formulario
    fireEvent.change(screen.getByLabelText(/número de tarjeta/i), { target: { value: '4111 1111 1111 1111' } })
    fireEvent.change(screen.getByLabelText(/nombre del titular/i), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText(/vencimiento/i), { target: { value: '12/25' } })
    fireEvent.change(screen.getByLabelText(/código de seguridad/i), { target: { value: '123' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } })
    
    // Esperar a que el botón se habilite
    await waitFor(() => {
      const payButton = screen.getByRole('button', { name: new RegExp(`pagar \\$${mockProps.amount.toLocaleString()}`, 'i') })
      expect(payButton).not.toBeDisabled()
    })
  })

  it('calls onCancel when cancel button is clicked', () => {
    render(<MercadoPagoPaymentForm {...mockProps} />)
    
    // Hacer clic en el botón de cancelar
    const cancelButton = screen.getByRole('button', { name: /cancelar/i })
    fireEvent.click(cancelButton)
    
    // Verificar que se llama al callback
    expect(mockProps.onCancel).toHaveBeenCalled()
  })

  it('calls onSubmit with payment data when form is submitted', async () => {
    render(<MercadoPagoPaymentForm {...mockProps} />)

    // Completar el formulario
    fireEvent.change(screen.getByLabelText(/número de tarjeta/i), { target: { value: '4111 1111 1111 1111' } })
    fireEvent.change(screen.getByLabelText(/nombre del titular/i), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText(/vencimiento/i), { target: { value: '12/25' } })
    fireEvent.change(screen.getByLabelText(/código de seguridad/i), { target: { value: '123' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } })

    // Esperar a que el botón se habilite
    await waitFor(() => {
      const payButton = screen.getByRole('button', { name: new RegExp(`pagar \\$${mockProps.amount.toLocaleString()}`, 'i') })
      expect(payButton).not.toBeDisabled()
    })

    // Hacer clic en el botón de pago
    const payButton = screen.getByRole('button', { name: new RegExp(`pagar \\$${mockProps.amount.toLocaleString()}`, 'i') })
    fireEvent.click(payButton)

    // Verificar que se llama al callback con los datos correctos (esperar más tiempo para la simulación)
    await waitFor(() => {
      expect(mockProps.onSubmit).toHaveBeenCalledWith(expect.objectContaining({
        method: 'mercadopago',
        email: 'test@example.com',
        installments: 1,
      }))
    }, { timeout: 2000 })
  })

  it('disables form when isProcessing is true', () => {
    render(<MercadoPagoPaymentForm {...mockProps} isProcessing={true} />)
    
    // Verificar que todos los campos están deshabilitados
    expect(screen.getByLabelText(/número de tarjeta/i)).toBeDisabled()
    expect(screen.getByLabelText(/nombre del titular/i)).toBeDisabled()
    expect(screen.getByLabelText(/vencimiento/i)).toBeDisabled()
    expect(screen.getByLabelText(/código de seguridad/i)).toBeDisabled()
    expect(screen.getByLabelText(/email/i)).toBeDisabled()
    
    // Verificar que los botones están deshabilitados
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: new RegExp(`pagar \\$${mockProps.amount.toLocaleString()}`, 'i') })).toBeDisabled()
  })
})
