'use client'

import { useState } from 'react'
import { useFastRefreshMonitor } from '@/lib/fast-refresh-monitor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Eye, EyeOff } from 'lucide-react'

export function FastRefreshStatus() {
  const { stats, recentErrors, clearErrors } = useFastRefreshMonitor()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsVisible(true)}
          className="bg-background/80 backdrop-blur-sm"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  const getStatusIcon = () => {
    if (stats.errors > 0) {
      return <XCircle className="h-4 w-4 text-red-500" />
    }
    if (stats.warnings > 0) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  const getStatusColor = () => {
    if (stats.errors > 0) return 'destructive'
    if (stats.warnings > 0) return 'secondary'
    return 'default'
  }

  const getStatusText = () => {
    if (stats.errors > 0) return 'Errores'
    if (stats.warnings > 0) return 'Advertencias'
    return 'Saludable'
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm">
      <Card className="bg-background/95 backdrop-blur-sm border shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              {getStatusIcon()}
              Fast Refresh
            </CardTitle>
            <div className="flex items-center gap-1">
              <Badge variant={getStatusColor()} className="text-xs">
                {getStatusText()}
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 w-6 p-0"
              >
                {isExpanded ? '−' : '+'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6 p-0"
              >
                <EyeOff className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Errores: {stats.errors}</span>
            <span>Advertencias: {stats.warnings}</span>
            <span>Recientes: {stats.recent}</span>
          </div>

          {isExpanded && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearErrors}
                  className="h-7 text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Limpiar
                </Button>
                <span className="text-xs text-muted-foreground">
                  Total: {stats.total}
                </span>
              </div>

              {recentErrors.length > 0 && (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  <div className="text-xs font-medium">Errores Recientes:</div>
                  {recentErrors.slice(-3).map((error, index) => (
                    <div
                      key={index}
                      className="text-xs p-2 rounded bg-muted/50 border-l-2 border-l-red-500"
                    >
                      <div className="flex items-center gap-1 mb-1">
                        {error.type === 'error' ? (
                          <XCircle className="h-3 w-3 text-red-500" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 text-yellow-500" />
                        )}
                        <span className="font-medium capitalize">{error.type}</span>
                        <span className="text-muted-foreground">
                          {new Date(error.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-muted-foreground line-clamp-2">
                        {error.message}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-xs text-muted-foreground pt-2 border-t">
                💡 Tip: Si ves muchos errores, revisa las dependencias de tus hooks
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
