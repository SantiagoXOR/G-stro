import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Product } from "@/lib/services/products"

export type CartItem = {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  options?: string
  notes?: string
  image?: string
}

type CartStore = {
  items: CartItem[]
  addItem: (product: Product, quantity: number, options?: string, notes?: string) => void
  updateItemQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  clearCart: () => void
  getTotal: () => number
  getItemsCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, quantity, options, notes) => {
        const { items } = get()
        
        // Generar un ID único para el item del carrito
        const id = `${product.id}_${Date.now()}`
        
        // Crear el nuevo item
        const newItem: CartItem = {
          id,
          productId: product.id,
          name: product.name,
          price: Number(product.price),
          quantity,
          options,
          notes,
          image: product.image_url,
        }
        
        set({ items: [...items, newItem] })
      },
      
      updateItemQuantity: (id, quantity) => {
        const { items } = get()
        
        if (quantity < 1) {
          return get().removeItem(id)
        }
        
        const updatedItems = items.map((item) => 
          item.id === id ? { ...item, quantity } : item
        )
        
        set({ items: updatedItems })
      },
      
      removeItem: (id) => {
        const { items } = get()
        const filteredItems = items.filter((item) => item.id !== id)
        set({ items: filteredItems })
      },
      
      clearCart: () => {
        set({ items: [] })
      },
      
      getTotal: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.price * item.quantity, 0)
      },
      
      getItemsCount: () => {
        const { items } = get()
        return items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: "cart-storage", // nombre para localStorage
    }
  )
)
