"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, LogOut, Package, Grid3x3, List, ShoppingCart, Store, Star, Home, ChevronRight } from "lucide-react"
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
  created_at: string
  profiles: {
    id: string
    store_name: string | null
    store_logo_url: string | null
    store_slug: string | null
  }
}

export default function MarketplaceContent({
  initialProducts,
  userEmail,
  userRole,
}: {
  initialProducts: Product[]
  userEmail: string
  userRole: string | null
}) {
  const [products] = useState<Product[]>(initialProducts)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const handleBackToDashboard = () => {
    router.push("/dashboard")
  }

  // Get unique categories from products
  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)))

  // Filter and sort products
  let filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.profiles?.store_name?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Sort products
  filteredProducts = filteredProducts.sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case "price-low":
        return Number.parseFloat(a.price) - Number.parseFloat(b.price)
      case "price-high":
        return Number.parseFloat(b.price) - Number.parseFloat(a.price)
      default:
        return 0
    }
  })

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-red-600">FarmEgg</h1>
              <nav className="hidden md:flex items-center gap-6">
                <a href="#" className="text-slate-700 hover:text-slate-900 font-medium">
                  Shop
                </a>
                <a href="#" className="text-slate-700 hover:text-slate-900 font-medium">
                  About
                </a>
                <a href="#" className="text-slate-700 hover:text-slate-900 font-medium">
                  Contact
                </a>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              {userRole === "seller" && (
                <Button onClick={handleBackToDashboard} variant="outline" className="gap-2 bg-transparent">
                  <Store className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              )}
              {userEmail && (
                <>
                  <span className="hidden sm:inline text-sm text-slate-600">{userEmail}</span>
                  <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2 bg-transparent">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </>
              )}
              {!userEmail && (
                <>
                  <Button variant="ghost" onClick={() => router.push("/auth/login")}>
                    Login
                  </Button>
                  <Button onClick={() => router.push("/auth/signup")} className="bg-red-600 hover:bg-red-700">
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div
        className="relative h-64 bg-cover bg-center"
        style={{
          backgroundImage: 'url("/images/image.png")',
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative container mx-auto px-4 h-full flex flex-col items-center justify-center text-white">
          <h2 className="text-4xl font-bold mb-2 text-balance">Poultry Products</h2>
          <div className="flex items-center gap-2 text-sm">
            <Home className="h-4 w-4" />
            <span>Home</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-orange-400">Products</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 text-slate-700">
          <p className="text-lg">Browse fresh chicken and egg products from local farms</p>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat || ""}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
            </p>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-slate-900" : ""}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-slate-900" : ""}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-slate-400 mb-4" />
              <p className="text-slate-600 text-center">
                {searchQuery || selectedCategory !== "all"
                  ? "No products found matching your filters."
                  : "No products available yet. Check back soon!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div
            className={
              viewMode === "grid" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid gap-4 grid-cols-1"
            }
          >
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className={`overflow-hidden hover:shadow-lg transition-shadow duration-300 ${viewMode === "list" ? "flex flex-row" : ""}`}
              >
                <div
                  className={
                    viewMode === "grid"
                      ? "aspect-square w-full bg-slate-100 overflow-hidden"
                      : "w-48 h-48 bg-slate-100 overflow-hidden flex-shrink-0"
                  }
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Package className="h-16 w-16 text-slate-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <CardHeader className="pb-3">
                    {/* Seller Info */}
                    <div className="flex items-center gap-2 mb-2">
                      {product.profiles?.store_logo_url ? (
                        <img
                          src={product.profiles.store_logo_url || "/placeholder.svg"}
                          alt="Seller"
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center">
                          <Store className="h-3 w-3 text-slate-500" />
                        </div>
                      )}
                      <span className="text-xs text-red-600 font-medium">
                        {product.profiles?.store_name || "Unknown Seller"}
                      </span>
                    </div>

                    <CardTitle className="text-base font-semibold text-slate-900 line-clamp-1">
                      {product.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-sm text-slate-600">
                      {product.description || "No description available"}
                    </CardDescription>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-3 w-3 fill-orange-400 text-orange-400" />
                      ))}
                      <span className="text-xs text-slate-500 ml-1">(0)</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-red-600">
                          ${Number.parseFloat(product.price).toFixed(2)}
                        </span>
                        <p className="text-xs text-slate-500 mt-1">{product.stock} left</p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 gap-2"
                        onClick={() => router.push(`/checkout/${product.id}`)}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
