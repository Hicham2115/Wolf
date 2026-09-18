import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { cn } from "cn"
import type { ChangeField } from "@/lib/procurement/types"

export function ChangeSummary({ fields }: { fields: ChangeField[] }) {
  return (
    <Card id="what-changed">
      <CardHeader>
        <CardTitle>What changed?</CardTitle>
        <CardDescription>
          The supplier updated their price. Changed values are highlighted.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Field</TableHead>
              <TableHead>Previous</TableHead>
              <TableHead>Current</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field) => (
              <TableRow key={field.field}>
                <TableCell className="text-muted-foreground">{field.field}</TableCell>
                <TableCell
                  className={cn(field.changed && "text-muted-foreground line-through")}
                >
                  {field.previous}
                </TableCell>
                <TableCell
                  className={cn(
                    field.changed && "font-medium text-warning"
                  )}
                >
                  {field.current}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
