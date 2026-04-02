"""
Test suite for Calculator v3 Upgrade features:
- Packages (Perus/Suositeltu/Premium) per service
- Auto-triggers based on user selections
- Addons with group/badge/warning fields
- Updated CTA text and price box context
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCalculatorConfigAPI:
    """Test /api/calculator-config endpoint for v3 upgrade features"""
    
    def test_calculator_config_returns_200(self):
        """API should return 200 status"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        assert response.status_code == 200
        print("✓ /api/calculator-config returns 200")
    
    def test_services_have_packages_array(self):
        """Each service should have packages array with 3 packages"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        data = response.json()
        
        for service in data.get('services', []):
            packages = service.get('packages', [])
            assert len(packages) == 3, f"Service {service['id']} should have 3 packages, got {len(packages)}"
            
            # Check package structure
            for pkg in packages:
                assert 'id' in pkg, f"Package missing 'id' in {service['id']}"
                assert 'label' in pkg, f"Package missing 'label' in {service['id']}"
                assert 'addon_ids' in pkg, f"Package missing 'addon_ids' in {service['id']}"
        
        print("✓ All services have packages array with 3 packages")
    
    def test_packages_have_perus_suositeltu_premium(self):
        """Each service should have Perus, Suositeltu, Premium packages"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        data = response.json()
        
        for service in data.get('services', []):
            package_ids = [p['id'] for p in service.get('packages', [])]
            assert 'perus' in package_ids, f"Service {service['id']} missing 'perus' package"
            assert 'suositeltu' in package_ids, f"Service {service['id']} missing 'suositeltu' package"
            assert 'premium' in package_ids, f"Service {service['id']} missing 'premium' package"
        
        print("✓ All services have Perus/Suositeltu/Premium packages")
    
    def test_suositeltu_package_is_default(self):
        """Suositeltu package should have default: true"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        data = response.json()
        
        for service in data.get('services', []):
            suositeltu = next((p for p in service.get('packages', []) if p['id'] == 'suositeltu'), None)
            assert suositeltu is not None, f"Service {service['id']} missing suositeltu package"
            assert suositeltu.get('default') == True, f"Service {service['id']} suositeltu should have default=true"
        
        print("✓ Suositeltu package has default=true for all services")
    
    def test_services_have_auto_triggers(self):
        """Each service should have auto_triggers array"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        data = response.json()
        
        for service in data.get('services', []):
            auto_triggers = service.get('auto_triggers', [])
            assert isinstance(auto_triggers, list), f"Service {service['id']} auto_triggers should be a list"
            
            # Check auto_trigger structure
            for trigger in auto_triggers:
                assert 'if_step' in trigger, f"Auto-trigger missing 'if_step' in {service['id']}"
                assert 'if_values' in trigger, f"Auto-trigger missing 'if_values' in {service['id']}"
                assert 'enable_addons' in trigger, f"Auto-trigger missing 'enable_addons' in {service['id']}"
        
        print("✓ All services have auto_triggers array with correct structure")
    
    def test_addons_have_group_field(self):
        """Addons should have group field (esityot, tarvittaessa, lisapalvelut)"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        data = response.json()
        
        valid_groups = ['esityot', 'tarvittaessa', 'lisapalvelut']
        
        for service in data.get('services', []):
            for addon in service.get('addons', []):
                group = addon.get('group')
                assert group in valid_groups, f"Addon {addon['id']} in {service['id']} has invalid group: {group}"
        
        print("✓ All addons have valid group field")
    
    def test_addons_have_badge_field(self):
        """Some addons should have badge field (Suositeltu, Usein valitaan)"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        data = response.json()
        
        badges_found = set()
        for service in data.get('services', []):
            for addon in service.get('addons', []):
                badge = addon.get('badge')
                if badge:
                    badges_found.add(badge)
        
        assert 'Suositeltu' in badges_found, "No addon has 'Suositeltu' badge"
        assert 'Usein valitaan' in badges_found, "No addon has 'Usein valitaan' badge"
        
        print(f"✓ Found badges: {badges_found}")
    
    def test_addons_have_warning_field(self):
        """Some addons should have warning field"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        data = response.json()
        
        warnings_found = 0
        for service in data.get('services', []):
            for addon in service.get('addons', []):
                if addon.get('warning'):
                    warnings_found += 1
        
        assert warnings_found > 0, "No addon has warning field"
        print(f"✓ Found {warnings_found} addons with warning field")


class TestKattomaalausAutoTriggers:
    """Test Kattomaalaus specific auto-triggers"""
    
    def test_kattomaalaus_moss_trigger(self):
        """Kattomaalaus: selecting 'moss' condition should trigger wash + moss_treatment"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        data = response.json()
        
        kattomaalaus = next((s for s in data.get('services', []) if s['id'] == 'kattomaalaus'), None)
        assert kattomaalaus is not None, "Kattomaalaus service not found"
        
        # Find the moss trigger
        moss_trigger = next((t for t in kattomaalaus.get('auto_triggers', []) 
                            if 'moss' in t.get('if_values', [])), None)
        assert moss_trigger is not None, "Moss auto-trigger not found"
        
        # Check it enables wash and moss_treatment
        enabled_addons = moss_trigger.get('enable_addons', [])
        assert 'wash' in enabled_addons, "Moss trigger should enable 'wash'"
        assert 'moss_treatment' in enabled_addons, "Moss trigger should enable 'moss_treatment'"
        
        print("✓ Kattomaalaus moss trigger enables wash + moss_treatment")
    
    def test_kattomaalaus_has_3_packages(self):
        """Kattomaalaus should have 3 packages with correct addon_ids"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        data = response.json()
        
        kattomaalaus = next((s for s in data.get('services', []) if s['id'] == 'kattomaalaus'), None)
        packages = kattomaalaus.get('packages', [])
        
        # Check Perus package
        perus = next((p for p in packages if p['id'] == 'perus'), None)
        assert 'wash' in perus.get('addon_ids', []), "Perus should include wash"
        
        # Check Suositeltu package
        suositeltu = next((p for p in packages if p['id'] == 'suositeltu'), None)
        assert 'wash' in suositeltu.get('addon_ids', []), "Suositeltu should include wash"
        assert 'moss_treatment' in suositeltu.get('addon_ids', []), "Suositeltu should include moss_treatment"
        assert suositeltu.get('default') == True, "Suositeltu should be default"
        
        # Check Premium package
        premium = next((p for p in packages if p['id'] == 'premium'), None)
        assert len(premium.get('addon_ids', [])) > len(suositeltu.get('addon_ids', [])), "Premium should have more addons than Suositeltu"
        
        print("✓ Kattomaalaus packages have correct addon_ids")


class TestSisamaalausAutoTriggers:
    """Test Sisämaalaus specific auto-triggers"""
    
    def test_sisamaalaus_minor_condition_trigger(self):
        """Sisämaalaus: selecting 'minor' condition should trigger halkeamien_korjaus"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        data = response.json()
        
        sisamaalaus = next((s for s in data.get('services', []) if s['id'] == 'sisamaalaus'), None)
        assert sisamaalaus is not None, "Sisämaalaus service not found"
        
        # Find the minor trigger
        minor_trigger = next((t for t in sisamaalaus.get('auto_triggers', []) 
                             if 'minor' in t.get('if_values', [])), None)
        assert minor_trigger is not None, "Minor condition auto-trigger not found"
        
        # Check it enables halkeamien_korjaus
        enabled_addons = minor_trigger.get('enable_addons', [])
        assert 'halkeamien_korjaus' in enabled_addons, "Minor trigger should enable 'halkeamien_korjaus'"
        
        print("✓ Sisämaalaus minor condition trigger enables halkeamien_korjaus")


