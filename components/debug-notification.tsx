"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bug, CheckCircle, XCircle } from "lucide-react"

export default function DebugNotification() {
  const [testResults, setTestResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runTests = async () => {
    setIsLoading(true)
    try {
      // Test environment setup
      const envTest = await fetch("/api/test-notification")
      const envData = await envTest.json()

      // Test POST functionality
      const postTest = await fetch("/api/test-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: "data" }),
      })
      const postData = await postTest.json()

      setTestResults({
        environment: envData,
        postTest: postData,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Debug test failed:", error)
      setTestResults({
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Notification System Debug
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTests} disabled={isLoading}>
          {isLoading ? "Running Tests..." : "Run Debug Tests"}
        </Button>

        {testResults && (
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold mb-2">Environment Variables:</h4>
              <div className="grid grid-cols-2 gap-2">
                {testResults.environment?.environment &&
                  Object.entries(testResults.environment.environment).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      {value ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm">{key}</span>
                      <Badge variant={value ? "default" : "destructive"}>{value ? "OK" : "Missing"}</Badge>
                    </div>
                  ))}
              </div>
            </div>

            {testResults.postTest && (
              <div>
                <h4 className="font-semibold mb-2">API Communication:</h4>
                <Badge variant={testResults.postTest.success ? "default" : "destructive"}>
                  {testResults.postTest.success ? "Working" : "Failed"}
                </Badge>
              </div>
            )}

            {testResults.error && (
              <div>
                <h4 className="font-semibold mb-2 text-red-600">Error:</h4>
                <p className="text-sm text-red-600">{testResults.error}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
