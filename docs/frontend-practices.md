# Frontend-практики (по образцу FileService/client)

Рабочие соглашения фронтенда, выведенные из эталонного проекта `E:/Projects/FileService/client`.
При написании кода в `frontend/` следовать этому документу. Маршрутизация — файловая (Next.js App Router).

## Стек

Next.js 16 (App Router, reactCompiler: true), React 19, Tailwind v4, shadcn/ui, TanStack Query v5,
Zustand v5, react-hook-form + zod (@hookform/resolvers), axios, sonner (тосты), lucide-react,
use-debounce, next-themes (тёмная тема). Псевдоним `@/*` → `src/*`.

## Структура слоёв (FSD-lite)

```
src/
  app/            # маршруты (файловая маршрутизация): layout.tsx, page.tsx, [id]/page.tsx
  entities/<домен>/
    api.ts        # api-объект (axios) + queryOptions/infiniteQueryOptions
    types.ts      # DTO-типы (Entity, *Request)
  features/<домен>/
    <компоненты>.tsx   # UI-фичи (списки, карточки, диалоги, фильтры)
    model/
      use-*.ts         # хуки-обёртки над react-query (use-lessons-list, use-create-lesson)
      *-store.ts       # zustand-сторы (фильтры и прочее клиентское состояние)
  shared/
    api/          # axios-instance, envelope, errors, query-client, types (PaginationResponse)
    components/ui/      # shadcn-компоненты (копируются, не редактируются глобально)
    hooks/        # общие хуки (use-mobile)
    lib/          # cn() и прочие утилиты
    routes.ts     # константы путей
```

Правило импортов: слой может импортировать только из слоёв ниже (`app` → `features` → `entities` → `shared`).
Обратные импорты запрещены (в образце есть нарушение — `entities/lessons/api.ts` тянет тип фильтра из
`@/app/lessons/page`; у нас типы фильтров/параметров объявлять в `entities` или `features/model`).

## Маршрутизация

- Файловая: `src/app/lessons/page.tsx` → `/lessons`, `src/app/lessons/[lessonId]/page.tsx` → динамический сегмент.
- Сами страницы — тонкие: только композиция фич и передача пропсов; логика в `features/*/model`.
- Все пути — через константы в `src/shared/routes.ts` (`export const routes = { home: '/', ... }`),
  переходы — `<Link href={...}>`.
- Динамические пути: `href={routes.lessons + '/' + id}` или template-строкой.

## API-слой (shared/api)

- `axios-instance.ts`: единый `apiClient = axios.create({ baseURL, headers })` + response-интерцептор:
  если тело ответа — `Envelope` с `isError === true`, бросить `EnvelopeError(envelope.error)`.
- `envelope.ts`: `Envelope<T> = { result: T | null; error: ApiError | null; isError: boolean; timeGenerated: string }`
  — зеркалит backend-конвенцию envelope.
- `errors.ts`: `ApiError { messages: ErrorMessage[]; type: ErrorType }`,
  `ErrorMessage { code; message; invalidField? }`,
  `ErrorType = 'validation' | 'not_found' | 'failure' | 'conflict' | 'authentication' | 'authorization'`;
  класс `EnvelopeError extends Error` с геттерами `messages`, `firstMessage`, `getAllMessages()`
  и type-guard `isEnvelopeError`.
- `types.ts`: общий `PaginationResponse<T> = { items; totalCount; page; pageSize; totalPages }`.
- `query-client.ts`: единый `queryClient` со `staleTime: 1000 * 60`; провайдер `QueryClientProvider`
  оборачивает приложение в layout-фиче (`features/layout/app-layout.tsx`), там же `<Toaster />`
  и прочие глобальные обёртки (SidebarProvider и т.п.).

## entities/<домен>/api.ts

