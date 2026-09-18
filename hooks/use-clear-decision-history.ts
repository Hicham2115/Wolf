import { useMutation } from "@tanstack/react-query"
import { api } from "@/lib/axios"
import { getErrorMessage } from "@/lib/get-error-message"

export function useClearDecisionHistory() {
  return useMutation({
    mutationFn: async (decisionId: string) => {
      try {
        const { data } = await api.delete(`/decisions/${decisionId}/history`)
        return data
      } catch (error) {
        throw new Error(getErrorMessage(error))
      }
    },
  })
}
