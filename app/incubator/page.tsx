// ... existing code ...

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

    // <CHANGE> Completed the return statement that was cut off
    return {
      breedName: breedData.name,
      totalEggs: eggs,
      successRate,
      expectedHatch,
      expectedFail,
    }
  }

  const prediction = showPrediction && numEggs && breed ? getHatchability() : null

  const formatDate = (date: Date | null) => {
    if (!date) return ""
    return date.toLocaleDateString("en-US", { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getPhaseColor = (phase: string) => {
    if (phase.includes("Not Started")) return "bg-gray-500"
    if (phase.includes("Initial")) return "bg-blue-500"
    if (phase.includes("Flipping")) return "bg-green-500"
    if (phase.includes("Hatching Phase")) return "bg-orange-500"
    if (phase.includes("Complete")) return "bg-purple-500"
    return "bg-gray-500"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Egg className="w-12 h-12 text-orange-600" />
            <h1 className="text-4xl font-bold text-gray-900">Incubator Management System</h1>
          </div>
          <p className="text-lg text-gray-600">
            Optimize egg transfer and track hatching predictions based on best practices
          </p>
        </div>

        {/* Input Card */}
        <Card className="p-6 mb-6 bg-white/90 backdrop-blur shadow-xl">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-orange-600" />
            Incubation Details
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <Label htmlFor="startDate" className="text-base font-medium mb-2 block">
                Incubation Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="numEggs" className="text-base font-medium mb-2 block">
                Number of Eggs
              </Label>
              <Input
                id="numEggs"
                type="number"
                min="1"
                placeholder="Enter egg count"
                value={numEggs}
                onChange={(e) => setNumEggs(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="breed" className="text-base font-medium mb-2 block">
                Chicken Breed
              </Label>
              <Select value={breed} onValueChange={setBreed}>
                <SelectTrigger id="breed" className="w-full">
                  <SelectValue placeholder="Select breed" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(BREED_SUCCESS_RATES).map(([key, data]) => (
                    <SelectItem key={key} value={key}>
                      {data.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={calculatePredictions}
            disabled={!startDate || !numEggs || !breed}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-6 text-lg"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Calculate Predictions & Milestones
          </Button>
        </Card>

        {/* Current Phase Alert */}
        {startDate && currentPhase && (
          <Alert className="mb-6 border-2 bg-white/90 backdrop-blur">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="text-base">
              <div className="flex items-center gap-3">
                <Badge className={`${getPhaseColor(currentPhase)} text-white px-3 py-1`}>
                  {currentPhase}
                </Badge>
                {daysRemaining !== null && daysRemaining > 0 && (
                  <span className="text-gray-700 font-medium">
                    {daysRemaining} days until hatching
                  </span>
                )}
                {daysRemaining !== null && daysRemaining <= 0 && (
                  <span className="text-green-700 font-medium">
                    Hatching window is now!
                  </span>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Timeline and Instructions */}
        {startDate && day3Date && day18Date && hatchDate && (
          <Card className="p-6 mb-6 bg-white/90 backdrop-blur shadow-xl">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-orange-600" />
              Incubation Timeline & Instructions
            </h2>

            <div className="space-y-6">
              {/* Day 0-3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-24 text-right">
                  <Badge variant="outline" className="text-sm">Day 0-3</Badge>
                </div>
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Initial Phase</h3>
                      <p className="text-gray-600 mb-2">
                        Temperature: 37.5-37.8°C (99.5-100°F) | Humidity: 50-55%
                      </p>
                      <Alert className="bg-blue-50 border-blue-200">
                        <Bell className="h-4 w-4 text-blue-600" />
                        <AlertDescription>
                          <strong>Day 3 ({formatDate(day3Date)}):</strong> Start flipping eggs every 2-4 hours to prevent embryo adhesion
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Day 3-18 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-24 text-right">
                  <Badge variant="outline" className="text-sm">Day 3-18</Badge>
                </div>
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="w-full">
                      <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                        <RotateCw className="w-5 h-5 text-green-600" />
                        Active Flipping Phase
                      </h3>
                      <p className="text-gray-600 mb-2">
                        Temperature: 37.5-37.8°C (99.5-100°F) | Humidity: 50-55%
                      </p>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            Flip eggs minimum 3 times per day (every 2-4 hours is optimal)
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            Maintain consistent temperature and humidity
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            Monitor for any contaminated eggs and remove them
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Day 18 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-24 text-right">
                  <Badge variant="outline" className="text-sm bg-orange-100">Day 18</Badge>
                </div>
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    </div>
                    <div className="w-full">
                      <h3 className="font-semibold text-lg mb-1">Transfer to Hatcher</h3>
                      <p className="text-gray-700 font-medium mb-2">
                        📅 Transfer Date: {formatDate(day18Date)}
                      </p>
                      <Alert className="bg-orange-50 border-orange-200 mb-3">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <AlertDescription>
                          <strong>CRITICAL:</strong> Transfer eggs between 17.5-18.5 days. Stop all flipping after transfer.
                        </AlertDescription>
                      </Alert>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Thermometer className="w-4 h-4" />
                          Adjust Settings:
                        </h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-center gap-2">
                            <Thermometer className="w-4 h-4 text-orange-600" />
                            Reduce temperature to 36.5-37°C (97.7-98.6°F)
                          </li>
                          <li className="flex items-center gap-2">
                            <Droplets className="w-4 h-4 text-blue-600" />
                            Increase humidity to 65-70%
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            Transfer within 20-30 minutes in 25°C room
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            Use clean, dry hatching baskets
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Day 18-21 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-24 text-right">
                  <Badge variant="outline" className="text-sm bg-purple-100">Day 18-21</Badge>
                </div>
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Hatching Phase</h3>
                      <p className="text-gray-600 mb-2">
                        Temperature: 36.5-37°C (97.7-98.6°F) | Humidity: 65-70%
                      </p>
                      <p className="text-gray-700 font-medium mb-2">
                        🐣 Expected Hatch Date: {formatDate(hatchDate)}
                      </p>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-purple-600" />
                            Do NOT open incubator during hatching
                          </li>
                          <li className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-purple-600" />
                            Maintain high humidity to prevent membrane drying
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            Monitor for signs of internal/external pipping
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Prediction Results */}
        {prediction && showPrediction && (
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 shadow-xl">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
              Hatching Predictions for {prediction.breedName}
            </h2>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg p-6 text-center shadow-md">
                <Egg className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                <p className="text-gray-600 mb-1 text-sm font-medium">Total Eggs</p>
                <p className="text-4xl font-bold text-gray-900">{prediction.totalEggs}</p>
              </div>

              <div className="bg-white rounded-lg p-6 text-center shadow-md">
                <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-3" />
                <p className="text-gray-600 mb-1 text-sm font-medium">Expected Hatch</p>
                <p className="text-4xl font-bold text-green-600">{prediction.expectedHatch}</p>
                <p className="text-sm text-gray-500 mt-1">{prediction.successRate}% success rate</p>
              </div>

              <div className="bg-white rounded-lg p-6 text-center shadow-md">
                <AlertCircle className="w-10 h-10 text-orange-600 mx-auto mb-3" />
                <p className="text-gray-600 mb-1 text-sm font-medium">Expected Fail</p>
                <p className="text-4xl font-bold text-orange-600">{prediction.expectedFail}</p>
                <p className="text-sm text-gray-500 mt-1">Infertile or early death</p>
              </div>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <strong>Note:</strong> Success rates are based on optimal conditions including prope
