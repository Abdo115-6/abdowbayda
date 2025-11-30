"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Search,
  LogOut,
  Package,
  Grid3x3,
  List,
  ShoppingCart,
  Store,
  Star,
  Home,
  ChevronRight,
  MapPin,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LanguageThemeSwitcher } from "@/components/language-theme-switcher"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"

type Product = {
  id: string
  name: string
  description: string | null
  price: string
  image_url: string | null
  category: string | null
  city: string | null
  created_at: string
  seller_id: string
  profiles: {
    id: string
    store_name: string | null
    store_logo_url: string | null
    store_slug: string | null
  } | null
}

export default function MarketplaceContent({
  initialProducts,
  userEmail,
  userRole,
  heroImage,
}: {
  initialProducts: Product[]
  userEmail: string
  userRole: string | null
  heroImage: string | null
}) {
  const { t } = useLanguage()
  const [products] = useState<Product[]>(initialProducts)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedCity, setSelectedCity] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const router = useRouter()
  const supabase = createClient()

  console.log("[v0] Marketplace received products:", products.length)
  if (products.length > 0) {
    console.log("[v0] First product:", products[0])
    console.log("[v0] First product profiles:", products[0].profiles)
  }
   const handleAbout = async () => {
    await supabase.auth.signOut()
    router.push("/about")
  }
  const handleContact = async () => {
    await supabase.auth.signOut()
    router.push("/contact")
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const handleBackToDashboard = () => {
    router.push("/dashboard")
  }

  // Get unique categories from products
  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)))

  const cities = Array.from(new Set(products.map((p) => p.city).filter(Boolean)))

  // Filter and sort products
  let filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.profiles?.store_name?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory

    const matchesCity = selectedCity === "all" || product.city === selectedCity

    return matchesSearch && matchesCategory && matchesCity
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <button
                onClick={() => router.push("/marketplace")}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <img src="/farmegg-logo.jpg" alt="FarmEgg" className="h-12 w-12 rounded-full object-cover" />
                <span className="text-2xl font-bold text-primary">FarmEgg</span>
              </button>
              <nav className="hidden md:flex items-center gap-6">
                <a href="#" className="text-foreground/70 hover:text-foreground font-medium transition-colors">
                  {t("nav.marketplace")}
                </a>
                <Button
                  onClick={() => router.push("/about")}
                  variant="ghost"
                  className="text-foreground/70 hover:text-foreground font-medium transition-colors"
                >
                 About
                </Button>
               
                 <Button
                  onClick={() => router.push("/contact")}
                  variant="ghost"
                  className="text-foreground/70 hover:text-foreground font-medium transition-colors"
                >
                 Contact
                </Button>
                <Button
                  onClick={() => router.push("/incubator")}
                  variant="ghost"
                  className="text-foreground/70 hover:text-foreground font-medium transition-colors"
                >
                  Egg Calculator
                </Button>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <LanguageThemeSwitcher />
              {userRole === "seller" && (
                <Button onClick={handleBackToDashboard} variant="outline" className="gap-2 bg-transparent">
                  <Store className="h-4 w-4" />
                  {t("nav.backToDashboard")}
                </Button>
              )}
              {userEmail && (
                <>
                  <span className="hidden sm:inline text-sm text-muted-foreground">{userEmail}</span>
                  <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2 bg-transparent">
                    <LogOut className="h-4 w-4" />
                    {t("nav.logout")}
                  </Button>
                </>
              )}
              {!userEmail && (
                <>
                  <Button variant="ghost" onClick={() => router.push("/auth/login")}>
                    {t("nav.login")}
                  </Button>
                  <Button onClick={() => router.push("/auth/signup")} className="bg-primary hover:bg-primary/90">
                    {t("nav.signup")}
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
          backgroundImage: `url("${heroImage || "/placeholder.svg?height=400&width=1920"}")`,
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative container mx-auto px-4 h-full flex flex-col items-center justify-center text-white">
          <h2 className="text-4xl font-bold mb-2 text-balance">{t("marketplace.title")}</h2>
          <div className="flex items-center gap-2 text-sm">
            <Home className="h-4 w-4" />
            <span>{t("nav.home")}</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-orange-400">Products</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 text-muted-foreground">
          <p className="text-lg">{t("marketplace.subtitle")}</p>
        </div>

        {/* Filters and Controls */}
        <div className="bg-card border rounded-lg p-6 mb-6">
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("marketplace.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder={t("marketplace.allCategories")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("marketplace.allCategories")}</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat || ""}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <SelectValue placeholder={t("marketplace.allCities")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("marketplace.allCities")}</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city || ""}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder={t("marketplace.sort")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t("marketplace.newest")}</SelectItem>
                <SelectItem value="price-low">{t("marketplace.priceLowHigh")}</SelectItem>
                <SelectItem value="price-high">{t("marketplace.priceHighLow")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {t("marketplace.showing")} {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? t("marketplace.product") : t("marketplace.products")}
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
        </div>

        {/* Products Grid/List */}
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                {searchQuery || selectedCategory !== "all" || selectedCity !== "all"
                  ? t("marketplace.noMatch")
                  : t("marketplace.noProducts")}
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
                      ? "aspect-square w-full bg-muted overflow-hidden"
                      : "w-48 h-48 bg-muted overflow-hidden flex-shrink-0"
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
                      <Package className="h-16 w-16 text-muted-foreground" />
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
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                          <Store className="h-3 w-3 text-muted-foreground" />
                        </div>
                      )}
                      <span className="text-xs text-primary font-medium">
                        {product.profiles?.store_name || product.profiles?.id || "Unknown Seller"}
                      </span>
                    </div>

                    <CardTitle className="text-base font-semibold line-clamp-1">{product.name}</CardTitle>
                    <CardDescription className="line-clamp-2 text-sm">
                      {product.description || "No description available"}
                    </CardDescription>

                    {product.city && (
                      <div className="flex items-center gap-1 mt-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <Badge variant="outline" className="text-xs">
                          {product.city}
                        </Badge>
                      </div>
                    )}

                    {/* Rating */}
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-3 w-3 fill-orange-400 text-orange-400" />
                      ))}
                      <span className="text-xs text-muted-foreground ml-1">(0)</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-primary">
                          {Number.parseFloat(product.price).toFixed(2)} {t("common.currency")}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 gap-2"
                        onClick={() => router.push(`/checkout/${product.id}`)}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {t("marketplace.buyNow")}
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
