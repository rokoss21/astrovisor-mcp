#!/usr/bin/env python3
"""
Сравнение документации API с MCP инструментами
"""
import re

def extract_mcp_endpoints():
    """Извлекает endpoints из MCP сервера"""
    with open('/root/astrovisor-mcp/src/index.ts', 'r') as f:
        content = f.read()
    
    endpoint_pattern = r'case\s*"([^"]+)":\s*.*?endpoint\s*=\s*[\'"]([^\'"]+)[\'"];'
    endpoints = re.findall(endpoint_pattern, content, re.DOTALL)
    
    mcp_endpoints = {}
    for tool_name, endpoint in endpoints:
        mcp_endpoints[endpoint] = tool_name
    
    return mcp_endpoints

def analyze_documentation():
    """Анализирует предоставленную документацию API"""
    
    # API endpoints из документации
    docs_endpoints = {
        # Натальная астрология
        "/api/natal/chart": "POST - Расчет натальной карты",
        "/api/natal/info": "GET - Информация о натальной астрологии",
        
        # Ведическая астрология  
        "/api/jyotish/calculate": "POST - Расчет ведической карты",
        "/api/jyotish/info": "GET - Информация о ведической астрологии",
        
        # Соляр
        "/api/solar/return": "POST - Расчет соляра",
        "/api/solar/info": "GET - Информация о солярах", 
        "/api/solar/lunar-return": "POST - Расчет лунного возвращения",
        
        # Прогрессии
        "/api/progressions/secondary": "POST - Расчет вторичных прогрессий",
        "/api/progressions/info": "GET - Информация о прогрессиях",
        "/api/progressions/solar-arc": "POST - Расчет солнечно-дуговых прогрессий",
        "/api/progressions/tertiary": "POST - Расчет третичных прогрессий",
        "/api/progressions/compare": "POST - Сравнение прогрессий",
        "/api/progressions/timeline": "POST - Временная линия прогрессий",
        "/api/progressions/aspects": "POST - Аспекты прогрессий",
        
        # Солярные дуги
        "/api/directions/calculate": "POST - Расчет солярных дуг",
        "/api/directions/info": "GET - Информация о солярных дугах",
        
        # Анализ отношений
        "/api/relationship/synastry": "POST - Анализ синастрии",
        "/api/relationship/composite": "POST - Композитная карта",
        "/api/relationship/info": "GET - Информация об анализе отношений",
        
        # Астрокартография
        "/api/astrocartography/world-map": "POST - Астрокартографическая карта мира",
        "/api/astrocartography/best-places": "POST - Поиск лучших мест",
        "/api/astrocartography/info": "GET - Информация об астрокартографии",
        
        # Элективная астрология
        "/api/electional/find-best-times": "POST - Поиск благоприятных дат",
        "/api/electional/info": "GET - Информация об элективной астрологии",
        
        # Хорарная астрология
        "/api/horary/analyze-question": "POST - Анализ хорарного вопроса",
        "/api/horary/info": "GET - Информация о хорарной астрологии",
        
        # Нумерология
        "/api/numerology/calculate": "POST - Нумерологический анализ",
        "/api/numerology/info": "GET - Информация о нумерологии",
        
        # Матрица Судьбы
        "/api/matrix/calculate": "POST - Расчет Матрицы Судьбы",
        "/api/matrix/info": "GET - Информация о Матрице Судьбы",
        
        # Дизайн Человека
        "/api/human-design/calculate": "POST - Расчет Дизайна Человека",
        "/api/human-design/info": "GET - Информация о Дизайне Человека",
        
        # Транзиты
        "/api/transits/calculate": "POST - Рассчитать транзиты на указанную дату",
        "/api/transits/period": "POST - Найти транзиты в периоде",
        "/api/transits/info": "GET - Информация о модуле транзитов",
        
        # BaZi - Китайская астрология
        "/api/bazi/chart": "POST - Create Bazi Chart",
        "/api/bazi/personality": "POST - Analyze Personality",
        "/api/bazi/compatibility": "POST - Analyze Compatibility",
        "/api/bazi/info": "GET - Get Bazi Info",
        "/api/bazi/twelve-palaces": "POST - Analyze Twelve Palaces",
        "/api/bazi/life-focus": "POST - Get Life Focus Analysis",
        "/api/bazi/symbolic-stars": "POST - Analyze Symbolic Stars",
        "/api/bazi/luck-pillars": "POST - Analyze Luck Pillars",
        "/api/bazi/annual-forecast": "POST - Get Annual Forecast",
        "/api/bazi/career-guidance": "POST - Get Career Guidance Endpoint",
        "/api/bazi/relationship-guidance": "POST - Get Relationship Guidance Endpoint",
        "/api/bazi/health-insights": "POST - Get Health Insights Endpoint",
        "/api/bazi/nayin-analysis": "POST - Get Nayin Analysis Endpoint",
        "/api/bazi/useful-god": "POST - Analyze Useful God Endpoint"
    }
    
    return docs_endpoints

