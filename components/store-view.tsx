"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Grid3x3, List, ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Product = {
  id: string
  name: string
  description: string | null
  price: string
  image_url: string | null
  category: string | null
  stock: number
}

export default function StoreView({
  storeName,
  storeLogo,
  products,
  sellerId,
}: {
  storeName: string
  storeLogo: string | null
  products: Product[]
  sellerId: string
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const router = useRouter()

  // Get unique categories
  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)))

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleBuyNow = (product: Product) => {
    router.push(`/checkout/${product.id}`)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header with Store Info */}
      <div
        className="relative h-64 bg-gradient-to-r from-orange-400 to-amber-500 flex items-center justify-center"
        style={{
          backgroundImage: "url('/images/image.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white">
          {storeLogo && (
            <img
              src={storeLogo || "/placeholder.svg"}
              alt={storeName}
              className="h-20 w-20 rounded-full mx-auto mb-4 border-4 border-white shadow-lg object-cover"
            />
          )}
          <h1 className="text-4xl font-bold mb-2">{storeName}</h1>
          <nav className="text-sm">
            <span className="hover:underline cursor-pointer">Home</span>
            <span className="mx-2">/</span>
            <span className="text-orange-200">Products</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 space-y-6">
            {/* Search */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 text-orange-600 flex items-center gap-2">
                  <div className="h-1 w-8 bg-orange-500 rounded" />
                  Search Keywords
                </h3>
                <div className="relative">
                  <Input
                    placeholder="Your Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 text-orange-600 flex items-center gap-2">
                  <div className="h-1 w-8 bg-orange-500 rounded" />
                  All Categories
                </h3>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category || ""}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-slate-600">
                Showing {filteredProducts.length > 0 ? "1" : "0"} - {Math.min(12, filteredProducts.length)} of{" "}
                {filteredProducts.length} Results
              </p>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-slate-500">
                  No products found matching your criteria.
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === "grid" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-4"}>
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-slate-100 relative">
                      <img
                        src={product.image_url || "/placeholder.svg?height=300&width=300"}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                      {product.category && (
                        <Badge className="absolute top-2 right-2 bg-orange-500">{product.category}</Badge>
                      )}
                    </div>
                    <CardContent className="p-4 text-center">
                      <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                        {product.description || "No description"}
                      </p>
                      <div className="flex items-center justify-center gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className="text-orange-400">
                            ☆
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-slate-900">
                          {Number.parseFloat(product.price).toFixed(2)} MAD
                        </span>
                        <Button onClick={() => handleBuyNow(product)} className="bg-orange-500 hover:bg-orange-600">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Buy Now
                        </Button>
                      </div>
                      <p className="text-sm text-slate-500 mt-2">Stock: {product.stock}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
