import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-sm">
        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Check Your Email</CardTitle>
            <CardDescription className="text-slate-600">We&apos;ve sent you a verification link</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 text-center leading-relaxed">
              Please check your email and click on the verification link to complete your registration. After verifying,
              you can sign in to your account.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