def main():
    """Главная функция сравнения"""
    print("🔍 СРАВНЕНИЕ API ДОКУМЕНТАЦИИ С MCP СЕРВЕРОМ")
    print("=" * 70)
    
    mcp_endpoints = extract_mcp_endpoints()
    docs_endpoints = analyze_documentation()
    
    print(f"📋 API документация: {len(docs_endpoints)} endpoints")
    print(f"🔧 MCP сервер: {len(mcp_endpoints)} endpoints")
    
    # Проверка соответствия
    print(f"\n✅ ENDPOINTS В ОБЕИХ СИСТЕМАХ:")
    print("-" * 50)
    both_count = 0
    for endpoint in sorted(docs_endpoints.keys()):
        if endpoint in mcp_endpoints:
            both_count += 1
            print(f"✓ {endpoint:35} -> {mcp_endpoints[endpoint]}")
    
    print(f"\n❌ ENDPOINTS ТОЛЬКО В ДОКУМЕНТАЦИИ:")
    print("-" * 50)
    docs_only_count = 0
    for endpoint in sorted(docs_endpoints.keys()):
        if endpoint not in mcp_endpoints:
            docs_only_count += 1
            print(f"- {endpoint:35} -> {docs_endpoints[endpoint]}")
    
    print(f"\n⚠️  ENDPOINTS ТОЛЬКО В MCP:")
    print("-" * 50)
    mcp_only_count = 0
    for endpoint in sorted(mcp_endpoints.keys()):
        if endpoint not in docs_endpoints:
            mcp_only_count += 1
            print(f"+ {endpoint:35} -> {mcp_endpoints[endpoint]}")
    
    print(f"\n📊 СТАТИСТИКА СООТВЕТСТВИЯ:")
    print("=" * 70)
    print(f"✅ В обеих системах: {both_count}")
    print(f"❌ Только в документации: {docs_only_count}")
    print(f"⚠️  Только в MCP: {mcp_only_count}")
    print(f"📈 Покрытие MCP: {(both_count/(both_count + docs_only_count))*100:.1f}%")
    
    # Анализ по модулям
    print(f"\n🏗️  АНАЛИЗ ПО МОДУЛЯМ:")
    print("=" * 70)
    
    modules = {}
    for endpoint in docs_endpoints.keys():
        module = endpoint.split('/')[2] if len(endpoint.split('/')) > 2 else 'unknown'
        if module not in modules:
            modules[module] = {'total': 0, 'covered': 0}
        modules[module]['total'] += 1
        if endpoint in mcp_endpoints:
            modules[module]['covered'] += 1
    
    for module, stats in sorted(modules.items()):
        coverage = (stats['covered'] / stats['total']) * 100
        status = "✅" if coverage == 100 else "⚠️" if coverage >= 80 else "❌"
        print(f"{status} {module.upper():20} {stats['covered']:2}/{stats['total']:2} ({coverage:5.1f}%)")

if __name__ == "__main__":
    main()
