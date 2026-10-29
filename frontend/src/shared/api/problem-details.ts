import { ApiErrorMessage } from './errors'

/** ProblemDetails shape produced by ResultExtensions on error responses (errors extension included) */
export type ProblemDetailsBody = {
   title?: string
   detail?: string
   errors?: ApiErrorMessage[]
}

export function isProblemDetailsBody(data: unknown): data is ProblemDetailsBody {
   if (typeof data !== 'object' || data === null) return false

   const candidate = data as Record<string, unknown>

   return typeof candidate.title === 'string' && Array.isArray(candidate.errors)
}
