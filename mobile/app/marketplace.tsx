"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image, ActivityIndicator } from "react-native"
import { useRouter } from "expo-router"
import { supabase } from "../lib/supabase"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  stock: number
  profiles: {
    store_name: string
    store_logo_url: string
  } | null
}

export default function Marketplace() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(products)
    }
  }, [searchQuery, products])

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        profiles:seller_id (
          store_name,
          store_logo_url
        )
      `)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setProducts(data)
      setFilteredProducts(data)
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace("/auth/login")
  }

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productCard} onPress={() => router.push(`/checkout/${item.id}`)}>
      <Image source={{ uri: item.image_url || "https://via.placeholder.com/200" }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <View style={styles.sellerInfo}>
          {item.profiles?.store_logo_url && (
            <Image source={{ uri: item.profiles.store_logo_url }} style={styles.sellerLogo} />
          )}
          <Text style={styles.sellerName}>{item.profiles?.store_name || "Unknown Seller"}</Text>
        </View>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>${item.price}</Text>
          <Text style={styles.productStock}>{item.stock} left</Text>
        </View>
        <TouchableOpacity style={styles.buyButton} onPress={() => router.push(`/checkout/${item.id}`)}>
          <Text style={styles.buyButtonText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Marketplace</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#dc2626" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.productList}
          numColumns={2}
          columnWrapperStyle={styles.row}
          ListEmptyComponent={<Text style={styles.emptyText}>No products available</Text>}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#dc2626",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  searchInput: {
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  loader: {
    flex: 1,
  },
  productList: {
    padding: 8,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  productCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productImage: {
    width: "100%",
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: "#f3f4f6",
  },
  productInfo: {
    padding: 12,
  },
  sellerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  sellerLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  sellerName: {
    fontSize: 12,
    color: "#dc2626",
    fontWeight: "600",
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#dc2626",
  },
  productStock: {
    fontSize: 12,
    color: "#666",
  },
  buyButton: {
    backgroundColor: "#dc2626",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  buyButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginTop: 32,
  },
})
