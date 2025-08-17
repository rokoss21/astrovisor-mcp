#!/usr/bin/env python3
import requests
import json
import time
from datetime import datetime

# API Configuration
API_BASE = "https://astrovisor.io"
API_KEY = "pk-admin-7-CfrQ_Kvu96sPBIbTH15QEFTQIX1DMq0UJtdwhNXRU"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# Test data
test_person = {
    "name": "Тест Анализ",
    "datetime": "1992-01-21T09:50:00",
    "latitude": 52.9651,
    "longitude": 36.0785,
    "location": "Орел, Россия",
    "timezone": "Europe/Moscow"
}

test_bazi = {
    **test_person,
    "gender": "male"
}

test_progression = {
    **test_person,
    "progression_date": "2025-08-17"
}

# MCP Endpoints mapping to API endpoints
endpoints_map = {
    # Core Astrology (6)
    "calculate_natal_chart": "/api/natal/chart",
    "calculate_vedic_chart": "/api/vedic/chart", 
    "calculate_human_design": "/api/human-design/chart",
    "calculate_numerology": "/api/numerology/analyze",
    "calculate_matrix_of_destiny": "/api/matrix-destiny/analyze",
    "calculate_transits": "/api/transits/calculate",
    
    # Progressions (7)
    "calculate_secondary_progressions": "/api/progressions/secondary",
    "calculate_solar_arc_progressions": "/api/progressions/solar-arc",
    "calculate_tertiary_progressions": "/api/progressions/tertiary",
    "compare_progressions": "/api/progressions/compare",
    "create_progressions_timeline": "/api/progressions/timeline",
    "analyze_progressions_aspects": "/api/progressions/aspects",
    "get_progressions_info": "/api/progressions/info",
    
    # BaZi (15)
    "calculate_bazi_chart": "/api/bazi/chart",
    "analyze_bazi_personality": "/api/bazi/personality",
    "calculate_bazi_compatibility": "/api/bazi/compatibility",
    "get_bazi_info": "/api/bazi/info",
    "analyze_bazi_twelve_palaces": "/api/bazi/twelve-palaces",
    "analyze_bazi_life_focus": "/api/bazi/life-focus",
    "analyze_bazi_symbolic_stars": "/api/bazi/symbolic-stars",
    "calculate_bazi_luck_pillars": "/api/bazi/luck-pillars",
    "calculate_bazi_annual_forecast": "/api/bazi/annual-forecast",
    "get_bazi_complete_analysis": "/api/bazi/complete-analysis",
    "get_bazi_career_guidance": "/api/bazi/career-guidance",
    "get_bazi_relationship_guidance": "/api/bazi/relationship-guidance",
    "get_bazi_health_insights": "/api/bazi/health-insights",
    "analyze_bazi_nayin": "/api/bazi/nayin-analysis",
    "analyze_bazi_useful_god": "/api/bazi/useful-god"
}

def test_endpoint(name, endpoint, data=None, method="POST"):
    """Test single endpoint"""
    url = f"{API_BASE}{endpoint}"
    
    try:
        start_time = time.time()
        
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=10)
        else:
            response = requests.post(url, headers=headers, json=data, timeout=10)
            
        end_time = time.time()
        response_time = round((end_time - start_time) * 1000, 2)
        
        status = "🟢 SUCCESS" if response.status_code == 200 else f"🔴 ERROR {response.status_code}"
        
        # Try to get response size
        try:
            resp_data = response.json()
            data_size = len(json.dumps(resp_data))
        except:
            data_size = len(response.text) if response.text else 0
            
        result = {
            "name": name,
            "endpoint": endpoint,
            "status": status,
            "status_code": response.status_code,
            "response_time": f"{response_time}ms",
            "data_size": f"{data_size}b",
            "success": response.status_code == 200
        }
        
        # Add error details if failed
        if response.status_code != 200:
            try:
                error_data = response.json()
                result["error"] = error_data.get("detail", str(error_data))
            except:
                result["error"] = response.text[:200] if response.text else "Unknown error"
                
        return result
        
    except Exception as e:
        return {
            "name": name,
            "endpoint": endpoint,
            "status": f"🔴 EXCEPTION",
            "status_code": 0,
            "response_time": "timeout",
            "data_size": "0b",
            "success": False,
            "error": str(e)
        }

