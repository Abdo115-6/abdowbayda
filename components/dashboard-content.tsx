"use client"

import { DialogTrigger } from "@/components/ui/dialog"
import { useLanguage } from "@/contexts/language-context"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  Package,
  DollarSign,
  LogOut,
  Pencil,
  Trash2,
  Store,
  ShoppingBag,
  Copy,
  Check,
  Upload,
  ShoppingCart,
  CheckCircle,
  XCircle,
  BarChart3,
  ExternalLink,
  TrendingUp,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LanguageThemeSwitcher } from "@/components/language-theme-switcher"
import { put } from "@vercel/blob"
import { useToast } from "@/hooks/use-toast"

type Product = {
  id: string
  name: string
  description: string | null
  price: string
  image_url: string | null
  category: string | null
  stock: number
  city: string | null
  created_at: string
}

type Profile = {
  store_name: string | null
  store_logo_url: string | null
  store_slug: string | null
  store_cover_url: string | null
}

type Order = {
  id: string
  product_id: string
  buyer_name: string
  buyer_email: string
  buyer_phone: string
  buyer_address: string
  quantity: number
  total_price: string
  status: string
  payment_method: string
  notes: string | null
  created_at: string
  products: {
    name: string
    image_url: string | null
  }
}

export default function DashboardContent({
  initialProducts,
  userEmail,
  userId,
  profile,
}: {
  initialProducts: Product[]
  userEmail: string
  userId: string
  profile: Profile
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [orders, setOrders] = useState<Order[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isStoreDialogOpen, setIsStoreDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [origin, setOrigin] = useState("")
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const { t } = useLanguage()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    category: "",
    stock: "0",
    city: "",
  })

  const [storeData, setStoreData] = useState({
    store_name: profile.store_name || "",
    store_logo_url: profile.store_logo_url || "",
    store_cover_url: profile.store_cover_url || "",
    store_slug: profile.store_slug || "",
  })

  useEffect(() => {
    fetchOrders()
    // Set origin URL client-side to avoid SSR issues
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin)
    }
  }, [])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          products (
            name,
            image_url
          )
        `)
        .eq("seller_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
    }
  }

  const handleOrderAction = async (orderId: string, action: "approved" | "refused" | "completed") => {
    try {
      const { error } = await supabase.from("orders").update({ status: action }).eq("id", orderId)

      if (error) throw error
      fetchOrders()
    } catch (error) {
      console.error("Error updating order:", error)
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const { error } = await supabase.from("orders").delete().eq("id", orderId)
      if (error) throw error
      setOrders(orders.filter((o) => o.id !== orderId))
    } catch (error) {
      console.error("Error deleting order:", error)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Accept all common image formats
    const validImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "image/bmp",
    ]
    if (!validImageTypes.includes(file.type) && !file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid image file (JPG, JPEG, PNG, GIF, WebP, SVG, BMP)",
        variant: "destructive",
      })
      return
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast({
        title: "File size too large",
        description: "File size must be less than 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      const { url } = await put(file.name, file, {
        access: "public",
        token: process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN,
      })
      setFormData((prev) => ({ ...prev, image_url: url }))
      toast({
        title: "Image uploaded successfully!",
        variant: "default",
      })
    } catch (error) {
      console.error("[v0] Error uploading image:", error)
      toast({
        title: "Failed to upload image",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Accept all common image formats
    const validImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "image/bmp",
    ]
    if (!validImageTypes.includes(file.type) && !file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid image file (JPG, JPEG, PNG, GIF, WebP, SVG, BMP)",
        variant: "destructive",
      })
      return
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast({
        title: "File size too large",
        description: "File size must be less than 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      const { url } = await put(file.name, file, {
        access: "public",
        token: process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN,
      })
      setStoreData((prev) => ({ ...prev, store_logo_url: url }))
      toast({
        title: "Logo uploaded successfully!",
        variant: "default",
      })
    } catch (error) {
      console.error("[v0] Error uploading logo:", error)
      toast({
        title: "Failed to upload logo",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const handleSwitchToBuyer = () => {
    router.push("/marketplace")
  }

  const resetForm = () => {
    setFormData({ name: "", description: "", price: "", image_url: "", category: "", stock: "0", city: "" })
    setEditingProduct(null)
  }

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log("[v0] Attempting to save store settings:", {
        userId,
        store_name: storeData.store_name,
        store_logo_url: storeData.store_logo_url ? "present" : "empty",
        store_cover_url: storeData.store_cover_url ? "present" : "empty",
      })

      if (!storeData.store_name.trim()) {
        toast({
          title: "Store name is required",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("profiles")
        .update({
          store_name: storeData.store_name.trim(),
          store_logo_url: storeData.store_logo_url || null,
          store_cover_url: storeData.store_cover_url || null,
        })
        .eq("id", userId)
        .select()

      console.log("[v0] Supabase update result:", { data, error })

      if (error) {
        console.error("[v0] Supabase error details:", error)
        throw error
      }

      setIsStoreDialogOpen(false)
      toast({
        title: "Store settings saved successfully!",
        variant: "default",
      })

      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    } catch (error) {
      console.error("[v0] Error saving store:", error)
      toast({
        title: "Failed to save store settings",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyStoreUrl = () => {
    if (origin) {
      const url = `${origin}/store/${storeData.store_slug || userId}`
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (!formData.name.trim()) {
        toast({
          title: "Product name is required",
          variant: "destructive",
        })
        return
      }
      if (Number.parseFloat(formData.price) <= 0) {
        toast({
          title: "Price must be greater than 0",
          variant: "destructive",
        })
        return
      }

      const { data, error } = await supabase
        .from("products")
        .insert([
          {
            name: formData.name,
            description: formData.description,
            price: formData.price,
            image_url: formData.image_url || null,
            category: formData.category || null,
            stock: Number.parseInt(formData.stock),
            city: formData.city || null,
            seller_id: userId,
          },
        ])
        .select()

      if (error) throw error

      setProducts([...products, data[0]])
      setIsAddDialogOpen(false)
      resetForm()
      toast({
        title: "Product added successfully!",
        variant: "default",
      })
    } catch (error) {
      console.error("Error adding product:", error)
      toast({
        title: "Failed to add product",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("products")
        .update({
          name: formData.name,
          description: formData.description,
          price: formData.price,
          image_url: formData.image_url || null,
          category: formData.category || null,
          stock: Number.parseInt(formData.stock),
          city: formData.city || null,
        })
        .eq("id", editingProduct.id)

      if (error) throw error

      setProducts(
        products.map((p) =>
          p.id === editingProduct.id
            ? { ...p, ...formData, stock: Number.parseInt(formData.stock), city: formData.city || null }
            : p,
        ),
      )
      setIsAddDialogOpen(false)
      resetForm()
      toast({
        title: "Product updated successfully!",
        variant: "default",
      })
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Failed to update product",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("⚠️ Are you sure you want to delete this product? This action cannot be undone.")) {
      return
    }

    try {
      const { error } = await supabase.from("products").delete().eq("id", productId)

      if (error) throw error

      setProducts(products.filter((p) => p.id !== productId))
      toast({
        title: "Product deleted successfully!",
        variant: "default",
      })
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Failed to delete product",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      image_url: product.image_url || "",
      category: product.category || "",
      stock: product.stock.toString(),
      city: product.city || "",
    })
    setIsAddDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">⏳ Pending</Badge>,
      approved: <Badge className="bg-green-100 text-green-800 hover:bg-green-100">✅ Approved</Badge>,
      refused: <Badge className="bg-red-100 text-red-800 hover:bg-red-100">❌ Refused</Badge>,
      completed: <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">🎉 Completed</Badge>,
    }
    return badges[status as keyof typeof badges] || <Badge>{status}</Badge>
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Accept all common image formats
    const validImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "image/bmp",
    ]
    if (!validImageTypes.includes(file.type) && !file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid image file (JPG, JPEG, PNG, GIF, WebP, SVG, BMP)",
        variant: "destructive",
      })
      return
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast({
        title: "File size too large",
        description: "File size must be less than 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      const { url } = await put(file.name, file, {
        access: "public",
        token: process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN,
      })
      setStoreData((prev) => ({ ...prev, store_cover_url: url }))
      toast({
        title: "Cover image uploaded successfully!",
        variant: "default",
      })
    } catch (error) {
      console.error("[v0] Error uploading cover:", error)
      toast({
        title: "Failed to upload cover image",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/farmegg-logo.jpg" alt="FarmEgg" className="h-12 w-12 rounded-full object-cover" />
            <div>
              <h1 className="text-2xl font-bold text-card-foreground flex items-center gap-2">
                <span className="text-primary">FarmEgg</span>
                {storeData.store_name && (
                  <>
                    <span className="text-muted-foreground">·</span>
                    <span>{storeData.store_name}</span>
                  </>
                )}
              </h1>
              <p className="text-sm text-muted-foreground">{userEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageThemeSwitcher />
            {userEmail === "motivationntm@gmail.com" && (
              <Button variant="outline" onClick={() => router.push("/admin")} className="gap-2">
                <BarChart3 className="h-4 w-4" />
                {t("dashboard.adminAnalytics")}
              </Button>
            )}
            <Button variant="outline" onClick={handleSwitchToBuyer} className="gap-2 bg-transparent">
              <ShoppingBag className="h-4 w-4" />
              {t("dashboard.browseAsBuyer")}
            </Button>
            <Button variant="outline" onClick={handleLogout} className="gap-2 bg-transparent">
              <LogOut className="h-4 w-4" />
              {t("nav.logout")}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Store Settings Card */}
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-800 mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
                  <Store className="h-5 w-5" />
                  {t("dashboard.storeSettings.yourStore")}
                </CardTitle>
                <CardDescription className="text-orange-700 dark:text-orange-300">
                  {t("dashboard.storeSettings.manageStore")}
                </CardDescription>
              </div>
              <Dialog open={isStoreDialogOpen} onOpenChange={setIsStoreDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-orange-300 hover:bg-orange-100 dark:border-orange-700 dark:hover:bg-orange-900/50 bg-transparent"
                  >
                    <Store className="h-4 w-4 mr-2" />
                    {t("dashboard.storeSettings.button")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{t("dashboard.storeSettings.title")}</DialogTitle>
                    <DialogDescription>{t("dashboard.storeSettings.description")}</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSaveStore}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="store_name">{t("dashboard.storeSettings.storeName")}</Label>
                        <Input
                          id="store_name"
                          value={storeData.store_name}
                          onChange={(e) => setStoreData({ ...storeData, store_name: e.target.value })}
                          placeholder="My Awesome Store"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="store_logo">{t("dashboard.storeSettings.storeLogo")}</Label>
                        <div className="flex items-center gap-4">
                          {storeData.store_logo_url && (
                            <img
                              src={storeData.store_logo_url || "/placeholder.svg"}
                              alt="Store Logo Preview"
                              className="h-16 w-16 rounded-lg object-cover border"
                            />
                          )}
                          <div className="flex-1">
                            <Input
                              id="store_logo"
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              disabled={isUploading}
                            />
                            {isUploading && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {t("dashboard.storeSettings.uploading")}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="store_cover">{t("dashboard.storeSettings.storeCover")}</Label>
                        <div className="space-y-4">
                          {storeData.store_cover_url && (
                            <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                              <img
                                src={storeData.store_cover_url || "/placeholder.svg"}
                                alt="Store Cover Preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <Input
                              id="store_cover"
                              type="file"
                              accept="image/*"
                              onChange={handleCoverUpload}
                              disabled={isUploading}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {t("dashboard.storeSettings.recommendedSize")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? t("dashboard.storeSettings.saving") : t("dashboard.storeSettings.saveButton")}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input
                value={origin ? `${origin}/store/${storeData.store_slug || userId}` : ""}
                readOnly
                className="flex-1 bg-white dark:bg-slate-800"
              />
              <Button onClick={copyStoreUrl} variant="outline" size="icon">
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.open(`/store/${storeData.store_slug || userId}`, "_blank")
                  }
                }}
                variant="outline"
                size="icon"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="products">{t("dashboard.tabs.products")}</TabsTrigger>
            <TabsTrigger value="orders" className="relative">
              <ShoppingCart className="h-4 w-4 mr-2" />
              {t("dashboard.tabs.orders")}
              {orders.filter((o) => o.status === "pending").length > 0 && (
                <Badge className="ml-2 bg-red-500 text-white h-5 w-5 p-0 flex items-center justify-center rounded-full">
                  {orders.filter((o) => o.status === "pending").length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("dashboard.stats.totalProducts")}</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{products.length}</div>
                  <p className="text-xs text-muted-foreground">{t("dashboard.stats.listedMarketplace")}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("dashboard.stats.avgPrice")}</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {products.length > 0
                      ? (products.reduce((sum, p) => sum + Number.parseFloat(p.price), 0) / products.length).toFixed(2)
                      : "0.00"}{" "}
                    {t("common.currency")}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("dashboard.stats.totalValue")}</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {products.reduce((sum, p) => sum + Number.parseFloat(p.price) * p.stock, 0).toFixed(2)}{" "}
                    {t("common.currency")}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{t("dashboard.yourProducts")}</h2>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("dashboard.addProduct")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{t("dashboard.addProduct")}</DialogTitle>
                    <DialogDescription>Create a new product listing for your store</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddProduct}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">{t("dashboard.product.name")}</Label>
                        <Input
                          id="name"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">{t("dashboard.product.description")}</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="category">{t("dashboard.product.category")}</Label>
                        <Select
                          value={formData.category || ""}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="eggs">Eggs</SelectItem>
                            <SelectItem value="poultry">Poultry</SelectItem>
                            <SelectItem value="dairy">Dairy</SelectItem>
                            <SelectItem value="vegetables">Vegetables</SelectItem>
                            <SelectItem value="fruits">Fruits</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="city">{t("dashboard.product.city")}</Label>
                        <Input
                          id="city"
                          value={formData.city || ""}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="e.g., Casablanca, Rabat, Marrakech"
                        />
                        <p className="text-xs text-muted-foreground">{t("dashboard.product.cityHelper")}</p>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="price">{t("dashboard.product.price")}</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          required
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="e.g., 150.00"
                        />
                        <p className="text-xs text-muted-foreground">{t("dashboard.product.priceHelper")}</p>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="stock">{t("dashboard.product.stock")}</Label>
                        <Input
                          id="stock"
                          type="number"
                          required
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="image">{t("dashboard.product.image")}</Label>
                        <div className="space-y-2">
                          {formData.image_url && (
                            <img
                              src={formData.image_url || "/placeholder.svg"}
                              alt="Product Preview"
                              className="h-32 w-full rounded-lg object-cover border"
                            />
                          )}
                          <div className="flex gap-2">
                            <Input
                              id="image"
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              disabled={isUploading}
                              className="flex-1"
                            />
                            <Upload className="h-4 w-4 self-center text-muted-foreground" />
                          </div>
                          {isUploading && (
                            <p className="text-xs text-muted-foreground">{t("dashboard.product.uploading")}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isLoading || isUploading}>
                        {isLoading ? t("dashboard.product.adding") : t("dashboard.product.addButton")}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Products Grid */}
            {products.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">{t("dashboard.noProducts")}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    {product.image_url && (
                      <div className="aspect-video w-full bg-muted">
                        <img
                          src={product.image_url || "/placeholder.svg"}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <div className="flex flex-col items-end gap-2">
                          {product.category && (
                            <Badge variant="secondary" className="text-xs">
                              {product.category}
                            </Badge>
                          )}
                          {product.city && (
                            <Badge variant="outline" className="text-xs">
                              {product.city}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {product.description || "No description"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-3">
                        <span className="text-sm text-muted-foreground">
                          {t("dashboard.product.stock")}:{" "}
                          <span className="font-semibold text-card-foreground">{product.stock}</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-card-foreground">
                          {Number.parseFloat(product.price).toFixed(2)} {t("common.currency")}
                        </span>
                        <div className="flex gap-2">
                          <Dialog
                            open={editingProduct?.id === product.id}
                            onOpenChange={(open) => {
                              if (!open) {
                                setEditingProduct(null)
                                resetForm()
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button variant="outline" size="icon" onClick={() => openEditDialog(product)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>{t("dashboard.product.editTitle")}</DialogTitle>
                                <DialogDescription>Update your product details</DialogDescription>
                              </DialogHeader>
                              <form onSubmit={handleEditProduct}>
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit_name">{t("dashboard.product.name")}</Label>
                                    <Input
                                      id="edit_name"
                                      required
                                      value={formData.name}
                                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit_description">{t("dashboard.product.description")}</Label>
                                    <Textarea
                                      id="edit_description"
                                      value={formData.description}
                                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit_category">{t("dashboard.product.category")}</Label>
                                    <Select
                                      value={formData.category || ""}
                                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="eggs">Eggs</SelectItem>
                                        <SelectItem value="poultry">Poultry</SelectItem>
                                        <SelectItem value="dairy">Dairy</SelectItem>
                                        <SelectItem value="vegetables">Vegetables</SelectItem>
                                        <SelectItem value="fruits">Fruits</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit_city">{t("dashboard.product.city")}</Label>
                                    <Input
                                      id="edit_city"
                                      value={formData.city || ""}
                                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                      placeholder="e.g., Casablanca, Rabat, Marrakech"
                                    />
                                    <p className="text-xs text-muted-foreground">{t("dashboard.product.cityHelper")}</p>
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit_price">{t("dashboard.product.price")}</Label>
                                    <Input
                                      id="edit_price"
                                      type="number"
                                      step="0.01"
                                      required
                                      value={formData.price}
                                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                      {t("dashboard.product.priceHelper")}
                                    </p>
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit_stock">{t("dashboard.product.stock")}</Label>
                                    <Input
                                      id="edit_stock"
                                      type="number"
                                      required
                                      value={formData.stock}
                                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit_image">{t("dashboard.product.image")}</Label>
                                    <div className="space-y-2">
                                      {formData.image_url && (
                                        <img
                                          src={formData.image_url || "/placeholder.svg"}
                                          alt="Product Preview"
                                          className="h-32 w-full rounded-lg object-cover border"
                                        />
                                      )}
                                      <div className="flex gap-2">
                                        <Input
                                          id="edit_image"
                                          type="file"
                                          accept="image/*"
                                          onChange={handleImageUpload}
                                          disabled={isUploading}
                                          className="flex-1"
                                        />
                                        <Upload className="h-4 w-4 self-center text-muted-foreground" />
                                      </div>
                                      {isUploading && (
                                        <p className="text-xs text-muted-foreground">
                                          {t("dashboard.product.uploading")}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button type="submit" disabled={isLoading || isUploading}>
                                    {isLoading ? t("dashboard.product.saving") : t("dashboard.product.saveChanges")}
                                  </Button>
                                </DialogFooter>
                              </form>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this product?")) {
                                handleDeleteProduct(product.id)
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{t("dashboard.orders.title")}</h2>
              <Badge variant="outline">
                {orders.length} {t("dashboard.orders.totalOrders")}
              </Badge>
            </div>

            {orders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">{t("dashboard.orders.noOrders")}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          {order.products.image_url && (
                            <img
                              src={order.products.image_url || "/placeholder.svg"}
                              alt={order.products.name}
                              className="h-20 w-20 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <CardTitle className="text-lg">{order.products.name}</CardTitle>
                            <CardDescription className="mt-1">
                              <div className="space-y-1 text-sm">
                                <p>
                                  <strong>{t("dashboard.orders.customer")}:</strong> {order.buyer_name}
                                </p>
                                <p>
                                  <strong>Email:</strong> {order.buyer_email}
                                </p>
                                <p>
                                  <strong>Phone:</strong> {order.buyer_phone}
                                </p>
                                <p>
                                  <strong>{t("dashboard.orders.quantity")}:</strong> {order.quantity}
                                </p>
                                <p>
                                  <strong>{t("dashboard.orders.total")}:</strong>{" "}
                                  {Number.parseFloat(order.total_price).toFixed(2)} {t("common.currency")}
                                </p>
                                <p>
                                  <strong>{t("dashboard.orders.payment")}:</strong> {order.payment_method.toUpperCase()}
                                </p>
                              </div>
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(order.status)}
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="text-sm font-medium">{t("dashboard.orders.deliveryAddress")}:</p>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{order.buyer_address}</p>
                        </div>
                        {order.notes && (
                          <div className="bg-muted p-3 rounded-lg">
                            <p className="text-sm font-medium">{t("dashboard.orders.notes")}:</p>
                            <p className="text-sm text-muted-foreground">{order.notes}</p>
                          </div>
                        )}
                        <div className="flex gap-2 pt-2">
                          {order.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="flex-1 bg-green-500 hover:bg-green-600"
                                onClick={() => handleOrderAction(order.id, "approved")}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                {t("dashboard.orders.acceptOrder")}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="flex-1"
                                onClick={() => handleOrderAction(order.id, "refused")}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                {t("dashboard.orders.refuse")}
                              </Button>
                            </>
                          )}
                          {order.status === "approved" && (
                            <Button
                              size="sm"
                              className="flex-1 bg-blue-500 hover:bg-blue-600"
                              onClick={() => handleOrderAction(order.id, "completed")}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {t("dashboard.orders.markCompleted")}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this order?")) {
                                handleDeleteOrder(order.id)
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t("dashboard.orders.delete")}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
