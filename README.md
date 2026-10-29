# BudgetTracker

Веб-приложение для учета личных расходов и бюджета.

## Стек

- Backend: ASP.NET Core (C#, .NET 10), EF Core, PostgreSQL — пользователи, счета, категории, операции
- Frontend: Next.js 16 (React 19, Tailwind CSS v4, shadcn) — в папке `frontend/`
- БД: PostgreSQL 17 (docker-compose)

## Команды

- Backend: `dotnet build backend/BudgetTracker.slnx`, `dotnet run --project backend/src/BudgetTracker.Web` (Swagger UI: `/swagger` в Development)
- Frontend: `npm run dev` / `npm run build` / `npm run lint` (из `frontend/`)
- Инфраструктура: `docker compose up -d postgres`

## Структура

- `backend/` — solution ASP.NET Core: `Domain` → `Application` → `Infrastructure`, хост — `BudgetTracker.Web`
- `frontend/` — Next.js-приложение (App Router, файловая маршрутизация), структура слоёв FSD-lite: `app` → `features` → `entities` → `shared`
- `docs/` — документация

## Документация

- [docs/business-model.md](docs/business-model.md) — бизнес-модель
- [docs/use-cases.md](docs/use-cases.md) — бизнес-операции Application-слоя
- [docs/frontend-practices.md](docs/frontend-practices.md) — практики и соглашения фронтенда (react-query/zustand, envelope API, формы, стилизация)
