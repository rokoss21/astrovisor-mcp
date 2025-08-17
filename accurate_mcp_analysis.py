#!/usr/bin/env python3
"""
Точный анализ MCP инструментов и их API mappings
"""

def analyze_mcp_server():
    """Анализирует MCP сервер на соответствие tools и API mappings"""
    
    with open('/root/astrovisor-mcp/src/index.ts', 'r') as f:
        content = f.read()
    
    # Извлекаем названия всех инструментов из массива tools
    tools_names = []
    import re
    
    # Поиск массива tools
    tools_match = re.search(r'const tools.*?\[(.*?)\];', content, re.DOTALL)
    if tools_match:
        tools_content = tools_match.group(1)
        # Извлекаем все name поля
        names = re.findall(r'name:\s*"([^"]+)"', tools_content)
        tools_names = names
    
    # Извлекаем все case statements
    case_statements = []
    cases = re.findall(r'case\s*"([^"]+)":', content)
    case_statements = cases
    
    print("🔧 ПОЛНЫЙ АНАЛИЗ MCP ИНСТРУМЕНТОВ")
    print("=" * 60)
    print(f"📊 Всего инструментов в массиве tools: {len(tools_names)}")
    print(f"📊 Всего case statements: {len(case_statements)}")
    
    # Проверяем соответствие
    missing_cases = []
    for tool in tools_names:
        if tool not in case_statements:
            missing_cases.append(tool)
    
    extra_cases = []
    for case in case_statements:
        if case not in tools_names:
            extra_cases.append(case)
    
    print(f"\n❌ Инструменты БЕЗ API mapping ({len(missing_cases)}):")
    for tool in missing_cases:
        print(f"   • {tool}")
    
    print(f"\n⚠️  Case statements БЕЗ инструментов ({len(extra_cases)}):")
    for case in extra_cases:
        print(f"   • {case}")
    
    # Анализ работающих endpoints
    working_tools = [tool for tool in tools_names if tool in case_statements]
    print(f"\n✅ РАБОТАЮЩИЕ инструменты ({len(working_tools)}):")
    
    # Группировка по модулям
    modules = {
        'natal': [],
        'jyotish': [],
        'human-design': [],
        'numerology': [],
        'matrix': [],
        'transits': [],
        'progressions': [],
        'bazi': [],
        'solar': [],
        'other': []
    }
    
    for tool in working_tools:
        if 'natal' in tool:
            modules['natal'].append(tool)
        elif 'vedic' in tool or 'jyotish' in tool:
            modules['jyotish'].append(tool)
        elif 'human_design' in tool:
            modules['human-design'].append(tool)
        elif 'numerology' in tool:
            modules['numerology'].append(tool)
        elif 'matrix' in tool:
            modules['matrix'].append(tool)
        elif 'transit' in tool:
            modules['transits'].append(tool)
        elif 'progression' in tool:
            modules['progressions'].append(tool)
        elif 'bazi' in tool:
            modules['bazi'].append(tool)
        elif 'solar' in tool:
            modules['solar'].append(tool)
        else:
            modules['other'].append(tool)
    
    for module, tools in modules.items():
        if tools:
            print(f"\n   🏗️  {module.upper()} ({len(tools)} инструментов):")
            for tool in tools:
                print(f"      • {tool}")
    
    # Анализ API endpoints для работающих инструментов
    print(f"\n🌐 API ENDPOINTS ДЛЯ РАБОТАЮЩИХ ИНСТРУМЕНТОВ:")
    print("=" * 60)
    
    endpoint_pattern = r'case\s*"([^"]+)":\s*.*?endpoint\s*=\s*[\'"]([^\'"]+)[\'"];'
    endpoints = re.findall(endpoint_pattern, content, re.DOTALL)
    
    for tool_name, endpoint in endpoints:
        if tool_name in working_tools:
            print(f"✅ {tool_name:30} -> {endpoint}")
        else:
            print(f"⚠️  {tool_name:30} -> {endpoint} (нет в tools)")
    
    return {
        'tools_count': len(tools_names),
        'cases_count': len(case_statements),
        'working_count': len(working_tools),
        'missing_cases': missing_cases,
        'extra_cases': extra_cases,
        'modules': modules
    }

if __name__ == "__main__":
    result = analyze_mcp_server()
    
    print(f"\n📈 ИТОГОВАЯ СТАТИСТИКА:")
    print("=" * 60)
    print(f"✅ Рабочих инструментов: {result['working_count']}/{result['tools_count']} ({result['working_count']/result['tools_count']*100:.1f}%)")
    print(f"❌ Без API mapping: {len(result['missing_cases'])}")
    print(f"⚠️  Лишних case: {len(result['extra_cases'])}")