def run_comprehensive_test():
    """Run comprehensive API test"""
    print("🚀 КОМПЛЕКСНОЕ ТЕСТИРОВАНИЕ ASTROVISOR API")
    print("="*60)
    
    results = []
    categories = {
        "Core Astrology": [
            "calculate_natal_chart", "calculate_vedic_chart", "calculate_human_design",
            "calculate_numerology", "calculate_matrix_of_destiny", "calculate_transits"
        ],
        "Progressions": [
            "calculate_secondary_progressions", "calculate_solar_arc_progressions", 
            "calculate_tertiary_progressions", "compare_progressions",
            "create_progressions_timeline", "analyze_progressions_aspects", "get_progressions_info"
        ],
        "BaZi System": [
            "calculate_bazi_chart", "analyze_bazi_personality", "calculate_bazi_compatibility",
            "get_bazi_info", "analyze_bazi_twelve_palaces", "analyze_bazi_life_focus",
            "analyze_bazi_symbolic_stars", "calculate_bazi_luck_pillars", 
            "calculate_bazi_annual_forecast", "get_bazi_complete_analysis",
            "get_bazi_career_guidance", "get_bazi_relationship_guidance",
            "get_bazi_health_insights", "analyze_bazi_nayin", "analyze_bazi_useful_god"
        ]
    }
    
    # Test each category
    for category, endpoint_names in categories.items():
        print(f"\n🔍 {category.upper()} ({len(endpoint_names)} endpoints)")
        print("-" * 40)
        
        category_results = []
        
        for name in endpoint_names:
            if name not in endpoints_map:
                print(f"❌ {name}: NOT MAPPED")
                continue
                
            endpoint = endpoints_map[name]
            
            # Determine test data and method
            if "info" in name:
                method = "GET"
                data = None
            elif "transits" in name:
                data = {
                    "birth_datetime": test_person["datetime"],
                    "birth_latitude": test_person["latitude"], 
                    "birth_longitude": test_person["longitude"],
                    "birth_location": test_person["location"],
                    "birth_timezone": test_person["timezone"],
                    "target_date": "2025-08-17"
                }
                method = "POST"
            elif "bazi" in name:
                if "compatibility" in name:
                    data = {
                        "person1_name": "Person 1",
                        "person1_datetime": test_person["datetime"],
                        "person1_latitude": test_person["latitude"],
                        "person1_longitude": test_person["longitude"], 
                        "person1_location": test_person["location"],
                        "person1_timezone": test_person["timezone"],
                        "person1_gender": "male",
                        "person2_name": "Person 2",
                        "person2_datetime": "1995-06-15T14:30:00",
                        "person2_latitude": 55.7558,
                        "person2_longitude": 37.6176,
                        "person2_location": "Moscow, Russia", 
                        "person2_timezone": "Europe/Moscow",
                        "person2_gender": "female"
                    }
                elif "annual" in name:
                    data = {**test_bazi, "year": 2025}
                else:
                    data = test_bazi
                method = "POST"
            elif "progression" in name:
                data = test_progression
                method = "POST"
            else:
                data = test_person
                method = "POST"
            
            result = test_endpoint(name, endpoint, data, method)
            category_results.append(result)
            
            # Print result
            status_emoji = "✅" if result["success"] else "❌"
            print(f"{status_emoji} {name}: {result['status']} ({result['response_time']})")
            
            if not result["success"]:
                print(f"   Error: {result.get('error', 'Unknown')[:100]}")
            
            time.sleep(0.5)  # Rate limiting
            
        results.extend(category_results)
        
        # Category summary
        success_count = sum(1 for r in category_results if r["success"])
        total_count = len(category_results)
        success_rate = round(success_count / total_count * 100, 1) if total_count > 0 else 0
        
        print(f"\n📊 {category} Summary: {success_count}/{total_count} ({success_rate}%)")
    
    # Overall summary
    print("\n" + "="*60)
    print("🏆 ОБЩИЕ РЕЗУЛЬТАТЫ")
    print("="*60)
    
    total_success = sum(1 for r in results if r["success"])
    total_endpoints = len(results)
    overall_rate = round(total_success / total_endpoints * 100, 1) if total_endpoints > 0 else 0
    
    print(f"✅ Успешных: {total_success}/{total_endpoints} ({overall_rate}%)")
    print(f"❌ Неудачных: {total_endpoints - total_success}")
    
    # Group by error types
    error_types = {}
    for result in results:
        if not result["success"]:
            status_code = result["status_code"]
            if status_code in error_types:
                error_types[status_code] += 1
            else:
                error_types[status_code] = 1
    
    if error_types:
        print(f"\n🔍 ТИПЫ ОШИБОК:")
        for error_code, count in sorted(error_types.items()):
            if error_code == 404:
                print(f"  📭 404 Not Found: {count} эндпоинтов (не реализованы)")
            elif error_code == 401:
                print(f"  🔐 401 Unauthorized: {count} эндпоинтов")
            elif error_code == 500:
                print(f"  ⚙️ 500 Server Error: {count} эндпоинтов (внутренние ошибки)")
            elif error_code == 422:
                print(f"  📝 422 Validation: {count} эндпоинтов (ошибки валидации)")
            elif error_code == 0:
                print(f"  🌐 Connection Error: {count} эндпоинтов")
            else:
                print(f"  🔍 {error_code}: {count} эндпоинтов")
    
    # Performance metrics
    successful_results = [r for r in results if r["success"]]
    if successful_results:
        response_times = []
        for r in successful_results:
            try:
                time_ms = float(r["response_time"].replace("ms", ""))
                response_times.append(time_ms)
            except:
                continue
                
        if response_times:
            avg_time = round(sum(response_times) / len(response_times), 2)
            min_time = min(response_times)
            max_time = max(response_times)
            
            print(f"\n⚡ ПРОИЗВОДИТЕЛЬНОСТЬ:")
            print(f"  📊 Среднее время ответа: {avg_time}ms")
            print(f"  ⚡ Минимальное: {min_time}ms")
            print(f"  🐌 Максимальное: {max_time}ms")
    
    # Working endpoints list
    working_endpoints = [r["name"] for r in results if r["success"]]
    if working_endpoints:
        print(f"\n✅ РАБОТАЮЩИЕ ЭНДПОИНТЫ ({len(working_endpoints)}):")
        for name in working_endpoints:
            print(f"  • {name}")
    
    # Failed endpoints list  
    failed_endpoints = [(r["name"], r["status_code"], r.get("error", "")) for r in results if not r["success"]]
    if failed_endpoints:
        print(f"\n❌ НЕРАБОТАЮЩИЕ ЭНДПОИНТЫ ({len(failed_endpoints)}):")
        for name, code, error in failed_endpoints:
            error_short = error[:60] + "..." if len(error) > 60 else error
            print(f"  • {name}: {code} - {error_short}")
    
    return results

if __name__ == "__main__":
    run_comprehensive_test()
