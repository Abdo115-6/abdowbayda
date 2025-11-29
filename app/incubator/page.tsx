'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, AlertCircle, CheckCircle2 } from 'lucide-react'
import { format, addDays, differenceInDays } from 'date-fns'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'

// Hatch rate predictions by race
const hatchRates: Record<string, number> = {
  chicken: 85,
  duck: 80,
  goose: 75,
  turkey: 82,
  quail: 88,
}

export default function IncubatorPage() {
  const [startDate, setStartDate] = useState<Date>()
  const [eggCount, setEggCount] = useState<string>('')
  const [race, setRace] = useState<string>('')
  const [isTracking, setIsTracking] = useState(false)

  const handleStartTracking = () => {
    if (startDate && eggCount && race) {
      setIsTracking(true)
    }
  }

  const handleReset = () => {
    setStartDate(undefined)
    setEggCount('')
    setRace('')
    setIsTracking(false)
  }

  // Calculate milestones
  const day3 = startDate ? addDays(startDate, 3) : null
  const day18 = startDate ? addDays(startDate, 18) : null
  const day21 = startDate ? addDays(startDate, 21) : null
  
  const today = new Date()
  const currentDay = startDate ? Math.min(differenceInDays(today, startDate) + 1, 21) : 0
  const progress = (currentDay / 21) * 100

  // Calculate predicted hatch count
  const predictedHatchCount = eggCount && race 
    ? Math.round((parseInt(eggCount) * hatchRates[race]) / 100)
    : 0

  // Timeline data
  const timeline = [
    {
      day: 1,
      title: 'Day 1 - Incubation Start',
      description: 'Begin incubation. Temperature: 37.5°C (99.5°F), Humidity: 50-55%',
      status: currentDay >= 1 ? 'complete' : 'pending',
    },
    {
      day: 3,
      title: 'Day 3 - Start Flipping',
      description: 'Begin turning eggs 3-5 times daily to prevent embryo adhesion',
      status: currentDay >= 3 ? 'complete' : currentDay === 2 ? 'upcoming' : 'pending',
      alert: true,
    },
    {
      day: 7,
      title: 'Day 7 - First Candling',
      description: 'Check for embryo development. Remove non-viable eggs',
      status: currentDay >= 7 ? 'complete' : 'pending',
    },
    {
      day: 14,
      title: 'Day 14 - Second Candling',
      description: 'Verify development progress. Air cell should be visible',
      status: currentDay >= 14 ? 'complete' : 'pending',
    },
    {
      day: 18,
      title: 'Day 18 - Stop Flipping',
      description: 'Stop turning eggs. Increase humidity to 65-70%, reduce temperature to 37°C',
      status: currentDay >= 18 ? 'complete' : currentDay >= 16 && currentDay < 18 ? 'upcoming' : 'pending',
      alert: true,
    },
    {
      day: 21,
      title: 'Day 21 - Hatching Day',
      description: 'Chicks should begin hatching. Maintain high humidity and do not open incubator',
      status: currentDay >= 21 ? 'complete' : currentDay >= 19 && currentDay < 21 ? 'upcoming' : 'pending',
      alert: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-amber-900">Egg Incubator Tracker</h1>
          <p className="text-muted-foreground">Track your incubation journey from day 1 to hatching</p>
        </div>

        {!isTracking ? (
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle>Start New Incubation</CardTitle>
              <CardDescription>
                Enter the details to begin tracking your egg incubation process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="start-date"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'PPP') : 'Select start date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="egg-count">Number of Eggs</Label>
                <Input
                  id="egg-count"
                  type="number"
                  placeholder="Enter number of eggs"
                  value={eggCount}
                  onChange={(e) => setEggCount(e.target.value)}
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="race">Bird Species/Race</Label>
                <Select value={race} onValueChange={setRace}>
                  <SelectTrigger id="race">
                    <SelectValue placeholder="Select bird species" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chicken">Chicken (85% hatch rate)</SelectItem>
                    <SelectItem value="duck">Duck (80% hatch rate)</SelectItem>
                    <SelectItem value="goose">Goose (75% hatch rate)</SelectItem>
                    <SelectItem value="turkey">Turkey (82% hatch rate)</SelectItem>
                    <SelectItem value="quail">Quail (88% hatch rate)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                onClick={handleStartTracking}
                disabled={!startDate || !eggCount || !race}
              >
                Start Tracking
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Overview Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Incubation Progress</CardTitle>
                    <CardDescription>
                      Day {currentDay} of 21 • Started {startDate && format(startDate, 'PPP')}
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={handleReset}>
                    Reset
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium">Progress</span>
                    <span className="text-muted-foreground">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border bg-card p-4">
                    <div className="text-sm text-muted-foreground">Total Eggs</div>
                    <div className="text-2xl font-bold">{eggCount}</div>
                  </div>
                  <div className="rounded-lg border bg-card p-4">
                    <div className="text-sm text-muted-foreground">Species</div>
                    <div className="text-2xl font-bold capitalize">{race}</div>
                  </div>
                  <div className="rounded-lg border bg-card p-4">
                    <div className="text-sm text-muted-foreground">Expected Hatch</div>
                    <div className="text-2xl font-bold">
                      {predictedHatchCount} ({hatchRates[race]}%)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Alerts */}
            {currentDay >= 2 && currentDay < 3 && (
              <Alert className="border-orange-500 bg-orange-50">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertTitle className="text-orange-900">Upcoming: Start Flipping Tomorrow</AlertTitle>
                <AlertDescription className="text-orange-700">
                  On {day3 && format(day3, 'PPP')}, begin turning eggs 3-5 times daily
                </AlertDescription>
              </Alert>
            )}

            {currentDay >= 16 && currentDay < 18 && (
              <Alert className="border-blue-500 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-900">Upcoming: Stop Flipping Soon</AlertTitle>
                <AlertDescription className="text-blue-700">
                  On {day18 && format(day18, 'PPP')}, stop turning eggs and increase humidity to 65-70%
                </AlertDescription>
              </Alert>
            )}

            {currentDay >= 19 && currentDay < 21 && (
              <Alert className="border-green-500 bg-green-50">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-900">Hatching Day Approaching</AlertTitle>
                <AlertDescription className="text-green-700">
                  Expected hatch date: {day21 && format(day21, 'PPP')}. Get ready!
                </AlertDescription>
              </Alert>
            )}

            {currentDay >= 21 && (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-900">Hatching Day Reached!</AlertTitle>
                <AlertDescription className="text-green-700">
                  Expected finish date: {day21 && format(day21, 'PPP')}. Monitor closely and avoid opening the incubator.
                </AlertDescription>
              </Alert>
            )}

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>21-Day Incubation Timeline</CardTitle>
                <CardDescription>Key milestones and care instructions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative space-y-6">
                  {timeline.map((item, index) => (
                    <div key={item.day} className="relative flex gap-4">
                      {/* Timeline line */}
                      {index !== timeline.length - 1 && (
                        <div className="absolute left-4 top-8 h-full w-0.5 bg-border" />
                      )}
                      
                      {/* Status indicator */}
                      <div className="relative flex-shrink-0">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                            item.status === 'complete'
                              ? 'border-green-500 bg-green-500 text-white'
                              : item.status === 'upcoming'
                              ? 'border-orange-500 bg-orange-500 text-white'
                              : 'border-border bg-background'
                          }`}
                        >
                          {item.status === 'complete' ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <span className="text-xs font-semibold">{item.day}</span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-6">
                        <div
                          className={`rounded-lg border p-4 ${
                            item.status === 'upcoming'
                              ? 'border-orange-500 bg-orange-50'
                              : item.status === 'complete'
                              ? 'border-green-500 bg-green-50'
                              : 'bg-card'
                          }`}
                        >
                          <div className="mb-1 flex items-center gap-2">
                            <h3 className="font-semibold">{item.title}</h3>
                            {item.alert && item.status === 'upcoming' && (
                              <AlertCircle className="h-4 w-4 text-orange-600" />
                            )}
                          </div>
                                                   <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
