# План интеграции фронтенда с бэкендом

Что осталось довести BudgetTracker до рабочего продукта. Текущее состояние: бэкенд готов
(Application/Web/Infrastructure, JWT, все контроллеры), фронтенд свёрстан на моках (6 страниц, FSD-lite).
Вёрстка описана в [frontend-practices.md](frontend-practices.md).

Важно: бэкенд **не использует Envelope**. Успех — сырой payload (`Ok(value)`), ошибка — `ProblemDetails`
с массивом `errors` в extensions (`Web/Extensions/ResultExtensions.cs`). Фронтендский клиент
(`frontend/src/shared/api/`) построен под этот контракт: `ApiRequestError` + `isApiRequestError`.

Контракты для сверки:
- Пагинация операций: бэкенд отдаёт `{ items, page, pageSize, totalCount }` — `totalPages` считаем на клиенте.
- Фильтры операций (`GetTransactions.Params`): `from, to, accountId, categoryId, type, page, pageSize`.
  Поиска по комментарию нет — см. открытые вопросы.

## Этап 1. Фундамент связки — ✅ готово

- [x] CORS-политика `Frontend` на бэкенде (`Program.cs`, origin `http://localhost:3000`), проверена preflight-запросом
- [x] `shared/api/axios-instance.ts`: baseURL из `NEXT_PUBLIC_API_URL` (по умолчанию `http://localhost:5094`), см. `frontend/.env.example`
- [x] Интерцептор ошибок: `ProblemDetails` → `throw ApiRequestError(status, { type, messages })`
- [x] `shared/api/auth-token.ts`: хранение JWT в localStorage (`budget-tracker.auth-token`)
- [x] Интерцептор запросов: `Authorization: Bearer`; при 401 — очистка токена и редирект на `/login`

## Этап 2. Auth end-to-end — ✅ готово

- [x] Мутации `login`/`register` через `apiClient` (`api/auth/login|register`), сохранение токена, тосты уже готовы
- [x] Текущий пользователь: `GET /api/auth/me` на бэкенде (юзкейс `GetCurrentUser`) + `useQuery(usersQueryOptions.meOptions())` в сайдбаре
- [x] Защита `(app)`: нет токена → редирект на `/login`; токен есть и пользователь на `/login|/register` → на `/`
- [x] Сайдбар: реальные имя/логин/цвет аватара; кнопка «Выйти» — `clearAuthToken()` + редирект
- [x] Формы: ошибки авторизации с сервера показываются тостами (см. `use-login` / `use-register`)

Проверено curl-сквозняком: register → login → `me` с токеном → 401 без токена → 401 ProblemDetails при неверном пароле.
Нюанс: контроллерный `[AllowAnonymous]` глушил `[Authorize]` на action — `me` отдавал 500; исправлено переносом
`[AllowAnonymous]` на register/login.

## Этап 3. Замена моков на API (~2–3 дня) — ядро

- [ ] `entities/*/api.ts` + `*QueryOptions` по образцу frontend-practices
- [ ] **Счета**: список (`GET /api/accounts`), создание, переименование, архивация/восстановление через
      `useMutation` + `invalidateQueries`; убрать local state страницы
- [ ] **Категории**: список, создание/редактирование, hide/show/delete
- [ ] **Операции**: список с серверной фильтрацией (период, счёт, категория, тип) и пагинацией; удаление; редактирование
- [ ] **Дашборд**: `GET /api/reports/dashboard`; подключить переключатель месяца в шапке к `monthly-summary`/`budget-status`
- [ ] Удалить `src/shared/lib/mock-data.ts`

## Этап 4. Недостающий UI (~1–2 дня)

- [ ] Диалог добавления операции: тип (доход/расход/перевод), сумма, дата, категория (по типу), счёт
      (+ счёт-получатель для перевода), комментарий — три эндпоинта уже есть
- [ ] Редактирование операции: тот же диалог в edit-режиме (`PATCH /api/transactions/{id}`)
- [ ] Переименование счёта: диалог (`PATCH /api/accounts/{id}/name`)
- [ ] Маппинг серверной валидации: `invalidField` из `ApiRequestError` → ошибки полей react-hook-form
- [ ] Период в фильтре операций (сервер уже принимает `from/to`)

## Этап 5. Шлифовка (~1 день)

- [ ] Скелетоны загрузки (`isPending`), обработка ошибок списков, пустые состояния
- [ ] env-конфиг, README: запуск (docker-compose + backend + frontend)
- [ ] Сквозная проверка: регистрация → логин → счёт → категории → операции → дашборд/лимиты

## Открытые вопросы

1. **Поиск операций**: в `GetTransactions` нет параметра `Search`. Рекомендуется добавить на бэкенд
   (фильтр по комментарию в репозитории), иначе поиск возможен только по загруженной странице.
2. **Хранение JWT**: localStorage (текущий вариант, проще) vs httpOnly-cookie (безопаснее, нужен BFF/прокси).
3. **Часовые пояса**: даты в моках без TZ; при интеграции сверить формат `date` из API и отображение
   (сейчас форматирование детерминировано, см. `shared/lib/format.ts`).
