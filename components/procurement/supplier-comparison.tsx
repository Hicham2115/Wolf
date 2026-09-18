import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { cn } from "cn"
import { formatEUR } from "@/lib/format"
import type { SupplierComparisonRow as SupplierOffer } from "@/lib/procurement/types"

const statusBadgeClass: Record<SupplierOffer["status"], string> = {
  Approved: "bg-emerald-600 text-white",
  Recommended: "bg-emerald-600 text-white",
  Updated: "bg-amber-500 text-white",
  Available: "",
}

export function SupplierComparison({ suppliers }: { suppliers: SupplierOffer[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Supplier comparison</CardTitle>
        <CardDescription>
          Offers evaluated for this product and quantity.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier</TableHead>
              <TableHead>Unit price</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Saving</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow
                key={supplier.id}
                className={cn(
                  supplier.status === "Recommended" && "bg-emerald-500/10"
                )}
              >
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell>{formatEUR(supplier.unitPrice)}</TableCell>
                <TableCell>{formatEUR(supplier.total)}</TableCell>
                <TableCell>
                  {supplier.saving !== null ? formatEUR(supplier.saving) : "—"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={statusBadgeClass[supplier.status] ? "default" : "outline"}
                    className={statusBadgeClass[supplier.status]}
                  >
                    {supplier.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
