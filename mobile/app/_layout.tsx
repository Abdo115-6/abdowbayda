"use client"

import { useEffect } from "react"
import { Stack } from "expo-router"
import type { Session } from "@supabase/supabase-js"
import { supabase } from "../lib/supabase"
import { useRouter } from "expo-router"

export default function RootLayout() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        checkUserRole(session)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        checkUserRole(session)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkUserRole = async (session: Session) => {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (profile?.role === "seller") {
      router.replace("/dashboard")
    } else {
      router.replace("/marketplace")
    }
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/signup" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="marketplace" />
      <Stack.Screen name="checkout/[id]" />
    </Stack>
  )
}
