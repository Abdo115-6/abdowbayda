"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle2, Clock } from "lucide-react"

export default function IncubatorPage() {
  const [numEggs, setNumEggs] = useState("")
  const [breed, setBreed] = useState("")
  const [incubationDays, setIncubationDays] = useState("")
  const [temperature, setTemperature] = useState("")
  const [showPrediction, setShowPrediction] = useState(false)

  const calculatePredictions = () => {
    if (numEggs && breed && incubationDays) {
      setShowPrediction(true)
    }
  }

  // Calculate crack risk based on incubation days
  const getCrackRisk = () => {
    const days = Number.parseFloat(incubationDays)
    if (days < 17.5) return { level: "Low", color: "text-green-600", message: "Too early for transfer" }
    if (days >= 17.5 && days <= 18.5)
      return { level: "Optimal", color: "text-green-600", message: "Ideal transfer window" }
    if (days > 18.5 && days < 19)
      return { level: "Medium", color: "text-amber-600", message: "Acceptable but not ideal" }
    return { level: "High", color: "text-red-600", message: "Risk of internal pipping disruption" }
  }

  // Calculate expected hatchability
  const getHatchability = () => {
    const days = Number.parseFloat(incubationDays)
    const eggs = Number.parseInt(numEggs)
    let baseRate = 85

    if (days >= 17.5 && days <= 18.5) {
      baseRate = 90
    } else if (days > 18.5 && days < 19) {
      baseRate = 82
    } else if (days >= 19) {
      baseRate = 70
    }

    // Temperature factor
    const temp = Number.parseFloat(temperature)
    if (temp && (temp < 24 || temp > 26)) {
      baseRate -= 5
    }

    return {
      percentage: baseRate,
      expectedHatch: Math.round((eggs * baseRate) / 100),
      expectedCracks: Math.round((eggs * (100 - baseRate)) / 100),
    }
  }

  const crackRisk = showPrediction ? getCrackRisk() : null
  const hatchability = showPrediction ? getHatchability() : null

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Incubator System Management</h1>
          <p className="text-muted-foreground">Track and predict egg hatching outcomes based on best practices</p>
        </div>

        {/* Input Form */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6 text-foreground">Egg Transfer Information</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="numEggs">Number of Hatching Eggs</Label>
              <Input
                id="numEggs"
                type="number"
                placeholder="Enter number of eggs"
                value={numEggs}
                onChange={(e) => setNumEggs(e.target.value)}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="breed">Breed/Race</Label>
              <Select value={breed} onValueChange={setBreed}>
                <SelectTrigger id="breed">
                  <SelectValue placeholder="Select breed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rhode-island-red">Rhode Island Red</SelectItem>
                  <SelectItem value="leghorn">Leghorn</SelectItem>
                  <SelectItem value="plymouth-rock">Plymouth Rock</SelectItem>
                  <SelectItem value="sussex">Sussex</SelectItem>
                  <SelectItem value="orpington">Orpington</SelectItem>
                  <SelectItem value="wyandotte">Wyandotte</SelectItem>
                  <SelectItem value="brahma">Brahma</SelectItem>
                  <SelectItem value="cornish">Cornish</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="incubationDays">Incubation Days (Current)</Label>
              <Input
                id="incubationDays"
                type="number"
                step="0.5"
                placeholder="e.g., 17.5"
                value={incubationDays}
                onChange={(e) => setIncubationDays(e.target.value)}
                min="0"
                max="21"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">Transfer Room Temperature (°C)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.5"
                placeholder="Recommended: 25°C"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={calculatePredictions}
            className="mt-6 w-full md:w-auto"
            disabled={!numEggs || !breed || !incubationDays}
          >
            Calculate Predictions
          </Button>
        </Card>

        {/* Predictions */}
        {showPrediction && crackRisk && hatchability && (
          <>
            <Card className="p-6 border-l-4 border-l-primary">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Transfer Risk Assessment</h2>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className={`h-5 w-5 ${crackRisk.color}`} />
                    <span className="text-sm font-medium text-muted-foreground">Crack Risk Level</span>
                  </div>
                  <p className={`text-2xl font-bold ${crackRisk.color}`}>{crackRisk.level}</p>
                  <p className="text-sm text-muted-foreground">{crackRisk.message}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-muted-foreground">Expected Hatchability</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{hatchability.percentage}%</p>
                  <p className="text-sm text-muted-foreground">{hatchability.expectedHatch} eggs expected to hatch</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-600" />
                    <span className="text-sm font-medium text-muted-foreground">Estimated Cracks</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{hatchability.expectedCracks}</p>
                  <p className="text-sm text-muted-foreground">Based on current conditions</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-muted/50">
              <h2 className="text-lg font-semibold mb-4 text-foreground">Best Practice Recommendations</h2>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Optimal Transfer Window</p>
                    <p className="text-sm text-muted-foreground">
                      Transfer eggs between 17.5 and 18.5 days (420-444 hours) of incubation
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Environmental Control</p>
                    <p className="text-sm text-muted-foreground">
                      Maintain transfer room at 25°C with minimal drafts. Complete transfer within 20-30 minutes
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Handle with Care</p>
                    <p className="text-sm text-muted-foreground">
                      Rough handling increases crack risk. Use clean, dry baskets. Avoid cooling below 35°C
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                    4
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Candling Check</p>
                    <p className="text-sm text-muted-foreground">
                      Remove infertile or dead eggs (clears) if infertility rate {">"} 15%. Fill baskets to at least 90%
                      capacity
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
