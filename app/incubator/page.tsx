"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle2, Clock, Calendar, Droplets, Thermometer, RotateCw, TrendingUp, Bell, Egg } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Breed-specific hatching success rates based on research
const BREED_SUCCESS_RATES = {
  "rhode-island-red": { rate: 85, optimalRate: 92, name: "Rhode Island Red" },
  leghorn: { rate: 88, optimalRate: 94, name: "Leghorn" },
  "plymouth-rock": { rate: 83, optimalRate: 90, name: "Plymouth Rock" },
  sussex: { rate: 86, optimalRate: 93, name: "Sussex" },
  orpington: { rate: 82, optimalRate: 89, name: "Orpington" },
  wyandotte: { rate: 84, optimalRate: 91, name: "Wyandotte" },
  brahma: { rate: 80, optimalRate: 87, name: "Brahma" },
  cornish: { rate: 78, optimalRate: 85, name: "Cornish" },
}

export default function IncubatorPage() {
  const [startDate, setStartDate] = useState("")
  const [numEggs, setNumEggs] = useState("")
  const [breed, setBreed] = useState("")
  const [showPrediction, setShowPrediction] = useState(false)

  // Calculated milestones
  const [day3Date, setDay3Date] = useState<Date | null>(null)
  const [day18Date, setDay18Date] = useState<Date | null>(null)
  const [hatchDate, setHatchDate] = useState<Date | null>(null)
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null)
  const [currentPhase, setCurrentPhase] = useState<string>("")

  useEffect(() => {
    if (startDate) {
      const start = new Date(startDate)
      
      // Calculate milestone dates
      const d3 = new Date(start)
      d3.setDate(d3.getDate() + 3)
      setDay3Date(d3)

      const d18 = new Date(start)
      d18.setDate(d18.getDate() + 18)
      setDay18Date(d18)

      const d21 = new Date(start)
      d21.setDate(d21.getDate() + 21)
      setHatchDate(d21)

      // Calculate days remaining from today
      const today = new Date()
      const diffTime = d21.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      setDaysRemaining(diffDays)

      // Determine current phase
      const daysSinceStart = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      if (daysSinceStart < 0) {
        setCurrentPhase("Not Started")
      } else if (daysSinceStart < 3) {
        setCurrentPhase("Initial Phase - Prepare to Start Flipping")
      } else if (daysSinceStart < 18) {
        setCurrentPhase("Flipping Phase - Active Rotation")
      } else if (daysSinceStart < 21) {
        setCurrentPhase("Hatching Phase - Stop Flipping, Increase Humidity")
      } else {
        setCurrentPhase("Hatching Complete")
      }
    }
  }, [startDate])

  const calculatePredictions = () => {
    if (numEggs && breed && startDate) {
      setShowPrediction(true)
    }
  }

  const getHatchability = () => {
    const eggs = Number.parseInt(numEggs)
    const breedData = BREED_SUCCESS_RATES[breed as keyof typeof BREED_SUCCESS_RATES]
    
    if (!breedData) return null

    // Base rate from breed
    let successRate = breedData.rate

    // Calculate if we're in optimal conditions (days 3-18 with proper flipping)
    const today = new Date()
    const start = new Date(startDate)
    const daysSinceStart = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    
    // Optimal conditions bonus
    if (daysSinceStart >= 3 && daysSinceStart <= 18) {
      successRate = breedData.optimalRate
    }

    const expectedHatch = Math.round((eggs * successRate) / 100)
    const expectedFail = eggs - expectedHatch

    retur
