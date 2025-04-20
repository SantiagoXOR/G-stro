"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { ChevronLeft, Download, Printer, QrCode, RefreshCw, Share2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import QRCode from "qrcode.react"
import { getAllTables, Table } from "@/lib/services/tables"

export default function TableQRCodesPage() {
  const router = useRouter()
  const [tables, setTables] = useState<Table[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [qrSize, setQrSize] = useState(200)
  const [qrColor, setQrColor] = useState("#000000")
  const [qrBgColor, setQrBgColor] = useState("#FFFFFF")
  const [includeLogo, setIncludeLogo] = useState(true)
  const [includeTableNumber, setIncludeTableNumber] = useState(true)
  const [baseUrl, setBaseUrl] = useState(process.env.NEXT_PUBLIC_BASE_URL || "")
  const qrRef = useRef<HTMLDivElement>(null)

  // Cargar mesas
  useEffect(() => {
    const fetchTables = async () => {
      try {
        setIsLoading(true)
        const data = await getAllTables()
        setTables(data)
        
        // Seleccionar la primera mesa por defecto
        if (data.length > 0) {
          setSelectedTable(data[0].id)
        }
      } catch (error) {
        console.error("Error al cargar mesas:", error)
        toast.error("Error al cargar mesas")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTables()
  }, [])

  // Generar URL para el código QR
  const getQrUrl = () => {
    if (!selectedTable) return ""
    
    const table = tables.find(t => t.id === selectedTable)
    if (!table) return ""
    
    return `${baseUrl}/menu?table=${table.table_number}`
  }

  // Descargar código QR como imagen
  const downloadQrCode = () => {
    if (!qrRef.current) return
    
    const canvas = qrRef.current.querySelector("canvas")
    if (!canvas) return
    
    const url = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.href = url
    
    const table = tables.find(t => t.id === selectedTable)
    link.download = `qr-mesa-${table?.table_number || "desconocida"}.png`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success("Código QR descargado correctamente")
  }

  // Imprimir código QR
  const printQrCode = () => {
    if (!qrRef.current) return
    
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      toast.error("No se pudo abrir la ventana de impresión")
      return
    }
    
    const table = tables.find(t => t.id === selectedTable)
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Código QR Mesa ${table?.table_number || ""}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 20px;
            }
            .qr-container {
              margin: 0 auto;
              max-width: 300px;
            }
            .table-number {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .instructions {
              margin-top: 20px;
              font-size: 14px;
              color: #666;
            }
            @media print {
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            ${includeTableNumber ? `<div class="table-number">Mesa ${table?.table_number || ""}</div>` : ""}
            ${qrRef.current.innerHTML}
            <div class="instructions">
              Escanea este código QR para ver nuestro menú y realizar tu pedido
            </div>
          </div>
          <div class="no-print" style="margin-top: 30px;">
            <button onclick="window.print()">Imprimir</button>
            <button onclick="window.close()">Cerrar</button>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            }
          </script>
        </body>
      </html>
    `)
    
    printWindow.document.close()
  }

  // Compartir código QR
  const shareQrCode = async () => {
    if (!navigator.share) {
      toast.error("Tu navegador no soporta la función de compartir")
      return
    }
    
    try {
      const table = tables.find(t => t.id === selectedTable)
      const url = getQrUrl()
      
      await navigator.share({
        title: `Código QR Mesa ${table?.table_number || ""}`,
        text: "Escanea este código QR para ver nuestro menú y realizar tu pedido",
        url
      })
      
      toast.success("Código QR compartido correctamente")
    } catch (error) {
      console.error("Error al compartir:", error)
      toast.error("Error al compartir el código QR")
    }
  }

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/admin/tables">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Códigos QR para Mesas</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="table-select">Seleccionar Mesa</Label>
                <Select
                  value={selectedTable || ""}
                  onValueChange={setSelectedTable}
                  disabled={isLoading || tables.length === 0}
                >
                  <SelectTrigger id="table-select">
                    <SelectValue placeholder="Seleccionar mesa" />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map((table) => (
                      <SelectItem key={table.id} value={table.id}>
                        Mesa {table.table_number} ({table.capacity} personas)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="base-url">URL Base</Label>
                <Input
                  id="base-url"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://tu-dominio.com"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  URL completa: {getQrUrl()}
                </p>
              </div>

              <Tabs defaultValue="appearance">
                <TabsList className="w-full">
                  <TabsTrigger value="appearance" className="flex-1">Apariencia</TabsTrigger>
                  <TabsTrigger value="options" className="flex-1">Opciones</TabsTrigger>
                </TabsList>
                <TabsContent value="appearance" className="space-y-4 pt-4">
                  <div>
                    <Label>Tamaño</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[qrSize]}
                        min={100}
                        max={400}
                        step={10}
                        onValueChange={(value) => setQrSize(value[0])}
                        className="flex-1"
                      />
                      <span className="w-12 text-right">{qrSize}px</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="qr-color">Color del QR</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="qr-color"
                          type="text"
                          value={qrColor}
                          onChange={(e) => setQrColor(e.target.value)}
                          className="pl-10"
                        />
                        <div
                          className="absolute left-2 top-2 h-6 w-6 rounded-full border"
                          style={{ backgroundColor: qrColor }}
                        ></div>
                      </div>
                      <Input
                        type="color"
                        value={qrColor}
                        onChange={(e) => setQrColor(e.target.value)}
                        className="w-12 p-1 h-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="qr-bg-color">Color de fondo</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="qr-bg-color"
                          type="text"
                          value={qrBgColor}
                          onChange={(e) => setQrBgColor(e.target.value)}
                          className="pl-10"
                        />
                        <div
                          className="absolute left-2 top-2 h-6 w-6 rounded-full border"
                          style={{ backgroundColor: qrBgColor }}
                        ></div>
                      </div>
                      <Input
                        type="color"
                        value={qrBgColor}
                        onChange={(e) => setQrBgColor(e.target.value)}
                        className="w-12 p-1 h-10"
                      />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="options" className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="include-logo" className="cursor-pointer">
                      Incluir logo
                    </Label>
                    <Switch
                      id="include-logo"
                      checked={includeLogo}
                      onCheckedChange={setIncludeLogo}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="include-table-number" className="cursor-pointer">
                      Mostrar número de mesa
                    </Label>
                    <Switch
                      id="include-table-number"
                      checked={includeTableNumber}
                      onCheckedChange={setIncludeTableNumber}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center min-h-[400px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">Cargando mesas...</p>
              </div>
            ) : !selectedTable ? (
              <div className="flex flex-col items-center justify-center text-center">
                <QrCode className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Selecciona una mesa</h3>
                <p className="text-muted-foreground">
                  Selecciona una mesa para generar su código QR
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {includeTableNumber && (
                  <h3 className="text-xl font-bold mb-4">
                    Mesa {tables.find(t => t.id === selectedTable)?.table_number || ""}
                  </h3>
                )}
                <div ref={qrRef} className="bg-white p-4 rounded-lg">
                  <QRCode
                    value={getQrUrl()}
                    size={qrSize}
                    fgColor={qrColor}
                    bgColor={qrBgColor}
                    level="H"
                    imageSettings={
                      includeLogo
                        ? {
                            src: "/logo.png",
                            excavate: true,
                            width: qrSize * 0.2,
                            height: qrSize * 0.2,
                          }
                        : undefined
                    }
                  />
                </div>
                <div className="flex gap-2 mt-6">
                  <Button variant="outline" size="sm" onClick={downloadQrCode}>
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                  <Button variant="outline" size="sm" onClick={printQrCode}>
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir
                  </Button>
                  <Button variant="outline" size="sm" onClick={shareQrCode}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartir
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.push("/admin/tables")}>
          Volver a Mesas
        </Button>
        <Button onClick={() => {
          setIsLoading(true)
          getAllTables().then(data => {
            setTables(data)
            setIsLoading(false)
          })
        }}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar Mesas
        </Button>
      </div>
    </div>
  )
}
