"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
  Modal,
  ActivityIndicator,
} from "react-native"
import { useRouter } from "expo-router"
import { supabase } from "../lib/supabase"
import * as ImagePicker from "expo-image-picker"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  stock: number
}

interface Order {
  id: string
  status: string
  total_price: number
  customer_email: string
  customer_phone: string
  delivery_address: string
  created_at: string
  products: {
    name: string
  }
}

export default function Dashboard() {
  const router = useRouter()
  const [tab, setTab] = useState<"products" | "orders">("products")
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    image_url: "",
  })

  useEffect(() => {
    fetchData()
  }, [tab])

  const fetchData = async () => {
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (tab === "products") {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", user?.id)
        .order("created_at", { ascending: false })

      if (!error) setProducts(data || [])
    } else {
      const { data, error } = await supabase
        .from("orders")
        .select("*, products(name)")
        .eq("seller_id", user?.id)
        .order("created_at", { ascending: false })

      if (!error) setOrders(data || [])
    }

    setLoading(false)
  }

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      Alert.alert("Error", "Please fill in required fields")
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()
    const { error } = await supabase.from("products").insert({
      name: newProduct.name,
      description: newProduct.description,
      price: Number.parseFloat(newProduct.price),
      stock: Number.parseInt(newProduct.stock) || 0,
      image_url: newProduct.image_url || "/placeholder.svg?height=200&width=200",
      seller_id: user?.id,
    })

    if (error) {
      Alert.alert("Error", error.message)
    } else {
      Alert.alert("Success", "Product added successfully")
      setShowAddProduct(false)
      setNewProduct({ name: "", description: "", price: "", stock: "", image_url: "" })
      fetchData()
    }
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled) {
      setNewProduct({ ...newProduct, image_url: result.assets[0].uri })
    }
  }

  const handleOrderAction = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId)

    if (error) {
      Alert.alert("Error", error.message)
    } else {
      Alert.alert("Success", `Order ${status}`)
      fetchData()
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace("/auth/login")
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Seller Dashboard</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === "products" && styles.tabActive]}
          onPress={() => setTab("products")}
        >
          <Text style={[styles.tabText, tab === "products" && styles.tabTextActive]}>Products</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === "orders" && styles.tabActive]} onPress={() => setTab("orders")}>
          <Text style={[styles.tabText, tab === "orders" && styles.tabTextActive]}>Orders</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#dc2626" style={styles.loader} />
      ) : (
        <ScrollView style={styles.content}>
          {tab === "products" ? (
            <View>
              <TouchableOpacity style={styles.addButton} onPress={() => setShowAddProduct(true)}>
                <Text style={styles.addButtonText}>+ Add Product</Text>
              </TouchableOpacity>

              <FlatList
                data={products}
                scrollEnabled={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.productCard}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productDescription}>{item.description}</Text>
                    <Text style={styles.productPrice}>${item.price}</Text>
                    <Text style={styles.productStock}>Stock: {item.stock}</Text>
                  </View>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No products yet</Text>}
              />
            </View>
          ) : (
            <FlatList
              data={orders}
              scrollEnabled={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.orderCard}>
                  <Text style={styles.orderProduct}>{item.products?.name}</Text>
                  <Text style={styles.orderCustomer}>{item.customer_email}</Text>
                  <Text style={styles.orderPrice}>${item.total_price}</Text>
                  <Text style={styles.orderStatus}>{item.status}</Text>

                  {item.status === "pending" && (
                    <View style={styles.orderActions}>
                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => handleOrderAction(item.id, "approved")}
                      >
                        <Text style={styles.actionButtonText}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.refuseButton}
                        onPress={() => handleOrderAction(item.id, "refused")}
                      >
                        <Text style={styles.actionButtonText}>Refuse</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No orders yet</Text>}
            />
          )}
        </ScrollView>
      )}

      <Modal visible={showAddProduct} animationType="slide">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Product</Text>
            <TouchableOpacity onPress={() => setShowAddProduct(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Product Name *</Text>
              <TextInput
                style={styles.input}
                value={newProduct.name}
                onChangeText={(text) => setNewProduct({ ...newProduct, name: text })}
                placeholder="Enter product name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newProduct.description}
                onChangeText={(text) => setNewProduct({ ...newProduct, description: text })}
                placeholder="Enter description"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Price *</Text>
              <TextInput
                style={styles.input}
                value={newProduct.price}
                onChangeText={(text) => setNewProduct({ ...newProduct, price: text })}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Stock</Text>
              <TextInput
                style={styles.input}
                value={newProduct.stock}
                onChangeText={(text) => setNewProduct({ ...newProduct, stock: text })}
                placeholder="0"
                keyboardType="number-pad"
              />
            </View>

            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <Text style={styles.imageButtonText}>{newProduct.image_url ? "Change Image" : "Pick Image"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddProduct}>
              <Text style={styles.submitButtonText}>Add Product</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      <TouchableOpacity style={styles.switchButton} onPress={() => router.push("/marketplace")}>
        <Text style={styles.switchButtonText}>Browse as Buyer</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  tab: {
    flex: 1,
    padding: 16,
    alignItems: "center",
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#dc2626",
  },
  tabText: {
    fontSize: 16,
    color: "#666",
  },
  tabTextActive: {
    color: "#dc2626",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loader: {
    flex: 1,
  },
  addButton: {
    backgroundColor: "#dc2626",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  productCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 8,
    marginBottom: 12,
  },
  productName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#dc2626",
  },
  productStock: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  orderCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 8,
    marginBottom: 12,
  },
  orderProduct: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  orderCustomer: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  orderPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: 4,
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "capitalize",
    marginBottom: 12,
  },
  orderActions: {
    flexDirection: "row",
    gap: 8,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: "#16a34a",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  refuseButton: {
    flex: 1,
    backgroundColor: "#dc2626",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginTop: 32,
  },
  modal: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    fontSize: 24,
    color: "#666",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  imageButton: {
    borderWidth: 1,
    borderColor: "#dc2626",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  imageButtonText: {
    color: "#dc2626",
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#dc2626",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  switchButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#dc2626",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  switchButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
})
