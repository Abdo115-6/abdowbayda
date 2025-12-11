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
import { CreditCard, AlertCircle, Package, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

type Product = {
  id: string
  name: string
  description: string | null
  price: string
  image_url: string | null
  seller_id: string
  stock: number
  profiles?: {
    store_name: string | null
    store_logo_url: string | null
  } | null
}

export default function CheckoutForm({ product, userId }: { product: Product; userId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  })
  const router = useRouter()
  const supabase = createClient()

  // Log component initialization for debugging
  console.log("[CHECKOUT-FORM] Initialized with product:", product?.name, "userId:", userId)

  const totalPrice = (Number.parseFloat(product.price) * quantity).toFixed(2)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (quantity > product.stock) {
        setError(`Only ${product.stock} items available in stock`)
        setIsLoading(false)
        return
      }

      if (quantity < 1) {
        setError("Quantity must be at least 1")
        setIsLoading(false)
        return
      }

      if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
        setError("Please fill in all required fields")
        setIsLoading(false)
        return
      }

      // Get the current user's email and verify authentication
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      console.log("[DEBUG] User auth check:", { user: user?.id, error: userError })
      
      if (!user) {
        setError("Authentication required. Please log in and try again.")
        setIsLoading(false)
        return
      }
      
      const userEmail = user?.email || `user-${userId}@placeholder.com`

      console.log("[DEBUG] Creating order with data:", {
        seller_id: product.seller_id,
        product_id: product.id,
        buyer_id: userId,
        buyer_email: userEmail,
        quantity,
        total_price: Number.parseFloat(totalPrice),
        payment_method: "cash",
        status: "pending",
        buyer_name: formData.name,
        buyer_phone: formData.phone,
        buyer_address: formData.address,
      })

      // Insert order with buyer_id and buyer_email - v1.2
      const { data: orderData, error: insertError } = await supabase.from("orders").insert({
        seller_id: product.seller_id,
        product_id: product.id,
        buyer_id: userId, // Add buyer_id to satisfy NOT NULL constraint
        buyer_email: userEmail, // Add buyer_email for contact information
        quantity,
        total_price: Number.parseFloat(totalPrice),
        payment_method: "cash",
        status: "pending",
        buyer_name: formData.name,
        buyer_phone: formData.phone,
        buyer_address: formData.address,
        // notes: `Order by user: ${userId}, Email: ${userEmail}`, // Will be added back once database is updated
      }).select()

      console.log("[DEBUG] Order insert result:", { orderData, insertError })

      if (insertError) {
        console.log("[DEBUG] Insert error details:", insertError)
        throw insertError
      }

      const { error: stockError } = await supabase
        .from("products")
        .update({ stock: product.stock - quantity })
        .eq("id", product.id)

      if (stockError) {
        console.log("Error updating stock:", stockError)
        // Don't throw here, stock update failure shouldn't stop the order
      }

      router.push("/order-success")
    } catch (error) {
      console.log("Error creating order:", error)
      
      // Provide more detailed error messages
      let errorMessage = "Failed to place order. Please try again."
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = `Order failed: ${error.message}`
      } else if (error && typeof error === 'object' && 'details' in error) {
        errorMessage = `Order failed: ${JSON.stringify(error)}`
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuantityChange = (value: number) => {
    if (value > product.stock) {
      setError(`Only ${product.stock} items available`)
      setQuantity(product.stock)
    } else if (value < 1) {
      setQuantity(1)
    } else {
      setError(null)
      setQuantity(value)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-8 text-slate-900">Checkout</h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {product.stock === 0 && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <Package className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              This product is currently out of stock and cannot be ordered.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Product Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review your purchase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                {product.image_url ? (
                  <img
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    className="h-24 w-24 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-lg bg-slate-200 flex items-center justify-center">
                    <Package className="h-8 w-8 text-slate-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-sm text-slate-600 line-clamp-2">{product.description}</p>
                  {product.profiles?.store_name && (
                    <p className="text-sm text-slate-500 mt-1">
                      Sold by: <span className="font-medium">{product.profiles.store_name}</span>
                    </p>
                  )}
                  <Badge variant={product.stock < 10 ? "destructive" : "secondary"} className="mt-2">
                    {product.stock} in stock
                  </Badge>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Price per item:</span>
                  <span className="font-semibold">{Number.parseFloat(product.price).toFixed(2)} MAD</span>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="quantity">Quantity:</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(Number.parseInt(e.target.value) || 1)}
                    className="w-20"
                    disabled={product.stock === 0}
                  />
                </div>

                <div className="flex items-center justify-between text-lg font-bold border-t pt-3">
                  <span>Total:</span>
                  <span className="text-orange-600">{totalPrice} MAD</span>
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
                  <Label htmlFor="name">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    disabled={product.stock === 0}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+212 6XX XXX XXX"
                    disabled={product.stock === 0}
                  />
                  <p className="text-xs text-slate-500">Moroccan phone number (e.g., +212 612 345 678)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">
                    Delivery Address <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="address"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Main St, Apt 4B, City, State, ZIP"
                    rows={4}
                    disabled={product.stock === 0}
                  />
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
                  <p className="font-semibold text-amber-900 mb-1">💵 Cash on Delivery</p>
                  <p className="text-amber-700">You will pay {totalPrice} MAD in cash when you receive your order.</p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || product.stock === 0}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                >
                  {isLoading ? "Placing Order..." : product.stock === 0 ? "Out of Stock" : "Place Order"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