class TestJulkisivumaalausAutoTriggers:
    """Test Julkisivumaalaus specific auto-triggers"""
    
    def test_julkisivumaalaus_heavy_condition_trigger(self):
        """Julkisivumaalaus: selecting 'heavy' condition should trigger vanhan_maalin_poisto + halkeamien_korjaus"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        data = response.json()
        
        julkisivumaalaus = next((s for s in data.get('services', []) if s['id'] == 'julkisivumaalaus'), None)
        assert julkisivumaalaus is not None, "Julkisivumaalaus service not found"
        
        # Find triggers for heavy condition
        heavy_triggers = [t for t in julkisivumaalaus.get('auto_triggers', []) 
                         if 'heavy' in t.get('if_values', [])]
        
        all_enabled = []
        for trigger in heavy_triggers:
            all_enabled.extend(trigger.get('enable_addons', []))
        
        assert 'vanhan_maalin_poisto' in all_enabled, "Heavy trigger should enable 'vanhan_maalin_poisto'"
        assert 'halkeamien_korjaus' in all_enabled, "Heavy trigger should enable 'halkeamien_korjaus'"
        
        print("✓ Julkisivumaalaus heavy condition trigger enables vanhan_maalin_poisto + halkeamien_korjaus")


class TestMikrosementtiAutoTriggers:
    """Test Mikrosementti specific auto-triggers"""
    
    def test_mikrosementti_bathroom_trigger(self):
        """Mikrosementti: selecting 'bathroom' target_type should trigger vedeneristys"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        data = response.json()
        
        mikrosementti = next((s for s in data.get('services', []) if s['id'] == 'mikrosementti'), None)
        assert mikrosementti is not None, "Mikrosementti service not found"
        
        # Find the bathroom trigger
        bathroom_trigger = next((t for t in mikrosementti.get('auto_triggers', []) 
                                if 'bathroom' in t.get('if_values', [])), None)
        assert bathroom_trigger is not None, "Bathroom auto-trigger not found"
        
        # Check it enables vedeneristys
        enabled_addons = bathroom_trigger.get('enable_addons', [])
        assert 'vedeneristys' in enabled_addons, "Bathroom trigger should enable 'vedeneristys'"
        
        print("✓ Mikrosementti bathroom trigger enables vedeneristys")


class TestAddonGroups:
    """Test addon grouping structure"""
    
    def test_all_services_have_grouped_addons(self):
        """All services should have addons in esityot, tarvittaessa, or lisapalvelut groups"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        data = response.json()
        
        for service in data.get('services', []):
            groups_found = set()
            for addon in service.get('addons', []):
                group = addon.get('group')
                if group:
                    groups_found.add(group)
            
            # Each service should have at least 2 different groups
            assert len(groups_found) >= 2, f"Service {service['id']} should have addons in at least 2 groups, found: {groups_found}"
        
        print("✓ All services have addons in multiple groups")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
