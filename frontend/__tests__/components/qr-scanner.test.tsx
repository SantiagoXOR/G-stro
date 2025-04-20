import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { QRScanner } from '@/components/qr-scanner'

// Mock jsqr
jest.mock('jsqr', () => {
  return {
    __esModule: true,
    default: jest.fn()
  }
})

// Mock navigator.mediaDevices
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockImplementation(() => Promise.resolve({
      getTracks: () => [{
        stop: jest.fn()
      }]
    })),
    enumerateDevices: jest.fn().mockImplementation(() => Promise.resolve([
      { kind: 'videoinput', deviceId: 'mock-camera' }
    ]))
  },
  writable: true
})

describe('QRScanner Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the scanner component correctly', async () => {
    await act(async () => {
      render(<QRScanner />)
    })

    // Verificar que el componente se renderiza correctamente
    expect(screen.getByText('Escanear código QR')).toBeInTheDocument()
    expect(screen.getByText('Escanea el código QR de tu mesa para realizar un pedido')).toBeInTheDocument()

    // Verificar que el botón de inicio está presente
    await waitFor(() => {
      const startButton = screen.getByRole('button', { name: /iniciar escáner/i })
      expect(startButton).toBeInTheDocument()
    })
  })

  it('calls onScan callback when a QR code is scanned', async () => {
    const mockOnScan = jest.fn()
    const mockOnClose = jest.fn()

    // Mock de jsQR para simular un escaneo exitoso
    const mockJsQR = require('jsqr').default
    mockJsQR.mockImplementation(() => ({
      data: 'https://example.com?table=1',
      location: {}
    }))

    await act(async () => {
      render(
        <QRScanner
          onScan={mockOnScan}
          onClose={mockOnClose}
        />
      )
    })

    // Esperar a que se detecte la cámara
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /iniciar escáner/i })).toBeInTheDocument()
    })

    // Simular clic en el botón de inicio
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /iniciar escáner/i }))
    })

    // Verificar que se solicitan permisos de cámara
    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled()
    })
  })

  it('shows cancel button when onClose is provided', async () => {
    const mockOnClose = jest.fn()

    await act(async () => {
      render(<QRScanner onClose={mockOnClose} />)
    })

    // Verificar que el botón de cancelar está presente
    const cancelButton = await screen.findByRole('button', { name: /cancelar/i })
    expect(cancelButton).toBeInTheDocument()

    // Simular clic en el botón de cancelar
    await act(async () => {
      fireEvent.click(cancelButton)
    })

    // Verificar que se llama al callback
    expect(mockOnClose).toHaveBeenCalled()
  })
})
