import Image from "next/image"

export default function TestImages() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Test de Imágenes</h1>
      
      <div className="space-y-4">
        <h2 className="text-xl">Imagen Hero (Slainte.png)</h2>
        <div className="relative w-96 h-48 border">
          <Image
            src="/resources/Slainte.png"
            alt="Test Slainte"
            fill
            className="object-cover"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl">Placeholder SVG</h2>
        <div className="relative w-96 h-48 border">
          <Image
            src="/placeholder.svg"
            alt="Test Placeholder"
            fill
            className="object-cover"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl">Placeholder User JPG</h2>
        <div className="relative w-96 h-48 border">
          <Image
            src="/placeholder-user.jpg"
            alt="Test User"
            fill
            className="object-cover"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl">Logo SVG</h2>
        <div className="relative w-96 h-48 border">
          <Image
            src="/logo-complete.svg"
            alt="Test Logo"
            fill
            className="object-contain"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl">Acceso directo a imágenes</h2>
        <div className="space-y-2">
          <p><a href="/placeholder.svg" target="_blank" className="text-blue-600 underline">Ver placeholder.svg</a></p>
          <p><a href="/resources/Slainte.png" target="_blank" className="text-blue-600 underline">Ver Slainte.png</a></p>
          <p><a href="/placeholder-user.jpg" target="_blank" className="text-blue-600 underline">Ver placeholder-user.jpg</a></p>
          <p><a href="/logo-complete.svg" target="_blank" className="text-blue-600 underline">Ver logo-complete.svg</a></p>
        </div>
      </div>
    </div>
  )
}
