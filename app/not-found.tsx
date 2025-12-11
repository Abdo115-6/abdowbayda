import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">404</h1>
          <h2 className="text-xl font-semibold text-slate-700 mb-4">Page Not Found</h2>
          <p className="text-slate-600 max-w-md">
            The page you're looking for doesn't exist or may have been moved.
          </p>
        </div>
        <div className="space-y-4">
          <Link href="/marketplace">
            <Button className="bg-orange-500 hover:bg-orange-600">
              Browse Products
            </Button>
          </Link>
          <div>
            <Link href="/dashboard" className="text-orange-600 hover:text-orange-700 font-medium">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
