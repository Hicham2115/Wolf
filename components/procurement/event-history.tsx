"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import type { HistoryEvent } from "@/lib/mock-data"

export function EventHistory({ events }: { events: HistoryEvent[] }) {
  const [replayMessage, setReplayMessage] = useState<string | null>(null)

  function handleReplay() {
    setReplayMessage("Event already processed. No changes applied.")
    toast.info("Event already processed. Decision unchanged.")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event history</CardTitle>
        <CardDescription>
          Log of supplier updates and decision changes for this record.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
          {events.map((event) => (
            <li key={event.id} className="flex gap-3 text-sm">
              <span className="w-12 shrink-0 pt-0.5 font-mono text-xs text-muted-foreground">
                {event.time}
              </span>
              <div className="flex-1 border-l pl-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{event.title}</span>
                  <Badge
                    variant={event.status === "Action required" ? "destructive" : "outline"}
                  >
                    {event.status}
                  </Badge>
                </div>
                <p className="mt-0.5 text-muted-foreground">{event.detail}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex items-center gap-3 border-t pt-4">
          <Button variant="outline" size="sm" onClick={handleReplay}>
            Replay latest event
          </Button>
          {replayMessage && (
            <span className="text-xs text-muted-foreground">{replayMessage}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
