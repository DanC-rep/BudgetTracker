/** Page as returned by the API; totalPages is computed on the client */
export type PagedResponse<T> = {
   items: T[]
   page: number
   pageSize: number
   totalCount: number
}

export function getTotalPages(totalCount: number, pageSize: number): number {
   return Math.max(1, Math.ceil(totalCount / pageSize))
}

/** Per-submit callbacks handed from form dialogs to mutation callers */
export type SubmitOptions = {
   onSuccess?: () => void
   onError?: (error: unknown) => void
}
