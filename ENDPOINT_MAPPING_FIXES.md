# MCP ENDPOINT MAPPING FIXES

## Неправильные маршруты в MCP (ИСПРАВИТЬ):

### Основные модули:
- `/api/numerology/analyze` → `/api/numerology/calculate`
- `/api/matrix-destiny/analyze` → `/api/matrix/calculate`  
- `/api/human-design/chart` → `/api/human-design/calculate`
- `/api/vedic/chart` → `/api/jyotish/calculate`

### Solar (требует return_year):
- `/api/solar/calculate` + добавить поле `return_year`

### Progressions (не хватает endpoints):
- `/api/progressions/info` → НЕ СУЩЕСТВУЕТ
- `/api/progressions/compare` → НЕ СУЩЕСТВУЕТ  
- `/api/progressions/timeline` → НЕ СУЩЕСТВУЕТ
- `/api/progressions/aspects` → НЕ СУЩЕСТВУЕТ

### BaZi (рабочие endpoints):
- Все BaZi endpoints ПРАВИЛЬНЫЕ ✅
