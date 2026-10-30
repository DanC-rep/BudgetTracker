import { isApiRequestError } from './errors'

export type FieldErrorSetter = (field: string, message: string) => void

export type ServerFieldErrorMaps = {
   /** invalidField hint (matched by inclusion, case-insensitive) -> form field */
   byInvalidField: Record<string, string>
   /** error code -> form field */
   byCode: Record<string, string>
}

/**
 * Maps server validation errors (ApiRequestError) onto react-hook-form fields.
 * Returns messages that could not be tied to a field — the caller toasts them.
 */
export function applyServerFieldErrors(
   error: unknown,
   setFieldError: FieldErrorSetter,
   maps: ServerFieldErrorMaps,
): string[] {
   if (!isApiRequestError(error)) {
      return ['Произошла неизвестная ошибка. Попробуйте перезагрузить страницу.']
   }

   const unmapped: string[] = []

   for (const message of error.messages) {
      const field = findByHint(message.invalidField, maps.byInvalidField) ?? maps.byCode[message.code]

      if (field) {
         setFieldError(field, message.message)
      } else {
         unmapped.push(message.message)
      }
   }

   return unmapped
}

function findByHint(hint: string | null | undefined, map: Record<string, string>): string | null {
   if (!hint) return null

   const normalized = hint.toLowerCase()

   for (const [key, field] of Object.entries(map)) {
      if (normalized.includes(key.toLowerCase())) return field
   }

   return null
}
