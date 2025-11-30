"use client"

import { useState } from "react"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, AlertCircle, CheckCircle2, Plus, Trash2, Home } from "lucide-react"
import { format, addDays, differenceInDays } from "date-fns"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { LanguageThemeSwitcher } from "@/components/language-theme-switcher"

// Chicken breeds with their specific hatch rates
const chickenBreeds: Record<string, number> = {
  Australorp: 90,
  Leghorn: 88,
  "Ayam Cemani": 80,
  Brahma: 82,
  Orpington: 86,
  Sussex: 87,
  "Rhode Island Red": 89,
}

interface BreedEntry {
  id: string
  breed: string
  eggCount: number
}

export default function IncubatorPage() {
  const { t } = useLanguage()

  const [startDate, setStartDate] = useState<Date>()
  const [breedEntries, setBreedEntries] = useState<BreedEntry[]>([{ id: "1", breed: "", eggCount: 0 }])
  const [isTracking, setIsTracking] = useState(false)

  const handleAddBreed = () => {
    setBreedEntries([...breedEntries, { id: Date.now().toString(), breed: "", eggCount: 0 }])
  }

  const handleRemoveBreed = (id: string) => {
    if (breedEntries.length > 1) {
      setBreedEntries(breedEntries.filter((entry) => entry.id !== id))
    }
  }

  const handleBreedChange = (id: string, breed: string) => {
    setBreedEntries(breedEntries.map((entry) => (entry.id === id ? { ...entry, breed } : entry)))
  }

  const handleEggCountChange = (id: string, count: string) => {
    const numCount = Number.parseInt(count) || 0
    setBreedEntries(breedEntries.map((entry) => (entry.id === id ? { ...entry, eggCount: numCount } : entry)))
  }

  const handleStartTracking = () => {
    const hasValidEntries = breedEntries.some((entry) => entry.breed && entry.eggCount > 0)
    if (startDate && hasValidEntries) {
      setIsTracking(true)
    }
  }

  const handleReset = () => {
    setStartDate(undefined)
    setBreedEntries([{ id: "1", breed: "", eggCount: 0 }])
    setIsTracking(false)
  }

  // Calculate totals across all breeds
  const totalEggs = breedEntries.reduce((sum, entry) => sum + entry.eggCount, 0)
  const totalPredictedHatch = breedEntries.reduce((sum, entry) => {
    if (entry.breed && entry.eggCount > 0) {
      return sum + Math.round((entry.eggCount * chickenBreeds[entry.breed]) / 100)
    }
    return sum
  }, 0)

  // Calculate milestones
  const day3 = startDate ? addDays(startDate, 2) : null // Day 3 means 2 days after start
  const day7 = startDate ? addDays(startDate, 6) : null
  const day14 = startDate ? addDays(startDate, 13) : null
  const day18 = startDate ? addDays(startDate, 17) : null
  const day21 = startDate ? addDays(startDate, 20) : null

  const today = new Date()
  const currentDay = startDate ? Math.min(Math.max(differenceInDays(today, startDate) + 1, 1), 21) : 0
  const progress = (currentDay / 21) * 100

  // Enhanced timeline with all key days
  const timeline = [
    {
      day: 1,
      title: t("incubator.day1Title"),
      description: t("incubator.day1Description"),
      status: currentDay >= 1 ? "complete" : "pending",
    },
    {
      day: 3,
      title: t("incubator.day3Title"),
      description: t("incubator.day3Description"),
      status: currentDay >= 3 ? "complete" : currentDay === 2 || currentDay === 3 ? "upcoming" : "pending",
      alert: true,
    },
    {
      day: 7,
      title: t("incubator.day7Title"),
      description: t("incubator.day7Description"),
      status: currentDay >= 7 ? "complete" : currentDay === 6 || currentDay === 7 ? "upcoming" : "pending",
      alert: true,
    },
    {
      day: 14,
      title: t("incubator.day14Title"),
      description: t("incubator.day14Description"),
      status: currentDay >= 14 ? "complete" : currentDay === 13 || currentDay === 14 ? "upcoming" : "pending",
      alert: true,
    },
    {
      day: 18,
      title: t("incubator.day18Title"),
      description: t("incubator.day18Description"),
      status: currentDay >= 18 ? "complete" : currentDay >= 17 && currentDay < 18 ? "upcoming" : "pending",
      alert: true,
      critical: true,
    },
    {
      day: 21,
      title: t("incubator.day21Title"),
      description: t("incubator.day21Description"),
      status: currentDay >= 21 ? "complete" : currentDay >= 20 && currentDay < 21 ? "upcoming" : "pending",
      alert: true,
      critical: true,
    },
  ]

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Navigation header with logo and theme switcher */}
      <header className="mb-6 flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/farmegg-logo.jpg" alt="FarmEgg" className="h-12 w-12 rounded-full object-cover" />
            <span className="text-2xl font-bold text-primary">FarmEgg</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <LanguageThemeSwitcher />
          <Button variant="outline" size="sm" asChild className="gap-2 bg-transparent">
            <Link href="/dashboard">
              <Home className="h-4 w-4" />
              {t("incubator.backToDashboard")}
            </Link>
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-primary">🐣 {t("incubator.title")}</h1>
          <p className="text-muted-foreground">{t("incubator.subtitle")}</p>
        </div>

        {!isTracking ? (
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle>{t("incubator.startNew")}</CardTitle>
              <CardDescription>{t("incubator.startDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="start-date">{t("incubator.startDate")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="start-date"
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-transparent"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : t("incubator.selectStartDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>{t("incubator.breedsAndCounts")}</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddBreed}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("incubator.addBreed")}
                  </Button>
                </div>

                {breedEntries.map((entry, index) => (
                  <div key={entry.id} className="flex gap-2">
                    <div className="flex-1">
                      <Select value={entry.breed} onValueChange={(value) => handleBreedChange(entry.id, value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("incubator.selectBreed")} />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(chickenBreeds).map(([breed, rate]) => (
                            <SelectItem key={breed} value={breed}>
                              {breed} ({rate}% {t("incubator.hatchRate")})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        placeholder={t("incubator.eggs")}
                        value={entry.eggCount || ""}
                        onChange={(e) => handleEggCountChange(entry.id, e.target.value)}
                        min="0"
                      />
                    </div>
                    {breedEntries.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveBreed(entry.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {totalEggs > 0 && (
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("incubator.totalEggs")}:</span>
                      <span className="font-semibold">{totalEggs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("incubator.expectedHatch")}:</span>
                      <span className="font-semibold">
                        {totalPredictedHatch} {t("incubator.chicks")}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <Button className="w-full" onClick={handleStartTracking} disabled={!startDate || totalEggs === 0}>
                {t("incubator.startTracking")}
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
                    <CardTitle>{t("incubator.incubationProgress")}</CardTitle>
                    <CardDescription>
                      {t("incubator.day")} {currentDay} {t("incubator.of")} 21 • {t("incubator.started")}{" "}
                      {startDate && format(startDate, "PPP")}
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={handleReset}>
                    {t("incubator.reset")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium">{t("incubator.progress")}</span>
                    <span className="text-muted-foreground">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-lg border bg-card p-4">
                    <div className="text-sm text-muted-foreground">{t("incubator.totalEggs")}</div>
                    <div className="text-2xl font-bold">{totalEggs}</div>
                  </div>
                  <div className="rounded-lg border bg-card p-4">
                    <div className="text-sm text-muted-foreground">{t("incubator.expectedHatch")}</div>
                    <div className="text-2xl font-bold">
                      {totalPredictedHatch} {t("incubator.chicks")}
                    </div>
                  </div>
                  <div className="rounded-lg border bg-card p-4">
                    <div className="text-sm text-muted-foreground">{t("incubator.expectedFinish")}</div>
                    <div className="text-lg font-bold">{day21 && format(day21, "MMM d")}</div>
                  </div>
                </div>

                {/* Breed breakdown table */}
                <div className="rounded-lg border">
                  <div className="border-b bg-muted/50 px-4 py-2">
                    <h3 className="font-semibold">{t("incubator.breedBreakdown")}</h3>
                  </div>
                  <div className="divide-y">
                    {breedEntries
                      .filter((e) => e.breed && e.eggCount > 0)
                      .map((entry) => {
                        const hatchRate = chickenBreeds[entry.breed] || 0
                        const predictedForBreed = Math.round((entry.eggCount * hatchRate) / 100)
                        const percentOfTotal = totalEggs ? Math.round((entry.eggCount / totalEggs) * 100) : 0
                        return (
                          <div key={entry.id} className="grid grid-cols-4 gap-4 px-4 py-3 text-sm">
                            <div className="col-span-2 font-medium flex items-center gap-2">
                              <span>{entry.breed}</span>
                              <span className="text-xs text-muted-foreground">({hatchRate}%)</span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="font-semibold">
                                {entry.eggCount} {t("incubator.eggs")}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {percentOfTotal}% {t("incubator.ofTotal")}
                              </span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="font-semibold">
                                {predictedForBreed} {t("incubator.chicks")}
                              </span>
                              <span className="text-xs text-muted-foreground">{t("incubator.predicted")}</span>
                            </div>
                          </div>
                        )
                      })}
                    {breedEntries.filter((e) => e.breed && e.eggCount > 0).length === 0 && (
                      <div className="px-4 py-3 text-sm text-muted-foreground">{t("incubator.noBreeds")}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Alerts */}
            {/* Day 3 upcoming (day 2) and day 3 */}
            {currentDay === 2 && (
              <Alert className="border-orange-500 bg-orange-50">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertTitle className="text-orange-900">{t("incubator.upcomingFlip")}</AlertTitle>
                <AlertDescription className="text-orange-700">
                  {t("incubator.flipInstructions")} {day3 && format(day3, "PPP")}.
                </AlertDescription>
              </Alert>
            )}
            {currentDay >= 3 && currentDay < 18 && (
              <Alert className="border-blue-500 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-900">{t("incubator.ongoingIncubation")}</AlertTitle>
                <AlertDescription className="text-blue-700">
                  {t("incubator.keepTurning")} {t("incubator.nextKeyDate")}: {day18 && format(day18, "PPP")}.
                </AlertDescription>
              </Alert>
            )}

            {/* Day 18 - Critical: Stop flipping, increase humidity */}
            {currentDay === 17 && (
              <Alert className="border-yellow-500 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-900">{t("incubator.upcomingLockdown")}</AlertTitle>
                <AlertDescription className="text-yellow-700">
                  {t("incubator.lockdownInstructions")} {day18 && format(day18, "PPP")}.
                </AlertDescription>
              </Alert>
            )}
            {currentDay >= 18 && currentDay < 21 && (
              <Alert className="border-red-500 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-900">{t("incubator.lockdownTitle")}</AlertTitle>
                <AlertDescription className="text-red-700">
                  {t("incubator.lockdownNow")} {t("incubator.hatchExpected")}: {day21 && format(day21, "PPP")}.
                </AlertDescription>
              </Alert>
            )}

            {/* Hatching day approaching / reached */}
            {currentDay === 20 && (
              <Alert className="border-green-500 bg-green-50">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-900">{t("incubator.hatchingApproaching")}</AlertTitle>
                <AlertDescription className="text-green-700">
                  {t("incubator.hatchingLikely")} {day21 && format(day21, "PPP")}. {t("incubator.avoidOpening")}.
                </AlertDescription>
              </Alert>
            )}
            {currentDay >= 21 && (
              <Alert className="border-green-700 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-900">{t("incubator.hatchingDay")}</AlertTitle>
                <AlertDescription className="text-green-700">
                  {t("incubator.hatchingReached")} {day21 && format(day21, "PPP")}. {t("incubator.monitorChicks")}.
                </AlertDescription>
              </Alert>
            )}

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>{t("incubator.timeline")}</CardTitle>
                <CardDescription>{t("incubator.timelineDescription")}</CardDescription>
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
                            item.status === "complete"
                              ? "border-green-500 bg-green-500 text-white"
                              : item.status === "upcoming"
                                ? "border-orange-500 bg-orange-500 text-white"
                                : "border-border bg-background"
                          }`}
                        >
                          {item.status === "complete" ? (
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
                            item.status === "upcoming"
                              ? "border-orange-500 bg-orange-50"
                              : item.status === "complete"
                                ? "border-green-500 bg-green-50"
                                : "bg-card"
                          }`}
                        >
                          <div className="mb-1 flex items-center gap-2">
                            <h3 className="font-semibold">{item.title}</h3>
                            {item.alert && item.status === "upcoming" && (
                              <AlertCircle className="h-4 w-4 text-orange-600" />
                            )}
                            {item.critical && item.status !== "complete" && (
                              <span className="ml-2 rounded px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700">
                                {t("incubator.critical")}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                          <div className="mt-2 text-xs text-muted-foreground">
                            {item.day === 3 && day3 && (
                              <div>
                                {t("incubator.scheduled")}: {format(day3, "PPP")}
                              </div>
                            )}
                            {item.day === 7 && day7 && (
                              <div>
                                {t("incubator.scheduled")}: {format(day7, "PPP")}
                              </div>
                            )}
                            {item.day === 14 && day14 && (
                              <div>
                                {t("incubator.scheduled")}: {format(day14, "PPP")}
                              </div>
                            )}
                            {item.day === 18 && day18 && (
                              <div>
                                {t("incubator.scheduled")}: {format(day18, "PPP")}
                              </div>
                            )}
                            {item.day === 21 && day21 && (
                              <div>
                                {t("incubator.scheduled")}: {format(day21, "PPP")}
                              </div>
                            )}
                          </div>
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
