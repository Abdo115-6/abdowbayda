"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AlertCircle, Loader2, ShoppingBag, Store } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<"seller" | "buyer">("buyer")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (!email.includes("@")) {
      setError("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/${role === "seller" ? "dashboard" : "marketplace"}`,
          data: {
            role: role,
          },
        },
      })

      if (authError) throw authError

      router.push("/auth/verify-email")
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred"
      if (errorMessage.includes("already registered")) {
        setError("This email is already registered. Please sign in instead.")
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-sm">
        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="space-y-1">
            <div className="text-center mb-2">
              <h1 className="text-3xl font-bold text-red-600">FarmEgg</h1>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Create Account</CardTitle>
            <CardDescription className="text-slate-600">Sign up to start buying or selling</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-slate-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-slate-300"
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-slate-700">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-slate-300"
                    disabled={isLoading}
                    placeholder="At least 6 characters"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password" className="text-slate-700">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border-slate-300"
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-3">
                  <Label className="text-slate-700">I want to</Label>
                  <RadioGroup
                    value={role}
                    onValueChange={(value) => setRole(value as "seller" | "buyer")}
                    disabled={isLoading}
                  >
                    <div className="flex items-center space-x-3 rounded-lg border border-slate-300 p-3 hover:bg-slate-50 transition-colors cursor-pointer">
                      <RadioGroupItem value="buyer" id="buyer" />
                      <ShoppingBag className="h-5 w-5 text-slate-600" />
                      <Label htmlFor="buyer" className="flex-1 cursor-pointer text-slate-700 font-normal">
                        Buy products from local farms
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 rounded-lg border border-slate-300 p-3 hover:bg-slate-50 transition-colors cursor-pointer">
                      <RadioGroupItem value="seller" id="seller" />
                      <Store className="h-5 w-5 text-slate-600" />
                      <Label htmlFor="seller" className="flex-1 cursor-pointer text-slate-700 font-normal">
                        Sell my farm products
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm text-slate-600">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-4"
                >
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
