"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { CreditCard } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type Product = {
  id: string
  name: string
  description: string | null
  price: string
  image_url: string | null
  seller_id: string
  stock: number
  profiles: {
    store_name: string | null
    store_logo_url: string | null
  }
}

export default function CheckoutForm({ product, userId }: { product: Product; userId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  })
  const router = useRouter()
  const supabase = createClient()

  const totalPrice = (Number.parseFloat(product.price) * quantity).toFixed(2)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.from("orders").insert({
        buyer_id: userId,
        seller_id: product.seller_id,
        product_id: product.id,
        quantity,
        total_price: Number.parseFloat(totalPrice),
        payment_method: "cash",
        buyer_name: formData.name,
        buyer_email: userId, // Using userId as email identifier
        buyer_phone: formData.phone,
        buyer_address: formData.address,
      })

      if (error) throw error

      router.push("/order-success")
    } catch (error) {
      console.error("Error creating order:", error)
      alert("Failed to place order. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-slate-900">Checkout</h1>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Product Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review your purchase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                {product.image_url && (
                  <img
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    className="h-24 w-24 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-sm text-slate-600 line-clamp-2">{product.description}</p>
                  {product.profiles?.store_name && (
                    <p className="text-sm text-slate-500 mt-1">
                      Sold by: <span className="font-medium">{product.profiles.store_name}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Price per item:</span>
                  <span className="font-semibold">${Number.parseFloat(product.price).toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="quantity">Quantity:</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Number.parseInt(e.target.value))}
                    className="w-20"
                  />
                </div>

                <div className="flex items-center justify-between text-lg font-bold border-t pt-3">
                  <span>Total:</span>
                  <span className="text-orange-600">${totalPrice}</span>
                </div>

                <Badge variant="secondary" className="w-full justify-center py-2">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payment Method: Cash on Delivery
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
              <CardDescription>Where should we deliver your order?</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address</Label>
                  <Textarea
                    id="address"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Main St, Apt 4B, City, State, ZIP"
                    rows={4}
                  />
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
                  <p className="font-semibold text-amber-900 mb-1">Cash on Delivery</p>
                  <p className="text-amber-700">You will pay ${totalPrice} in cash when you receive your order.</p>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full bg-orange-500 hover:bg-orange-600">
                  {isLoading ? "Placing Order..." : "Place Order"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
