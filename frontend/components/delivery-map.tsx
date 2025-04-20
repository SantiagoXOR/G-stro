"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { DriverLocation, subscribeToDriverLocation } from "@/lib/services/delivery-tracking"

// Configurar token de Mapbox
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""

interface DeliveryMapProps {
  orderId: string
  initialLocation?: DriverLocation | null
  restaurantLocation?: { lat: number; lng: number; name: string }
  deliveryLocation?: { lat: number; lng: number; name: string }
  className?: string
}

export default function DeliveryMap({
  orderId,
  initialLocation,
  restaurantLocation = { lat: -34.603722, lng: -58.381592, name: "Slainte Bar" }, // Default: Buenos Aires
  deliveryLocation,
  className = "h-64 w-full rounded-lg overflow-hidden"
}: DeliveryMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const driverMarker = useRef<mapboxgl.Marker | null>(null)
  const restaurantMarker = useRef<mapboxgl.Marker | null>(null)
  const deliveryMarker = useRef<mapboxgl.Marker | null>(null)
  const routeLine = useRef<mapboxgl.GeoJSONSource | null>(null)

  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(initialLocation || null)

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    // Crear mapa
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [restaurantLocation.lng, restaurantLocation.lat],
      zoom: 13
    })

    // Añadir controles
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right")

    // Añadir marcador del restaurante
    restaurantMarker.current = new mapboxgl.Marker({ color: "#F97316" })
      .setLngLat([restaurantLocation.lng, restaurantLocation.lat])
      .setPopup(new mapboxgl.Popup().setHTML(`<h3>${restaurantLocation.name}</h3>`))
      .addTo(map.current)

    // Añadir marcador de entrega si existe
    if (deliveryLocation) {
      deliveryMarker.current = new mapboxgl.Marker({ color: "#3B82F6" })
        .setLngLat([deliveryLocation.lng, deliveryLocation.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<h3>${deliveryLocation.name}</h3>`))
        .addTo(map.current)
    }

    // Añadir marcador del repartidor si hay ubicación inicial
    if (initialLocation) {
      driverMarker.current = new mapboxgl.Marker({ color: "#10B981" })
        .setLngLat([initialLocation.longitude, initialLocation.latitude])
        .addTo(map.current)
    }

    // Añadir capa para la ruta
    map.current.on("load", () => {
      if (!map.current) return

      map.current.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: []
          }
        }
      })

      map.current.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round"
        },
        paint: {
          "line-color": "#10B981",
          "line-width": 4,
          "line-opacity": 0.7
        }
      })

      routeLine.current = map.current.getSource("route") as mapboxgl.GeoJSONSource
    })

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [restaurantLocation, deliveryLocation, initialLocation])

  // Suscribirse a actualizaciones de ubicación
  useEffect(() => {
    if (!map.current || !orderId) return

    const { unsubscribe } = subscribeToDriverLocation(orderId, (location) => {
      setDriverLocation(location)
    })

    return () => {
      unsubscribe()
    }
  }, [orderId])

  // Actualizar marcador del repartidor cuando cambia la ubicación
  useEffect(() => {
    if (!map.current || !driverLocation) return

    const newCoords = [driverLocation.longitude, driverLocation.latitude]

    // Crear o actualizar marcador del repartidor
    if (!driverMarker.current) {
      driverMarker.current = new mapboxgl.Marker({ color: "#10B981" })
        .setLngLat(newCoords)
        .addTo(map.current)
    } else {
      driverMarker.current.setLngLat(newCoords)
    }

    // Centrar mapa en el repartidor
    map.current.easeTo({
      center: newCoords,
      zoom: 15
    })

    // Actualizar línea de ruta
    if (routeLine.current) {
      // Obtener coordenadas actuales
      const source = map.current.getSource("route") as mapboxgl.GeoJSONSource
      const data = source._data as any
      
      // Añadir nueva coordenada a la ruta
      if (data.geometry && data.geometry.coordinates) {
        const coordinates = [...data.geometry.coordinates, newCoords]
        
        // Actualizar ruta
        routeLine.current.setData({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates
          }
        })
      }
    }
  }, [driverLocation])

  return <div ref={mapContainer} className={className} />
}
