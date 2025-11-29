"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { supabase } from "../../lib/supabase"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  seller_id: string
  profiles: {
    store_name: string
  } | null
}

export default function Checkout() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    address: "",
  })

  useEffect(() => {
    fetchProduct()
  }, [])

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        profiles:seller_id (
          store_name
        )
      `)
      .eq("id", id)
      .single()

    if (!error && data) {
      setProduct(data)
    }
    setLoading(false)
  }

  const handleSubmitOrder = async () => {
    if (!formData.email || !formData.phone || !formData.address) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    if (!product) return

    setSubmitting(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from("orders").insert({
      product_id: product.id,
      seller_id: product.seller_id,
      buyer_id: user?.id,
      customer_email: formData.email,
      customer_phone: formData.phone,
      delivery_address: formData.address,
      total_price: product.price,
      status: "pending",
    })

    setSubmitting(false)

    if (error) {
      Alert.alert("Error", error.message)
    } else {
      Alert.alert("Order Placed!", "Your order has been submitted. Pay cash on delivery.", [
        { text: "OK", onPress: () => router.push("/marketplace") },
      ])
    }
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#dc2626" />
      </View>
    )
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.productSection}>
          <Image source={{ uri: product.image_url || "https://via.placeholder.com/200" }} style={styles.productImage} />
          <View style={styles.productDetails}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productDescription}>{product.description}</Text>
            {product.profiles?.store_name && (
              <Text style={styles.sellerName}>Sold by: {product.profiles.store_name}</Text>
            )}
            <Text style={styles.productPrice}>${product.price}</Text>
          </View>
        </View>

        <View style={styles.paymentBadge}>
          <Text style={styles.paymentText}>💵 Cash on Delivery</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>Delivery Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="+1 234 567 8900"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Delivery Address *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter your full delivery address"
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmitOrder}
            disabled={submitting}
          >
            <Text style={styles.submitButtonText}>{submitting ? "Placing Order..." : "Place Order"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  backButton: {
    fontSize: 16,
    color: "#dc2626",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  productSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  productImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#f3f4f6",
  },
  productDetails: {
    gap: 8,
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
  },
  productDescription: {
    fontSize: 14,
    color: "#666",
  },
  sellerName: {
    fontSize: 14,
    color: "#dc2626",
    fontWeight: "600",
  },
  productPrice: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#dc2626",
  },
  paymentBadge: {
    backgroundColor: "#fef2f2",
    padding: 16,
    margin: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fca5a5",
  },
  paymentText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#dc2626",
    textAlign: "center",
  },
  form: {
    padding: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
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
  submitButton: {
    backgroundColor: "#dc2626",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#fca5a5",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 32,
  },
})
