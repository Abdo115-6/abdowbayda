"use client"

import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[ERROR PAGE] Error occurred:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Oops!</h1>
          <h2 className="text-xl font-semibold text-slate-700 mb-4">Something went wrong</h2>
          <p className="text-slate-600 max-w-md">
            We encountered an unexpected error. Please try again or contact support if the problem persists.
          </p>
          {process.env.NODE_ENV === "development" && (
            <details className="mt-4 text-left bg-red-50 border border-red-200 rounded-lg p-4">
              <summary className="font-medium text-red-800 cursor-pointer">Error Details</summary>
              <pre className="mt-2 text-sm text-red-700 whitespace-pre-wrap">
                {error.message}
              </pre>
            </details>
          )}
        </div>
        <div className="space-y-4">
          <Button onClick={reset} className="bg-orange-500 hover:bg-orange-600 gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <div>
            <a href="/marketplace" className="text-orange-600 hover:text-orange-700 font-medium">
              Go to Marketplace
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
