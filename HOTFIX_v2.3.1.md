# 🚨 HOTFIX v2.3.1 - Исправлен NPM executable

## Проблема в v2.3.0:
Пакет astrovisor-mcp@2.3.0 не запускался через npx из-за отсутствия shebang в исполняемом файле.

**Ошибка:**
```
import: command not found
const: command not found
syntax error near unexpected token '{'
```

## ✅ Решение - Используйте v2.3.1:

Обновите ваш файл конфигурации Claude Desktop:

### 📁 Windows: `%APPDATA%\Claude\claude_desktop_config.json`
### 📁 macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
### 📁 Linux: `~/.config/claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "astrovisor": {
      "command": "npx",
      "args": ["-y", "astrovisor-mcp@2.3.1"],
      "env": {
        "ASTRO_API_KEY": "your-api-key-here",
        "ASTRO_API_BASE_URL": "http://localhost:8000"
      }
    }
  }
}
```

## 🔧 Что исправлено в v2.3.1:

- ✅ Добавлен `#!/usr/bin/env node` shebang в исполняемый файл
- ✅ Исправлена ошибка "import: command not found" 
- ✅ NPM пакет теперь корректно запускается через npx
- ✅ Все 28 астрологических инструментов работают как ожидается

## 🌟 Полные возможности v2.3.1:

### 28 Professional Astrology Tools:
- **6 Core Astrology**: Natal, Vedic, Human Design, Numerology, Matrix of Destiny, Transits
- **7 NEW Progressions**: Secondary, Solar Arc, Tertiary, Compare, Timeline, Aspects, Info
- **15 Complete BaZi**: Four Pillars, Luck Pillars, Symbolic Stars, Career, Relationships, Health

### Restart Claude Desktop:
После обновления конфигурации обязательно перезапустите Claude Desktop для применения изменений.

## ✅ Verification:
После перезапуска Claude Desktop попробуйте:

```
"Get progressions info to explain the methodology"
```

Или:

```
"Calculate my secondary progressions for today"
```

---

**Sorry for the inconvenience! v2.3.1 is now fully functional!** 🌟
