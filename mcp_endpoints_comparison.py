#!/usr/bin/env python3
"""
Сравнение MCP инструментов с реальными endpoints
"""
import requests
import json
import re

API_BASE = "https://astrovisor.io/api"
API_KEY = "pk-admin-7-CfrQ_Kvu96sPBIbTH15QEFTQIX1DMq0UJtdwhNXRU"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {API_KEY}"
}

# Читаем MCP инструменты
with open('/root/astrovisor-mcp/src/index.ts', 'r') as f:
    mcp_content = f.read()

# Извлекаем endpoints из MCP
mcp_endpoints = re.findall(r"endpoint = '(/api/[^']+)'", mcp_content)
mcp_endpoints = list(set(mcp_endpoints))  # убираем дубли
mcp_endpoints.sort()

print("🔍 АНАЛИЗ MCP vs РЕАЛЬНЫЕ ENDPOINTS")
print("=" * 60)

# Тестовые данные
test_data = {
    "name": "Test User",
    "datetime": "1988-07-12T12:15:00",
    "latitude": 55.0084,
    "longitude": 82.9357,
    "location": "Novosibirsk, Russia",
    "timezone": "Asia/Novosibirsk",
    "gender": "male"
}

print("📋 MCP ENDPOINTS НАЙДЕНО:", len(mcp_endpoints))
print()

correct_mappings = []
incorrect_mappings = []
missing_endpoints = []

# Проверяем каждый MCP endpoint
for endpoint in mcp_endpoints:
    print(f"Testing MCP {endpoint}...", end=" ")
    
    try:
        # Специальные случаи
        if "compatibility" in endpoint:
            data = {
                "person1": test_data.copy(),
                "person2": {**test_data, "datetime": "1990-03-15T14:30:00", "gender": "female"}
            }
        elif "transits" in endpoint:
            data = {
                **test_data,
                "target_date": "2024-01-15",
                "birth_datetime": test_data["datetime"],
                "birth_latitude": test_data["latitude"],
                "birth_longitude": test_data["longitude"],
                "birth_location": test_data["location"],
                "birth_timezone": test_data["timezone"]
            }
        elif "progressions" in endpoint:
            data = {**test_data, "progression_date": "2024-07-12"}
        elif "info" in endpoint:
            response = requests.get(f"{API_BASE}{endpoint}", headers=headers, timeout=10)
            if response.status_code == 200:
                print("✅ OK (GET)")
                correct_mappings.append(endpoint)
            else:
                print(f"❌ FAILED ({response.status_code})")
                incorrect_mappings.append((endpoint, response.status_code))
            continue
        else:
            data = test_data.copy()
            
        response = requests.post(f"{API_BASE}{endpoint}", headers=headers, json=data, timeout=10)
        
        if response.status_code == 200:
            print("✅ OK")
            correct_mappings.append(endpoint)
        elif response.status_code == 404:
            print("❌ NOT FOUND")
            missing_endpoints.append(endpoint)
        else:
            print(f"❌ FAILED ({response.status_code})")
            incorrect_mappings.append((endpoint, response.status_code))
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)[:50]}...")
        incorrect_mappings.append((endpoint, "ERROR"))

print("\n" + "=" * 60)
print("📊 MCP ENDPOINTS ANALYSIS")
print("=" * 60)

total = len(mcp_endpoints)
correct = len(correct_mappings)
missing = len(missing_endpoints)
incorrect = len(incorrect_mappings)

print(f"✅ Правильно работают: {correct}/{total} ({(correct/total)*100:.1f}%)")
print(f"🚫 Не найдены (404): {missing}")
print(f"❌ Другие ошибки: {incorrect}")

if missing_endpoints:
    print("\n🚨 ОТСУТСТВУЮЩИЕ ENDPOINTS:")
    for ep in missing_endpoints:
        print(f"  • {ep}")

if incorrect_mappings:
    print("\n⚠️ ПРОБЛЕМНЫЕ ENDPOINTS:")
    for ep, status in incorrect_mappings:
        print(f"  • {ep} - {status}")

