#!/usr/bin/env python3
import json

# Читаем package.json
with open('package.json', 'r') as f:
    package_data = json.load(f)

# Обновляем до major версии 1.3.0 (15 BaZi инструментов - это major feature!)
package_data['version'] = '1.3.0'
package_data['description'] = "Astrovisor MCP Server - Complete astrology suite for Claude Desktop. 30 tools total: 15 Western + 15 BaZi Chinese Astrology (四柱八字) tools covering all aspects of Four Pillars analysis! Created by Emil Rokossovskiy."

# Обновляем ключевые слова
package_data['keywords'] = [
    "astrology", "mcp", "claude", "ai", "bazi", "chinese-astrology", "four-pillars",
    "natal-chart", "compatibility", "personality-analysis", "career-guidance", 
    "health-insights", "luck-pillars", "nayin", "useful-god", "twelve-palaces",
    "symbolic-stars", "annual-forecast", "life-focus", "relationship-guidance"
]

# Сохраняем
with open('package.json', 'w') as f:
    json.dump(package_data, f, indent=2)

print("🚀 Обновлено до версии 1.3.0 - MAJOR RELEASE!")
print("📊 30 инструментов (15 западных + 15 BaZi)")
print("🐉 Полное покрытие китайской астрологии BaZi")
