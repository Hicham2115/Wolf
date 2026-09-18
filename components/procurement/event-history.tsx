"use client"

import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useClearDecisionHistory } from "@/hooks/use-clear-decision-history"

export type HistoryEvent = {
  id: string
  time: string
  title: string
  detail: string
  status: "Completed" | "Action required"
}

export function EventHistory({
  decisionId,
  events,
  onCleared,
}: {
  decisionId: string
  events: HistoryEvent[]
  onCleared: () => void
}) {
  const clearHistory = useClearDecisionHistory()

  function handleClear() {
    clearHistory.mutate(decisionId, {
      onSuccess: () => {
        toast.success("Event history cleared.")
        onCleared()
      },
      onError: (error) => toast.error(error.message),
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event history</CardTitle>
        <CardDescription>
          Log of supplier updates and decision changes for this record.
        </CardDescription>
        {events.length > 0 && (
          <CardAction>
            <AlertDialog>
              <AlertDialogTrigger
                render={<Button variant="ghost" size="sm" />}
              >
                <Trash2 className="size-4" />
                Clear
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear event history?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes logged events, approvals, and past
                    recalculations for this decision, keeping only the
                    current version. The current recommendation and evidence
                    are not affected. This can&apos;t be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={handleClear}
                    disabled={clearHistory.isPending}
                  >
                    {clearHistory.isPending ? "Clearing..." : "Clear history"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {events.length === 0 && (
          <p className="text-sm text-muted-foreground">No events yet.</p>
        )}
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
      </CardContent>
    </Card>
  )
}
