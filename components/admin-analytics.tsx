"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Search,
  Users,
  ShoppingBag,
  DollarSign,
  Package,
  Crown,
  ArrowLeft,
  Upload,
  Ban,
  UserCheck,
  Settings,
  Mail,
  Trash2,
  AlertTriangle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

type Profile = {
  id: string
  email: string
  role: string
  store_name: string | null
  store_slug: string | null
  created_at: string
  is_banned?: boolean
}

type Product = {
  id: string
  name: string
  price: number
  stock: number
  category: string
  seller_id: string
  created_at: string
  profiles?: {
    store_name: string
    email: string
    role: string
  }
}

type Order = {
  id: string
  product_id: string
  buyer_id: string
  seller_id: string
  quantity: number
  total_price: number
  status: string
  created_at: string
  products?: {
    name: string
    price: number
    category: string
    seller_id: string
    profiles?: {
      store_name: string
      email: string
    }
  }
  profiles?: {
    email: string
    role: string
  }
}

type ContactMessage = {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  contact_reason: string
  message: string
  file_url: string | null
  file_name: string | null
  is_read: boolean
  created_at: string
}

type AdminAnalyticsProps = {
  profiles: Profile[]
  products: Product[]
  orders: Order[]
  contactMessages: ContactMessage[]
  currentUserEmail: string
  siteSettings: { id: string; marketplace_hero_image: string; updated_at: string } | null
}

