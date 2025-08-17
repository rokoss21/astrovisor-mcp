#!/usr/bin/env python3
"""
Анализ всех MCP инструментов и их параметров
"""
import re

def extract_mcp_tools():
    """Извлекает все MCP инструменты из src/index.ts"""
    
    with open('/root/astrovisor-mcp/src/index.ts', 'r') as f:
        content = f.read()
    
    # Поиск всех tools в массиве tools
    tools_section = re.search(r'const tools.*?\[(.*?)\];', content, re.DOTALL)
    if not tools_section:
        print("❌ Не найден массив tools")
        return
    
    tools_content = tools_section.group(1)
    
    # Поиск всех объектов tools
    tool_pattern = r'\{\s*name:\s*"([^"]+)",\s*description:\s*"([^"]*)",\s*inputSchema:\s*\{(.*?)\}\s*\}'
    tools = re.findall(tool_pattern, tools_content, re.DOTALL)
    
    print("🔧 MCP ИНСТРУМЕНТЫ И ИХ ПАРАМЕТРЫ")
    print("=" * 60)
    
    for i, (name, description, schema) in enumerate(tools, 1):
        print(f"\n{i}. 🛠️  {name}")
        print(f"   📝 Описание: {description}")
        
        # Извлекаем properties
        properties_match = re.search(r'properties:\s*\{(.*?)\}', schema, re.DOTALL)
        if properties_match:
            properties_content = properties_match.group(1)
            
            # Обработка ...birthDataSchema
            if '...birthDataSchema' in properties_content:
                print("   📋 Параметры: Базовые параметры рождения + дополнительные:")
                print("      🔹 name (string) - Имя")
                print("      🔹 datetime (string) - Дата и время рождения (ISO 8601)")
                print("      🔹 latitude (number) - Широта рождения")
                print("      🔹 longitude (number) - Долгота рождения")
                print("      🔹 location (string) - Место рождения")
                print("      🔹 timezone (string) - Часовой пояс")
            else:
                print("   📋 Параметры:")
            
            # Ищем дополнительные параметры
            additional_params = re.findall(r'(\w+):\s*\{\s*type:\s*"([^"]+)"[^}]*description:\s*"([^"]*)"', properties_content)
            for param_name, param_type, param_desc in additional_params:
                print(f"      🔹 {param_name} ({param_type}) - {param_desc}")
        
        # Извлекаем required поля
        required_match = re.search(r'required:\s*\[(.*?)\]', schema, re.DOTALL)
        if required_match:
            required_content = required_match.group(1)
            required_fields = re.findall(r'"([^"]+)"', required_content)
            print(f"   ✅ Обязательные поля: {', '.join(required_fields)}")
    
    return tools

def extract_api_mappings():
    """Извлекает маппинг MCP tools -> API endpoints"""
    
    with open('/root/astrovisor-mcp/src/index.ts', 'r') as f:
        content = f.read()
    
    # Поиск switch statement для callTool
    switch_match = re.search(r'switch\s*\(name\)\s*\{(.*?)\}', content, re.DOTALL)
    if not switch_match:
        print("❌ Не найден switch statement")
        return
    
    switch_content = switch_match.group(1)
    
    # Извлекаем case statements
    case_pattern = r'case\s*"([^"]+)":\s*.*?endpoint\s*=\s*[\'"]([^\'"]+)[\'"];(.*?)break;'
    cases = re.findall(case_pattern, switch_content, re.DOTALL)
    
    print("\n🌐 МАППИНГ MCP -> API ENDPOINTS")
    print("=" * 60)
    
    for i, (tool_name, endpoint, case_body) in enumerate(cases, 1):
        print(f"\n{i}. 🔧 {tool_name}")
        print(f"   🌍 API Endpoint: {endpoint}")
        
        # Анализ метода HTTP
        if 'method = \'GET\'' in case_body:
            print("   📡 HTTP Method: GET")
        else:
            print("   📡 HTTP Method: POST")
        
        # Анализ трансформации данных
        if 'requestData = {' in case_body:
            print("   🔄 Трансформация данных: ДА")
            # Извлекаем ключевые трансформации
            if 'birth_datetime' in case_body:
                print("      ➡️ datetime -> birth_datetime")
            if 'person1:' in case_body:
                print("      ➡️ Плоская структура -> Вложенные объекты person1/person2")
        elif 'requestData = args' in case_body:
            print("   🔄 Трансформация данных: НЕТ (прямая передача)")
    
    return cases

def main():
    """Главная функция анализа"""
    print("📊 ПОЛНЫЙ АНАЛИЗ MCP СЕРВЕРА ASTROVISOR")
    print("=" * 60)
    
    # Анализ инструментов
    tools = extract_mcp_tools()
    
    # Анализ маппинга API
    mappings = extract_api_mappings()
    
    # Статистика
    print(f"\n📈 СТАТИСТИКА")
    print("=" * 60)
    print(f"🔧 Всего MCP инструментов: {len(tools)}")
    print(f"🌐 Всего API маппингов: {len(mappings)}")
    
    # Группировка по модулям
    modules = {}
    for tool_name, endpoint, _ in mappings:
        module = endpoint.split('/')[2] if len(endpoint.split('/')) > 2 else 'unknown'
        if module not in modules:
            modules[module] = []
        modules[module].append(tool_name)
    
    print(f"\n🏗️  МОДУЛИ API:")
    for module, tools in modules.items():
        print(f"   {module.upper()}: {len(tools)} инструментов")
        for tool in tools:
            print(f"      • {tool}")
    
    print(f"\n⏰ Анализ завершен!")

if __name__ == "__main__":
    main()
