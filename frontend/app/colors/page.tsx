import ColorPalette from "@/components/color-palette"
import Logo from "@/components/logo"

export default function ColorsPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col items-center justify-center space-y-6 mb-8">
        <h1 className="text-3xl font-bold">Esquema de Colores Gëstro</h1>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="p-6 bg-background border border-border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Logo (Modo Claro)</h2>
            <div className="flex flex-col items-center gap-4">
              <Logo size="lg" useCompleteVersion={true} />
              <Logo size="md" />
            </div>
          </div>
          <div className="p-6 bg-primary border border-border rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-primary-foreground">Logo (Modo Oscuro)</h2>
            <div className="flex flex-col items-center gap-4">
              <Logo size="lg" useCompleteVersion={true} />
              <Logo size="md" />
            </div>
          </div>
        </div>
      </div>
      
      <ColorPalette />
    </div>
  )
}