export default function AdminAnalytics({
  profiles,
  products,
  orders,
  contactMessages,
  currentUserEmail,
  siteSettings,
}: AdminAnalyticsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null)
  const [isUploadingBackground, setIsUploadingBackground] = useState(false)
  const [banningUserId, setBanningUserId] = useState<string | null>(null)
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  const analytics = useMemo(() => {
    const totalUsers = profiles.length
    const sellers = profiles.filter((p) => p.role === "seller")
    const buyers = profiles.filter((p) => p.role === "buyer")
    const totalProducts = products.length
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_price), 0)

    const productSales = orders.reduce(
      (acc, order) => {
        if (!acc[order.product_id]) {
          acc[order.product_id] = {
            productId: order.product_id,
            productName: order.products?.name || "Unknown",
            category: order.products?.category || "Unknown",
            sellerName: order.products?.profiles?.store_name || "Unknown",
            totalSales: 0,
            totalRevenue: 0,
            orderCount: 0,
          }
        }
        acc[order.product_id].totalSales += order.quantity
        acc[order.product_id].totalRevenue += Number(order.total_price)
        acc[order.product_id].orderCount += 1
        return acc
      },
      {} as Record<string, any>,
    )

    const winningProducts = Object.values(productSales)
      .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10)

    const sellerStats = sellers
      .map((seller) => {
        const sellerProducts = products.filter((p) => p.seller_id === seller.id)
        const sellerOrders = orders.filter((o) => o.seller_id === seller.id)
        const revenue = sellerOrders.reduce((sum, order) => sum + Number(order.total_price), 0)
        const totalSales = sellerOrders.reduce((sum, order) => sum + order.quantity, 0)

        return {
          id: seller.id,
          storeName: seller.store_name || "No Store Name",
          email: seller.email,
          productsCount: sellerProducts.length,
          ordersCount: sellerOrders.length,
          totalRevenue: revenue,
          totalSales,
        }
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue)

    return {
      totalUsers,
      sellersCount: sellers.length,
      buyersCount: buyers.length,
      totalProducts,
      totalOrders,
      totalRevenue,
      winningProducts,
      sellerStats,
    }
  }, [profiles, products, orders])

  const handleBackgroundUpload = async () => {
    if (!backgroundImage) return

    setIsUploadingBackground(true)
    try {
      const formData = new FormData()
      formData.append("file", backgroundImage)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) throw new Error("Failed to upload image")

      const { url } = await uploadResponse.json()

      const response = await fetch("/api/admin/update-background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url }),
      })

      if (!response.ok) throw new Error("Failed to update background")

      toast({
        title: "Success",
        description: "Marketplace background updated successfully!",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update background. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploadingBackground(false)
      setBackgroundImage(null)
    }
  }

  const handleToggleBan = async (userId: string, currentBanStatus: boolean) => {
    setBanningUserId(userId)
    try {
      const response = await fetch("/api/admin/ban-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isBanned: !currentBanStatus }),
      })

      if (!response.ok) throw new Error("Failed to update user status")

      toast({
        title: "Success",
        description: `User ${!currentBanStatus ? "banned" : "unbanned"} successfully!`,
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setBanningUserId(null)
    }
  }

  const handleDeleteProduct = async (product: Product) => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return
    
    setDeletingProductId(productToDelete.id)
    try {
      // Delete the product
      const response = await fetch("/api/admin/delete-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          productId: productToDelete.id,
          sellerId: productToDelete.seller_id,
          sellerEmail: productToDelete.profiles?.email,
          productName: productToDelete.name
        }),
      })

      if (!response.ok) throw new Error("Failed to delete product")

      toast({
        title: "Success",
        description: `Product "${productToDelete.name}" deleted successfully! Warning sent to seller.`,
      })

      setDeleteDialogOpen(false)
      setProductToDelete(null)
      
      // Force a full page reload to ensure data is refreshed
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingProductId(null)
    }
  }

  const filteredProfiles = profiles.filter((profile) => {
    const matchesSearch =
      profile.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.store_name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || profile.role === roleFilter
    return matchesSearch && matchesRole
  })

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(products.map((p) => p.category)))

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push("/marketplace")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Admin Analytics</h1>
                <p className="text-sm text-muted-foreground">Analyze your store performance</p>
              </div>
            </div>
            <Badge variant="outline">{currentUserEmail}</Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.sellersCount} sellers, {analytics.buyersCount} buyers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalProducts}</div>
              <p className="text-xs text-muted-foreground">Listed in marketplace</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalOrders}</div>
              <p className="text-xs text-muted-foreground">All time orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalRevenue.toFixed(2)} MAD</div>
              <p className="text-xs text-muted-foreground">All time revenue</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="winning" className="space-y-4">
          <TabsList>
            <TabsTrigger value="winning">Winning Products</TabsTrigger>
            <TabsTrigger value="sellers">Seller Performance</TabsTrigger>
            <TabsTrigger value="users">All Users</TabsTrigger>
            <TabsTrigger value="products">All Products</TabsTrigger>
            <TabsTrigger value="orders">All Orders</TabsTrigger>
            <TabsTrigger value="contacts">Contact Messages</TabsTrigger>
            <TabsTrigger value="settings">Site Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="winning" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-yellow-500" />
                      Top 10 Winning Products
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Products with highest revenue and sales</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead className="text-right">Orders</TableHead>
                      <TableHead className="text-right">Units Sold</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.winningProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No sales data available yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      analytics.winningProducts.map((product: any, index: number) => (
                        <TableRow key={product.productId}>
                          <TableCell>
                            <Badge variant={index < 3 ? "default" : "outline"}>#{index + 1}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">{product.productName}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>{product.sellerName}</TableCell>
                          <TableCell className="text-right">{product.orderCount}</TableCell>
                          <TableCell className="text-right">{product.totalSales}</TableCell>
                          <TableCell className="text-right font-bold">{product.totalRevenue.toFixed(2)} MAD</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sellers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Seller Performance</CardTitle>
                <p className="text-sm text-muted-foreground">Rankings based on total revenue</p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Store Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Products</TableHead>
                      <TableHead className="text-right">Orders</TableHead>
                      <TableHead className="text-right">Units Sold</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.sellerStats.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No sellers yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      analytics.sellerStats.map((seller, index) => (
                        <TableRow key={seller.id}>
                          <TableCell>
                            <Badge variant={index < 3 ? "default" : "outline"}>#{index + 1}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">{seller.storeName}</TableCell>
                          <TableCell className="text-sm">{seller.email}</TableCell>
                          <TableCell className="text-right">{seller.productsCount}</TableCell>
                          <TableCell className="text-right">{seller.ordersCount}</TableCell>
                          <TableCell className="text-right">{seller.totalSales}</TableCell>
                          <TableCell className="text-right font-bold">{seller.totalRevenue.toFixed(2)} MAD</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <CardTitle>All Users</CardTitle>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by email or store..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-full sm:w-32">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="seller">Sellers</SelectItem>
                        <SelectItem value="buyer">Buyers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Store Name</TableHead>
                      <TableHead>Store Slug</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProfiles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProfiles.map((profile: any) => (
                        <TableRow key={profile.id}>
                          <TableCell className="font-medium">{profile.email}</TableCell>
                          <TableCell>
                            <Badge variant={profile.role === "seller" ? "default" : "secondary"}>{profile.role}</Badge>
                          </TableCell>
                          <TableCell>{profile.store_name || "-"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{profile.store_slug || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={profile.is_banned ? "destructive" : "default"}>
                              {profile.is_banned ? "Banned" : "Active"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{new Date(profile.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant={profile.is_banned ? "outline" : "destructive"}
                              onClick={() => handleToggleBan(profile.id, profile.is_banned)}
                              disabled={banningUserId === profile.id}
                            >
                              {profile.is_banned ? (
                                <>
                                  <UserCheck className="h-4 w-4 mr-1" />
                                  Unban
                                </>
                              ) : (
                                <>
                                  <Ban className="h-4 w-4 mr-1" />
                                  Ban
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <CardTitle>All Products</CardTitle>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No products found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.profiles?.store_name || "Unknown"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{product.category}</Badge>
                          </TableCell>
                          <TableCell className="text-right">{product.price} MAD</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={product.stock > 10 ? "default" : "destructive"}>{product.stock}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">{new Date(product.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteProduct(product)}
                              disabled={deletingProductId === product.id}
                              className="gap-1"
                            >
                              {deletingProductId === product.id ? (
                                "Deleting..."
                              ) : (
                                <>
                                  <Trash2 className="h-3 w-3" />
                                  Delete
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Orders</CardTitle>
                <p className="text-sm text-muted-foreground">Complete order history</p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                          No orders yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
                          <TableCell>{order.products?.name || "Unknown"}</TableCell>
                          <TableCell className="text-sm">{order.profiles?.email || "Unknown"}</TableCell>
                          <TableCell className="text-sm">{order.products?.profiles?.store_name || "Unknown"}</TableCell>
                          <TableCell className="text-right">{order.quantity}</TableCell>
                          <TableCell className="text-right font-medium">
                            {Number(order.total_price).toFixed(2)} MAD
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                order.status === "completed"
                                  ? "default"
                                  : order.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  <CardTitle>Contact Messages ({contactMessages.length})</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Messages from users via the contact form
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contactMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No contact messages yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {contactMessages
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .map((message) => (
                          <Card key={message.id} className={`${!message.is_read ? 'border-primary/50 bg-primary/5' : ''}`}>
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold">{message.name}</h4>
                                    {!message.is_read && (
                                      <Badge variant="secondary" className="text-xs">New</Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">{message.email}</p>
                                  {message.phone && (
                                    <p className="text-xs text-muted-foreground">{message.phone}</p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <Badge variant="outline" className="mb-1">
                                    {message.contact_reason.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </Badge>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(message.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div>
                                  <h5 className="font-medium mb-1">Subject: {message.subject}</h5>
                                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {message.message}
                                  </p>
                                </div>
                                
                                {message.file_url && message.file_name && (
                                  <div className="flex items-center gap-2 p-2 bg-muted rounded">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Attachment: {message.file_name}</span>
                                    <a 
                                      href={message.file_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline text-sm ml-auto"
                                    >
                                      View
                                    </a>
                                  </div>
                                )}

                                <div className="flex gap-2 pt-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      const subject = `Re: ${message.subject}`
                                      const body = `Hi ${message.name},\n\nThank you for your message regarding "${message.subject}".\n\n`
                                      window.open(`mailto:${message.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
                                    }}
                                  >
                                    Reply via Email
                                  </Button>
                                  {!message.is_read && (
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={async () => {
                                        try {
                                          // In a real app, you'd call an API to mark as read
                                          // For now, we'll just show a toast
                                          toast({
                                            title: "Message marked as read",
                                            description: "This would update in the database in a real implementation"
                                          })
                                        } catch (error) {
                                          toast({
                                            title: "Error",
                                            description: "Failed to mark message as read",
                                            variant: "destructive"
                                          })
                                        }
                                      }}
                                    >
                                      Mark as Read
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  <CardTitle>Site Settings</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">Customize your marketplace appearance</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Marketplace Hero Background</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload a custom background image for the marketplace hero section
                    </p>
                  </div>

                  {siteSettings?.marketplace_hero_image && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Current Background</label>
                      <div className="relative h-40 w-full rounded-lg overflow-hidden border">
                        <img
                          src={siteSettings.marketplace_hero_image || "/placeholder.svg"}
                          alt="Current marketplace background"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Upload New Background</label>
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setBackgroundImage(e.target.files?.[0] || null)}
                        className="flex-1"
                      />
                      <Button onClick={handleBackgroundUpload} disabled={!backgroundImage || isUploadingBackground}>
                        <Upload className="h-4 w-4 mr-2" />
                        {isUploadingBackground ? "Uploading..." : "Upload"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Recommended size: 1920x400px for best results</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Product Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Product
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-4">
            <div className="flex gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-amber-900 mb-1">Warning will be sent</p>
                <p className="text-amber-700">
                  The seller "{productToDelete?.profiles?.store_name || 'Unknown'}" will receive a warning message about this product removal.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex gap-2">
              <Trash2 className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-red-900 mb-1">This will:</p>
                <ul className="text-red-700 space-y-1">
                  <li>• Remove the product from marketplace</li>
                  <li>• Remove it from seller's store</li>
                  <li>• Cancel any pending orders for this product</li>
                  <li>• Send an automated warning to the seller</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deletingProductId !== null}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteProduct}
              disabled={deletingProductId !== null}
              className="gap-2"
            >
              {deletingProductId !== null ? (
                "Deleting..."
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete Product & Send Warning
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
