# AGENTS.md

Правила и указания для агентов, работающих с этим проектом.

## Проект

BudgetTracker — трекер бюджета. Бизнес-контекст: [docs/business-model.md](docs/business-model.md).

## Технический стек

См. [README.md](README.md). Доступ агента к PostgreSQL — через MCP-сервер `postgres` (read-only по умолчанию).

## Команды

- Сборка: `dotnet build backend/BudgetTracker.slnx`
- Запуск API: `dotnet run --project backend/src/BudgetTracker.Web`
- Frontend (из `frontend/`): `npm run dev` / `npm run build` / `npm run lint`

## Соглашения

- Архитектура backend — классический многослойный: `BudgetTracker.Domain` → `BudgetTracker.Application` → `BudgetTracker.Infrastructure`, хост — `BudgetTracker.Web`. Фиче-папки и отдельные проекты на каждую сущность не создавать. Тестовых проектов нет.
- Frontend-код пишется по практикам из [docs/frontend-practices.md](docs/frontend-practices.md) (слоистая структура, react-query/zustand, envelope API).
- Shared-библиотеки не создавать в этом репозитории — подключаются как NuGet-пакеты (`DanC-rep.SharedKernel`, `DanC-rep.Core`, `DanC-rep.Framework`) из GitHub-фида пользователя; источники и креды — в `backend/nuget.config`.
- Solution в формате SDK 10 — `BudgetTracker.slnx` (не `.sln`).
- Язык общения с пользователем: русский.
- Код, коммиты и PR — на английском, если не сказано иное.
- Дополнительные .NET-скиллы (стандарты C#, EF Core, DI и т.д.) лежат в `.agents/skills/`, список — в `.agents/skills/README.md`.
- Скиллы по умолчанию не дублировать: правила C#/EF Core уже покрыты `.agents/skills/csharp-coding-standards` и `efcore-patterns`.

## Структура репозитория

- `backend/` — solution и весь backend-код
  - `src/BudgetTracker.Domain/` — доменные сущности (пользователи, счета, категории, операции)
  - `src/BudgetTracker.Application/` — бизнес-логика, use cases
  - `src/BudgetTracker.Infrastructure/` — EF Core, репозитории, PostgreSQL
  - `src/BudgetTracker.Web/` — Web-хост (контроллеры, Program.cs)
- `docs/` — документация (бизнес-модель, бизнес-операции Application-слоя, практики фронтенда — `frontend-practices.md`)
- `frontend/` — Next.js-приложение (React 19, Tailwind v4, shadcn). Структура — FSD-lite: `src/app` (маршруты), `src/shared` (api-клиент, ui-компоненты, lib), при необходимости `src/entities` и `src/features`. Псевдоним `@/*` → `src/*` (см. `components.json`)
- `.agents/skills/` — скиллы для агентов
- `.kimi-code/mcp.json` — конфиг MCP (PostgreSQL; строка подключения указывает на БД `budget_tracker` из docker-compose)
