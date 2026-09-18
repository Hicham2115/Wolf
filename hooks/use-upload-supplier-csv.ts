import { useMutation } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { api } from "@/lib/axios"

export type UploadSupplierCsvInput = {
  file: File
  supplierName: string
}

export type UploadSupplierCsvResult = {
  duplicate: boolean
  message: string
  outcomes: { changed: boolean }[]
}

export class SupplierCsvUploadError extends Error {
  details: string[]

  constructor(message: string, details: string[]) {
    super(message)
    this.details = details
  }
}

export function useUploadSupplierCsv() {
  return useMutation({
    mutationFn: async ({ file, supplierName }: UploadSupplierCsvInput) => {
      const form = new FormData()
      form.set("file", file)
      form.set("supplierName", supplierName.trim())

      try {
        const { data } = await api.post<UploadSupplierCsvResult>(
          "/supplier/upload",
          form
        )
        return data
      } catch (error) {
        if (isAxiosError(error)) {
          const body = error.response?.data
          const details = Array.isArray(body?.details)
            ? body.details.map(
                (d: { row: number; message: string }) =>
                  `Row ${d.row}: ${d.message}`
              )
            : [body?.error ?? "Upload failed"]
          throw new SupplierCsvUploadError(details[0], details)
        }
        throw error
      }
    },
  })
}
