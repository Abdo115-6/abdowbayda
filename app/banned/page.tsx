import Image from "next/image"
import { Ban } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function BannedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-slate-950 p-4">
      <Card className="w-full max-w-md border-red-200 dark:border-red-800">
        <CardContent className="pt-10 pb-10 text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative w-24 h-24">
              <Image src="/farmegg-logo.jpg" alt="FarmEgg Logo" fill className="object-contain rounded-full" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <Ban className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-red-600 dark:text-red-400">Account Banned</h1>

            <p className="text-gray-700 dark:text-gray-300 text-lg">
              Your account has been banned from accessing this website.
            </p>

            <p className="text-gray-600 dark:text-gray-400 text-sm">
              If you believe this is a mistake, please contact the administrator at{" "}
              <a
                href="mailto:motivationntm@gmail.com"
                className="text-red-600 dark:text-red-400 hover:underline font-medium"
              >
                motivationntm@gmail.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
