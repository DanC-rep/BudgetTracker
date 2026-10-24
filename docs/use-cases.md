# Бизнес-операции (Application-слой)

Набор use cases слоя `BudgetTracker.Application`. Источник истины по сущностям и правилам — [business-model.md](business-model.md). Структура: одна папка на агрегат, без отдельных проектов и фиче-папок.

## Сквозные абстракции (`Application/Abstractions`)

- **Репозитории**: `IUsersRepository`, `IAccountsRepository`, `ICategoriesRepository`, `ITransactionsRepository` — интерфейсы в Application, реализации в Infrastructure поверх DbContext. Каждый метод принимает `userId` — изоляция данных (правило 7) вшита в сигнатуры, её невозможно забыть.
- `IUnitOfWork` — один SaveChanges на юзкейс.
- `ICurrentUserAccessor` — текущий `userId` из JWT-claims; юзкейсы не знают про HTTP.
- `IPasswordHasher`, `IJwtProvider` — в абстракциях, реализации в Infrastructure.

## 1. Users (аутентификация)

| Операция | Что делает |
|---|---|
| `RegisterUser` | Проверяет уникальность login/email → хеширует пароль → создаёт User → **сидит системные категории** (Продукты, Транспорт, Жильё, Зарплата…, правило 9). Одна транзакция. |
| `LoginUser` | Проверяет хеш → выдаёт JWT |

## 2. Accounts

| Операция | Что делает |
|---|---|
| `CreateAccount` | Валидация имени, типа; `InitialBalance` (Money, одна валюта) |
| `RenameAccount` | Смена названия счёта |
| `ArchiveAccount` | Не удаление — архивация, если есть операции (правило 6) |
| `GetAccounts` | Список + **вычисленный баланс** каждого счёта (правило 1: баланс не хранится) |
| `GetAccountDetails` | Баланс + последние N операций |

Баланс — SQL-агрегат в репозитории: `initial_balance + Σ income − Σ expense + Σ transfer_in − Σ transfer_out`. Никакого хранимого баланса.

## 3. Categories

| Операция | Что делает |
|---|---|
| `CreateCategory` | Личная категория (userId = текущий), лимит только для expense |
| `UpdateCategory` | Rename / иконка / цвет / `ChangeMonthlyLimit` |
| `HideCategory` / `ShowCategory` | Правило 6: вместо удаления при наличии операций |
| `DeleteCategory` | Только личная и без операций (проверка count в репозитории); системную — нельзя |
| `GetCategories` | Свои + системные, скрытые по флагу |

## 4. Transactions — ядро

| Операция | Что делает |
|---|---|
| `AddIncome` / `AddExpense` | Загружает категорию → проверяет владение (`UserId` null или текущий) и **тип категории против типа операции** (правило 3) → доменный `Transaction.Create` |
| `AddTransfer` | Проверяет, что оба счёта принадлежат пользователю и не архивны → `Create(type: Transfer)` |
| `UpdateTransaction` | Те же проверки + свободное редактирование (правило 8) |
| `DeleteTransaction` | Всегда можно (правило 6) |
| `GetTransactions` | Фильтры: период, счёт, категория, тип; пагинация; индекс `(user_id, date)` уже есть |

Перегруз юзкейсов: тонкие — загрузка зависимостей, проверка владения, вызов домена, сохранение. Вся арифметика и инвариенты — в домене.

## 5. Отчёты (только запросы, read-only)

| Операция | Что делает |
|---|---|
| `GetMonthlySummary` | Доходы/расходы/итог за месяц, разбивка по категориям |
| `GetBudgetStatus` | По категориям с лимитом: потрачено за текущий месяц vs `MonthlyLimit` — **предупреждение, не блокировка** (правило 5) |
| `GetTotalBalance` | Σ вычисленных балансов всех счетов |
| `GetDashboard` | Композит для главного экрана: баланс + свежие операции + статус лимитов |

## Принципы слоя

1. Один юзкейс = один публичный класс с методом `ExecuteAsync`, один вызов SaveChanges.
2. Вход/выход — record-DTO, наружу не утекают доменные сущности.
3. Ошибки — доменный `Error` из SharedKernel маппится в `ProblemDetails` в Web.
4. Все запросы на чтение — `AsNoTracking` (уже глобально в DbContext).

## Открытые вопросы

1. **Авторизация** — по умолчанию JWT (Bearer) + `Microsoft.AspNetCore.Authentication.JwtBearer`, регистрация/логин возвращают токен. Альтернатива: пока захардкоженный пользователь.

Все пять категорий бизнес-операций реализованы: Users, Accounts, Categories, Transactions, Reports.
