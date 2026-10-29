export type ErrorType = 'validation' | 'not_found' | 'failure' | 'conflict' | 'authentication' | 'authorization'

export type ApiErrorMessage = {
   code: string
   message: string
   invalidField?: string | null
}

export type ApiError = {
   messages: ApiErrorMessage[]
   type: ErrorType
}

/** Error thrown by the axios interceptor for any non-2xx API response with a ProblemDetails body */
export class ApiRequestError extends Error {
   public readonly status: number
   public readonly apiError: ApiError

   constructor(status: number, apiError: ApiError) {
      super(apiError.messages[0]?.message ?? 'Неизвестная ошибка')

      this.name = 'ApiRequestError'
      this.status = status
      this.apiError = apiError

      Object.setPrototypeOf(this, ApiRequestError.prototype)
   }

   get messages(): ApiErrorMessage[] {
      return this.apiError.messages
   }

   get firstMessage(): string {
      return this.message
   }

   get type(): ErrorType {
      return this.apiError.type
   }

   getAllMessages(): string[] {
      return this.apiError.messages.map(message => message.message)
   }
}

export function isApiRequestError(error: unknown): error is ApiRequestError {
   return error instanceof ApiRequestError
}

/** Backend maps domain ErrorType to HTTP status in ResultExtensions; reverse the mapping on the client */
export function errorTypeFromStatus(status: number): ErrorType {
   switch (status) {
      case 400:
         return 'validation'
      case 401:
         return 'authentication'
      case 403:
         return 'authorization'
      case 404:
         return 'not_found'
      case 409:
         return 'conflict'
      default:
         return 'failure'
   }
}
