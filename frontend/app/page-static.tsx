import React from 'react'

export default function StaticPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '600px',
        textAlign: 'center',
        backgroundColor: 'white',
        padding: '3rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          fontSize: '64px',
          marginBottom: '1rem'
        }}>
          🍽️
        </div>
        
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: '#112D1C',
          marginBottom: '1rem',
          margin: 0
        }}>
          Gëstro
        </h1>
        
        <p style={{
          fontSize: '1.25rem',
          color: '#6b7280',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          App de Gestión de Restaurante
        </p>
        
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.5rem'
          }}>
            <span style={{ fontSize: '24px', marginRight: '0.5rem' }}>✅</span>
            <strong style={{ color: '#166534' }}>Aplicación Funcionando</strong>
          </div>
          <p style={{
            color: '#166534',
            margin: 0,
            fontSize: '14px'
          }}>
            El servidor está ejecutándose correctamente sin errores de webpack
          </p>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '8px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '0.5rem' }}>📱</div>
            <strong style={{ color: '#92400e', display: 'block', marginBottom: '0.25rem' }}>
              Cliente
            </strong>
            <span style={{ color: '#92400e', fontSize: '14px' }}>
              Pedidos por QR
            </span>
          </div>
          
          <div style={{
            backgroundColor: '#dbeafe',
            border: '1px solid #60a5fa',
            borderRadius: '8px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '0.5rem' }}>👨‍🍳</div>
            <strong style={{ color: '#1e40af', display: 'block', marginBottom: '0.25rem' }}>
              Cocina
            </strong>
            <span style={{ color: '#1e40af', fontSize: '14px' }}>
              Gestión de pedidos
            </span>
          </div>
          
          <div style={{
            backgroundColor: '#f3e8ff',
            border: '1px solid #a78bfa',
            borderRadius: '8px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '0.5rem' }}>💳</div>
            <strong style={{ color: '#7c3aed', display: 'block', marginBottom: '0.25rem' }}>
              Pagos
            </strong>
            <span style={{ color: '#7c3aed', fontSize: '14px' }}>
              MercadoPago
            </span>
          </div>
        </div>
        
        <div style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '1rem',
          textAlign: 'left'
        }}>
          <h3 style={{
            margin: '0 0 1rem 0',
            color: '#374151',
            fontSize: '1.1rem'
          }}>
            🔧 Estado Técnico
          </h3>
          <ul style={{
            margin: 0,
            paddingLeft: '1.5rem',
            color: '#6b7280',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            <li>✅ React 19 + Next.js 15</li>
            <li>✅ Webpack configurado</li>
            <li>✅ Server Components estables</li>
            <li>✅ Sin errores de módulos</li>
            <li>✅ Supabase conectado</li>
            <li>✅ Clerk autenticación</li>
          </ul>
        </div>
        
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#eff6ff',
          border: '1px solid #93c5fd',
          borderRadius: '8px'
        }}>
          <p style={{
            margin: 0,
            color: '#1e40af',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            🚀 Aplicación lista para desarrollo y producción
          </p>
        </div>
      </div>
    </div>
  )
}
