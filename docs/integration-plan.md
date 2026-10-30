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

## Этап 3. Замена моков на API (~2–3 дня) — ✅ готово

- [x] `entities/*/api.ts` + `*QueryOptions` по образцу frontend-practices (accounts, categories, transactions, reports)
- [x] **Счета**: список (`GET /api/accounts`), создание, переименование, архивация/восстановление через
      `useMutation` + `invalidateQueries`; локальный state страницы убран
- [x] **Категории**: список, создание/редактирование, hide/show/delete; «потрачено за месяц» из `monthly-summary`
- [x] **Операции**: список с серверной фильтрацией (счёт, категория, тип) и пагинацией; удаление
- [x] **Дашборд**: `GET /api/reports/dashboard` (+ `monthly-summary`/`budget-status`); переключатель месяца в шапке
      — zustand-стор `features/layout/model/month-store.ts`, общий для шапки и дашборда
- [x] `src/shared/lib/mock-data.ts` удалён

Нюансы интеграции (исправлено в рамках этапа):
- Бэкенд отдавал enum'ы как числа, а `type` в DTO — как `ToString()` (PascalCase). Теперь в `Program.cs`
  подключён `JsonStringEnumConverter` (camelCase), а `Type` в DTO — сами enum'ы → на wire `card`/`income`/`transfer`.
- Восстановления счёта не было: добавлен `Account.Unarchive()`, юзкейс `UnarchiveAccount`, эндпоинт
  `POST /api/accounts/{id}/unarchive`.
- `GetAccountDetails` содержал локальный дубликат `TransactionInfo` — заменён на общий из `Transactions`.
- В боди создания операций `currency` обязателен (для income/expense также обязателен `categoryId`) —
  учесть в диалогах этапа 4.
- Поиск по операциям убран из фильтров (на бэкенде нет параметра `Search`, см. открытые вопросы).

Проверено curl-сквозняком на живом API: CRUD счетов (вкл. rename/archive/unarchive), CRUD категорий
(вкл. 409 при удалении категории с операциями), операции (пагинация, фильтры type/account+category,
удаление), `monthly-summary`/`budget-status`/`dashboard`. Фронтенд: `lint` и `build` чистые, все страницы отдают 200.

## Этап 4. Недостающий UI (~1–2 дня) — ✅ готово

- [x] Диалог добавления операции (`features/transactions/transaction-form-dialog.tsx`): тип (доход/расход/перевод),
      сумма, дата, категория (по типу), счёт (+ счёт-получатель для перевода), комментарий — три эндпоинта
      (`POST /api/transactions/income|expense|transfer`); кнопка «Добавить операцию» на странице операций
- [x] Редактирование операции: тот же диалог в edit-режиме (`PATCH /api/transactions/{id}`), кнопка в строке таблицы
- [x] Переименование счёта: диалог (`features/accounts/rename-account-dialog.tsx`, `PATCH /api/accounts/{id}/name`),
      кнопка на карточке счёта
- [x] Маппинг серверной валидации: `applyServerFieldErrors` (`shared/api/form-errors.ts`) — `invalidField`/код ошибки
      → `setError` полей RHF, немапленное — тостами; подключено во всех четырёх диалогах. Формы закрываются только
      в `onSuccess` мутации, серверные ошибки показываются на полях без закрытия диалога
- [x] Период в фильтре операций: два `input[type=date]`, `from/to` передаются как инклюзивные границы
      (`{date}T00:00:00` / `{date}T23:59:59` — сервер фильтрует `>= from, <= to`)

Нюансы:
- Редактирование операции меняет тип свободно — `UpdateTransaction` принимает `type` и пересобирает операцию;
      валюта в edit-режиме берётся из исходной операции.
- Диалоги с формами монтируются с `key={entity?.id ?? 'new'}` — иначе RHF `defaultValues` (initial-only)
      не обновлялись бы при открытии на другой сущности (баг был и в диалоге категорий).
- Хуки форм-мутаций не тостят `onError` — ошибки разбирает диалог (иначе дубли тостов).

Проверено: `lint`/`build` чистые; curl-сквозняк PATCH (смена типа expense→income→transfer, 400 при переводе
на тот же счёт), фильтр `from/to` на границах дней, страницы отдают 200.

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
