"""
Test Calculator Admin Panel and Area Step Changes (Iteration 24)
Tests:
1. Admin panel with 3 tabs (Perustiedot, Lisäpalvelut, Paketit)
2. Addon CRUD in admin
3. Package management in admin
4. Kattomaalaus area step = slider with dont_know_options
5. Julkisivumaalaus area step = slider with dont_know_options (EXPECTED TO FAIL - currently size_cards)
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://hintalaskuri-dynamic.preview.emergentagent.com')

class TestAdminAuth:
    """Admin authentication tests"""
    
    def test_admin_login_success(self):
        """Test admin login with correct credentials"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin",
            "password": "jbadmin2024"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["username"] == "admin"
        print("✓ Admin login successful")
    
    def test_admin_login_invalid(self):
        """Test admin login with wrong credentials"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Invalid login rejected")


class TestCalculatorConfig:
    """Calculator config API tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for admin requests"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin",
            "password": "jbadmin2024"
        })
        return response.json().get("access_token")
    
    def test_public_calculator_config(self):
        """Test public calculator config endpoint"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        assert response.status_code == 200
        data = response.json()
        assert "services" in data
        assert "global_settings" in data
        print(f"✓ Public config has {len(data['services'])} services")
    
    def test_admin_calculator_config(self, auth_token):
        """Test admin calculator config endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/admin/calculator-config",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "services" in data
        print("✓ Admin config endpoint accessible")
    
    def test_all_services_have_packages(self):
        """Test that all services have 3 packages"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        data = response.json()
        
        for service in data["services"]:
            packages = service.get("packages", [])
            assert len(packages) == 3, f"{service['name']} should have 3 packages, has {len(packages)}"
            
            # Check package structure
            package_ids = [p["id"] for p in packages]
            assert "perus" in package_ids, f"{service['name']} missing 'perus' package"
            assert "suositeltu" in package_ids, f"{service['name']} missing 'suositeltu' package"
            assert "premium" in package_ids, f"{service['name']} missing 'premium' package"
            
            # Check default package
            default_packages = [p for p in packages if p.get("default")]
            assert len(default_packages) == 1, f"{service['name']} should have exactly 1 default package"
            
            print(f"✓ {service['name']}: 3 packages with correct structure")
    
    def test_all_services_have_addons_with_groups(self):
        """Test that all addons have group field"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        data = response.json()
        
        valid_groups = ["esityot", "tarvittaessa", "lisapalvelut"]
        
        for service in data["services"]:
            for addon in service.get("addons", []):
                group = addon.get("group")
                assert group in valid_groups, f"Addon '{addon['label']}' has invalid group: {group}"
            
            print(f"✓ {service['name']}: All addons have valid groups")


class TestKattomaalausAreaStep:
    """Test Kattomaalaus area step is slider with dont_know_options"""
    
    def test_kattomaalaus_area_is_slider(self):
        """Kattomaalaus area step should be slider type"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        data = response.json()
        
        katto = next((s for s in data["services"] if s["id"] == "kattomaalaus"), None)
        assert katto is not None, "Kattomaalaus service not found"
        
        area_step = next((s for s in katto["steps"] if s["id"] == "area"), None)
        assert area_step is not None, "Area step not found in Kattomaalaus"
        
        assert area_step["type"] == "slider", f"Area step type should be 'slider', got '{area_step['type']}'"
        print("✓ Kattomaalaus area step is slider type")
    
    def test_kattomaalaus_area_has_dont_know_options(self):
        """Kattomaalaus area step should have dont_know_options"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        data = response.json()
        
        katto = next((s for s in data["services"] if s["id"] == "kattomaalaus"), None)
        area_step = next((s for s in katto["steps"] if s["id"] == "area"), None)
        
        dont_know = area_step.get("dont_know_options", [])
        assert len(dont_know) >= 3, f"Should have at least 3 dont_know_options, got {len(dont_know)}"
        
        # Check structure
        for opt in dont_know:
            assert "id" in opt, "dont_know_option missing 'id'"
            assert "label" in opt, "dont_know_option missing 'label'"
            assert "area_value" in opt, "dont_know_option missing 'area_value'"
        
        print(f"✓ Kattomaalaus has {len(dont_know)} dont_know_options")
    
    def test_kattomaalaus_area_title_contains_pohjapinta_ala(self):
        """Kattomaalaus area step title should contain 'pohjapinta-ala'"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        data = response.json()
        
        katto = next((s for s in data["services"] if s["id"] == "kattomaalaus"), None)
        area_step = next((s for s in katto["steps"] if s["id"] == "area"), None)
        
        title = area_step.get("title", "")
        assert "pohjapinta-ala" in title.lower(), f"Title should contain 'pohjapinta-ala', got '{title}'"
        print(f"✓ Kattomaalaus area title: '{title}'")


class TestJulkisivumaalausAreaStep:
    """Test Julkisivumaalaus area step - EXPECTED TO FAIL (currently size_cards, should be slider)"""
    
    def test_julkisivumaalaus_area_is_slider(self):
        """Julkisivumaalaus area step should be slider type (EXPECTED TO FAIL)"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        data = response.json()
        
        julkisivu = next((s for s in data["services"] if s["id"] == "julkisivumaalaus"), None)
        assert julkisivu is not None, "Julkisivumaalaus service not found"
        
        area_step = next((s for s in julkisivu["steps"] if s["id"] == "area"), None)
        assert area_step is not None, "Area step not found in Julkisivumaalaus"
        
        # This test is expected to FAIL - currently size_cards, should be slider
        assert area_step["type"] == "slider", f"Area step type should be 'slider', got '{area_step['type']}'"
        print("✓ Julkisivumaalaus area step is slider type")
    
    def test_julkisivumaalaus_area_has_dont_know_options(self):
        """Julkisivumaalaus area step should have dont_know_options (EXPECTED TO FAIL)"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        data = response.json()
        
        julkisivu = next((s for s in data["services"] if s["id"] == "julkisivumaalaus"), None)
        area_step = next((s for s in julkisivu["steps"] if s["id"] == "area"), None)
        
        dont_know = area_step.get("dont_know_options", [])
        # This test is expected to FAIL - currently no dont_know_options
        assert len(dont_know) >= 3, f"Should have at least 3 dont_know_options, got {len(dont_know)}"
        print(f"✓ Julkisivumaalaus has {len(dont_know)} dont_know_options")


class TestAutoTriggers:
    """Test auto-triggers functionality"""
    
    def test_all_services_have_auto_triggers(self):
        """Test that services have auto_triggers array"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        data = response.json()
        
        for service in data["services"]:
            triggers = service.get("auto_triggers", [])
            # Not all services need triggers, but structure should be correct
            for trigger in triggers:
                assert "if_step" in trigger, f"Trigger missing 'if_step' in {service['name']}"
                assert "if_values" in trigger, f"Trigger missing 'if_values' in {service['name']}"
                assert "enable_addons" in trigger, f"Trigger missing 'enable_addons' in {service['name']}"
            
            print(f"✓ {service['name']}: {len(triggers)} auto_triggers with correct structure")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
