import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Construction } from "lucide-react"

export function PlaceholderPage({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        {title}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>

      <Card className="mt-6">
        <CardHeader className="items-center text-center">
          <Construction className="mx-auto size-8 text-muted-foreground" />
          <CardTitle className="mt-2">Not part of the MVP yet</CardTitle>
          <CardDescription>
            This section is a placeholder. The current build focuses on the
            Decision workflow.
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  )
}