- Объект `*Api` с методами: `apiClient.get<Envelope<PaginationResponse<T>>>(...)` → вернуть `.data.result`.
- Рядом объект `*QueryOptions`:
  - `baseKey: '<domain>'` — для инвалидации;
  - методы возвращают `queryOptions(...)` / `infiniteQueryOptions(...)` (не писать queryKey/queryFn инлайном в хуках);
  - `queryKey` включает все параметры фильтрации, чтобы кеш корректно сегментировался;
  - для infinite: `initialPageParam`, `getNextPageParam` (page >= totalPages → undefined), `select`
    плоского ответа `PaginationResponse<T>` из pages.

## Состояния

Серверное состояние — только TanStack Query:

- Хуки-обёртки в `features/<домен>/model/use-*.ts`:
  - `useQuery(options)` / `useInfiniteQuery(options)` с опциями из `*QueryOptions`;
  - бесконечная подгрузка через `IntersectionObserver`: хук возвращает `cursorRef: RefCallback<HTMLDivElement>`,
    в списке — `<div ref={cursorRef}>` внизу; защита от дублей через `!isFetchingNextPage && hasNextPage`;
  - наружу возвращать данные и флаги; ошибку отдавать уже суженной (`error instanceof EnvelopeError ? error : null`).
- Мутации (`useCreate*`):
  - `mutationFn` из `*Api`;
  - `onSettled: () => queryClient.invalidateQueries({ queryKey: [baseKey] })`;
  - `onError`: `EnvelopeError` → `toast.error(error.message)`, иначе общий текст;
  - `onSuccess`: `toast.success(...)`;
  - возвращать `{ mutate, isPending, isError, error }`.

Клиентское UI-состояние — Zustand (`features/<домен>/model/*-store.ts`):

- `create<Store>()(set => ({ ...initialState, setters }))`;
- типы `State`, `Actions`, `Store = State & Actions`; `initialState` — отдельной константой;
- стор — только для фильтров/настроек UI, не для серверных данных.

Локальное состояние диалогов/видимости — `useState` на странице, пропсами `open` / `onOpenChange` в диалог.

Поиск/фильтры: значение из zustand-стора дебаунсить на уровне страницы
(`useDebounce(search, 300)`) и дебаунсированное передавать в хук списка.

## Формы

- react-hook-form + `zodResolver`; схема zod объявляется рядом с компонентом формы;
- сообщения валидации — на русском, прямо в схеме;
- `defaultValues` всегда заданы; ошибки поля — `<p className="text-sm text-destructive">{errors.x.message}</p>`;
- сабмит через `handleSubmit(onSubmit)`; в `onSubmit` — `mutate(data, { onSuccess, onError })`
  (закрытие диалога и `reset()` — в колбэках мутации, не в компоненте через эффекты).

## Ошибки и загрузка в UI

- Обработка ошибок — явная, в месте использования: списки рендерят блок ошибки с текстом
  (`EnvelopeError` → `error.message`, иначе «неизвестная ошибка» + кнопка перезагрузки);
- лоадеры — `Loader2 className="animate-spin"` + подпись;
- тосты — только sonner (`toast.success/error`), `<Toaster richColors />` один, в корневом layout.

## Стилизация

- Только Tailwind-классы; сборка условных классов — через `cn()` из `shared/lib/utils` (clsx + tailwind-merge);
- shadcn-компоненты — в `shared/components/ui`, добавлять через shadcn CLI, стилизовать пропсами/классами снаружи;
- иконки — только lucide-react;
- тёмная тема — next-themes, стили для неё через `dark:` варианты;
- глобальные стили и CSS-переменные темы — в `src/app/globals.css`.

## Стилистика кода

- `'use client'` — первой строкой у каждого интерактивного компонента (все фичи, страницы с состоянием);
- страницы — `export default`, все остальные компоненты/хуки — именованные экспорты;
- типы пропсов — `type Props = { ... }` рядом с компонентом;
- одинарные кавычки, отступ 3 пробела (как в образце), без точек с запятой в конце — единообразно с существующим кодом;
- типы из API — только из `entities/<домен>/types.ts`, не дублировать.
