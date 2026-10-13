# AGENTS.md

Правила и указания для агентов, работающих с этим проектом.

## Проект

BudgetTracker — трекер бюджета. Бизнес-контекст: [docs/business-model.md](docs/business-model.md).

## Технический стек

См. [README.md](README.md). Доступ агента к PostgreSQL — через MCP-сервер `postgres` (read-only по умолчанию).

## Команды

<!-- TODO: заполнить после создания проекта -->
- Сборка: `dotnet build` (уточнить путь к solution)
- Тесты: `dotnet test` (уточнить)
- Линт/форматирование: —
- Frontend: `npm run dev` / `npm run build` (уточнить путь)

## Соглашения

- Язык общения с пользователем: русский.
- Код, коммиты и PR — на английском, если не сказано иное.
- Дополнительные .NET-скиллы (стандарты C#, EF Core, DI и т.д.) лежат в `.agents/skills/`, список — в `.agents/skills/README.md`.
- Скиллы по умолчанию не дублировать: правила C#/EF Core уже покрыты `.agents/skills/csharp-coding-standards` и `efcore-patterns`.

## Структура репозитория

<!-- TODO: описать после создания проекта -->
- `docs/` — документация (бизнес-модель)
- `.agents/skills/` — скиллы для агентов
- `.kimi-code/mcp.json` — конфиг MCP (PostgreSQL; строка подключения — заглушка, обновить при создании БД)
