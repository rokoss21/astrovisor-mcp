#!/usr/bin/env python3
"""
Обновление версии пакета с BaZi поддержкой
"""
import json

# Читаем package.json
with open('package.json', 'r') as f:
    package_data = json.load(f)

# Обновляем версию (1.1.5 -> 1.2.0 - minor версия для новых фич)
current_version = package_data['version']
new_version = '1.2.0'

print(f"📦 Обновление версии: {current_version} -> {new_version}")

# Обновляем данные пакета
package_data['version'] = new_version
package_data['description'] = "Astrovisor MCP Server - Professional astrology tools for Claude Desktop via MCP protocol. Now with BaZi Chinese Astrology (四柱八字)! Created by Emil Rokossovskiy."

# Добавляем ключевые слова
package_data['keywords'] = [
    "astrology", 
    "mcp", 
    "claude", 
    "ai", 
    "bazi", 
    "chinese-astrology",
    "four-pillars",
    "natal-chart",
    "compatibility",
    "personality-analysis"
]

# Сохраняем обновленный package.json
with open('package.json', 'w') as f:
    json.dump(package_data, f, indent=2)

print("✅ package.json обновлен")
print(f"✅ Новая версия: {new_version}")
print("✅ Описание обновлено с упоминанием BaZi")
print("✅ Добавлены ключевые слова")
