"""
Test suite for Price Calculator (Hintalaskuri) feature
Tests both public and admin endpoints for calculator configuration
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "jbadmin2024"


class TestCalculatorPublicAPI:
    """Public calculator config endpoint tests"""
    
    def test_get_calculator_config_returns_200(self):
        """GET /api/calculator-config should return 200"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("PASS: GET /api/calculator-config returns 200")
    
    def test_calculator_config_has_required_structure(self):
        """Calculator config should have global_settings and services"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        assert response.status_code == 200
        data = response.json()
        
        # Check top-level structure
        assert "global_settings" in data, "Missing global_settings"
        assert "services" in data, "Missing services"
        assert isinstance(data["services"], list), "services should be a list"
        print("PASS: Calculator config has required structure")
    
    def test_calculator_config_has_6_services(self):
        """Calculator should have 6 service types"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        assert response.status_code == 200
        data = response.json()
        
        services = data.get("services", [])
        assert len(services) == 6, f"Expected 6 services, got {len(services)}"
        
        # Check expected service IDs
        expected_ids = ["sisamaalaus", "tasoitustyot", "mikrosementti", "julkisivumaalaus", "kattomaalaus", "julkisivurappaus"]
        actual_ids = [s["id"] for s in services]
        for expected_id in expected_ids:
            assert expected_id in actual_ids, f"Missing service: {expected_id}"
        
        print(f"PASS: Calculator has 6 services: {actual_ids}")
    
    def test_calculator_global_settings_has_required_fields(self):
        """Global settings should have tax_rate, kotitalousvahennys_rate, labor_percentage"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        assert response.status_code == 200
        data = response.json()
        
        gs = data.get("global_settings", {})
        required_fields = ["tax_rate", "kotitalousvahennys_rate", "kotitalousvahennys_max_per_person", "labor_percentage", "material_percentage"]
        for field in required_fields:
            assert field in gs, f"Missing global setting: {field}"
            assert isinstance(gs[field], (int, float)), f"{field} should be numeric"
        
        print(f"PASS: Global settings has required fields: {list(gs.keys())}")
    
    def test_each_service_has_required_fields(self):
        """Each service should have id, name, base_price_per_m2, steps, addons"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        assert response.status_code == 200
        data = response.json()
        
        for service in data.get("services", []):
            assert "id" in service, f"Service missing id"
            assert "name" in service, f"Service {service.get('id')} missing name"
            assert "base_price_per_m2" in service, f"Service {service.get('id')} missing base_price_per_m2"
            assert "steps" in service, f"Service {service.get('id')} missing steps"
            assert "addons" in service, f"Service {service.get('id')} missing addons"
            assert "enabled" in service, f"Service {service.get('id')} missing enabled"
            
            # Check steps structure
            for step in service.get("steps", []):
                assert "id" in step, f"Step missing id in service {service['id']}"
                assert "title" in step, f"Step missing title in service {service['id']}"
                assert "type" in step, f"Step missing type in service {service['id']}"
        
        print("PASS: All services have required fields")
    
    def test_service_steps_have_correct_types(self):
        """Steps should be either 'cards' or 'slider' type"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        assert response.status_code == 200
        data = response.json()
        
        valid_types = ["cards", "slider"]
        for service in data.get("services", []):
            for step in service.get("steps", []):
                assert step["type"] in valid_types, f"Invalid step type: {step['type']} in service {service['id']}"
                
                if step["type"] == "cards":
                    assert "options" in step, f"Cards step missing options in service {service['id']}"
                    for opt in step.get("options", []):
                        assert "id" in opt, "Option missing id"
                        assert "label" in opt, "Option missing label"
                        assert "multiplier" in opt, "Option missing multiplier"
                
                if step["type"] == "slider":
                    assert "min" in step, f"Slider step missing min in service {service['id']}"
                    assert "max" in step, f"Slider step missing max in service {service['id']}"
                    assert "default" in step, f"Slider step missing default in service {service['id']}"
        
        print("PASS: All step types are valid")


class TestCalculatorAdminAPI:
    """Admin calculator config endpoint tests (requires authentication)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before each test"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_admin_get_calculator_config_requires_auth(self):
        """GET /api/admin/calculator-config should require authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/calculator-config")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("PASS: Admin endpoint requires authentication")
    
    def test_admin_get_calculator_config_with_auth(self):
        """GET /api/admin/calculator-config should work with valid token"""
        response = requests.get(f"{BASE_URL}/api/admin/calculator-config", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "services" in data
        assert "global_settings" in data
        print("PASS: Admin GET calculator-config works with auth")
    
    def test_admin_update_calculator_config_requires_auth(self):
        """PUT /api/admin/calculator-config should require authentication"""
        response = requests.put(f"{BASE_URL}/api/admin/calculator-config", json={})
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("PASS: Admin PUT endpoint requires authentication")
    
    def test_admin_update_global_settings(self):
        """Admin should be able to update global settings"""
        # First get current config
        response = requests.get(f"{BASE_URL}/api/admin/calculator-config", headers=self.headers)
        assert response.status_code == 200
        config = response.json()
        
        # Store original value
        original_tax_rate = config["global_settings"]["tax_rate"]
        
        # Update tax rate
        config["global_settings"]["tax_rate"] = 25.5
        
        response = requests.put(f"{BASE_URL}/api/admin/calculator-config", json=config, headers=self.headers)
        assert response.status_code == 200, f"Update failed: {response.text}"
        
        # Verify update
        updated = response.json()
        assert updated["global_settings"]["tax_rate"] == 25.5, "Tax rate not updated"
        
        # Restore original value
        config["global_settings"]["tax_rate"] = original_tax_rate
        requests.put(f"{BASE_URL}/api/admin/calculator-config", json=config, headers=self.headers)
        
        print("PASS: Admin can update global settings")
    
    def test_admin_update_service_base_price(self):
        """Admin should be able to update service base_price_per_m2"""
        # Get current config
        response = requests.get(f"{BASE_URL}/api/admin/calculator-config", headers=self.headers)
        assert response.status_code == 200
        config = response.json()
        
        # Find sisamaalaus service
        service_idx = None
        original_price = None
        for i, s in enumerate(config["services"]):
            if s["id"] == "sisamaalaus":
                service_idx = i
                original_price = s["base_price_per_m2"]
                break
        
        assert service_idx is not None, "sisamaalaus service not found"
        
        # Update price
        config["services"][service_idx]["base_price_per_m2"] = 25
        
        response = requests.put(f"{BASE_URL}/api/admin/calculator-config", json=config, headers=self.headers)
        assert response.status_code == 200
        
        # Verify update
        updated = response.json()
        updated_service = next(s for s in updated["services"] if s["id"] == "sisamaalaus")
        assert updated_service["base_price_per_m2"] == 25, "Base price not updated"
        
        # Restore original
        config["services"][service_idx]["base_price_per_m2"] = original_price
        requests.put(f"{BASE_URL}/api/admin/calculator-config", json=config, headers=self.headers)
        
        print("PASS: Admin can update service base price")
    
    def test_admin_update_step_multiplier(self):
        """Admin should be able to update step option multipliers"""
        # Get current config
        response = requests.get(f"{BASE_URL}/api/admin/calculator-config", headers=self.headers)
        assert response.status_code == 200
        config = response.json()
        
        # Find sisamaalaus service and its first cards step
        service_idx = None
        step_idx = None
        option_idx = None
        original_multiplier = None
        
        for i, s in enumerate(config["services"]):
            if s["id"] == "sisamaalaus":
                service_idx = i
                for j, step in enumerate(s["steps"]):
                    if step["type"] == "cards":
                        step_idx = j
                        option_idx = 0
                        original_multiplier = step["options"][0]["multiplier"]
                        break
                break
        
        assert service_idx is not None and step_idx is not None, "Could not find cards step"
        
        # Update multiplier
        config["services"][service_idx]["steps"][step_idx]["options"][option_idx]["multiplier"] = 1.5
        
        response = requests.put(f"{BASE_URL}/api/admin/calculator-config", json=config, headers=self.headers)
        assert response.status_code == 200
        
        # Verify update
        updated = response.json()
        updated_service = next(s for s in updated["services"] if s["id"] == "sisamaalaus")
        updated_step = next(st for st in updated_service["steps"] if st["type"] == "cards")
        assert updated_step["options"][0]["multiplier"] == 1.5, "Multiplier not updated"
        
        # Restore original
        config["services"][service_idx]["steps"][step_idx]["options"][option_idx]["multiplier"] = original_multiplier
        requests.put(f"{BASE_URL}/api/admin/calculator-config", json=config, headers=self.headers)
        
        print("PASS: Admin can update step multipliers")
    
    def test_config_persists_after_update(self):
        """Updated config should persist and be returned by public endpoint"""
        # Get current config
        response = requests.get(f"{BASE_URL}/api/admin/calculator-config", headers=self.headers)
        assert response.status_code == 200
        config = response.json()
        
        original_disclaimer = config["global_settings"].get("disclaimer", "")
        
        # Update disclaimer
        config["global_settings"]["disclaimer"] = "TEST_DISCLAIMER_12345"
        
        response = requests.put(f"{BASE_URL}/api/admin/calculator-config", json=config, headers=self.headers)
        assert response.status_code == 200
        
        # Verify via public endpoint
        public_response = requests.get(f"{BASE_URL}/api/calculator-config")
        assert public_response.status_code == 200
        public_config = public_response.json()
        assert public_config["global_settings"]["disclaimer"] == "TEST_DISCLAIMER_12345", "Config not persisted"
        
        # Restore original
        config["global_settings"]["disclaimer"] = original_disclaimer
        requests.put(f"{BASE_URL}/api/admin/calculator-config", json=config, headers=self.headers)
        
        print("PASS: Config persists after update")


class TestCalculatorServiceDetails:
    """Test specific service configurations"""
    
    def test_sisamaalaus_service_structure(self):
        """Sisämaalaus service should have correct structure"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        data = response.json()
        
        service = next((s for s in data["services"] if s["id"] == "sisamaalaus"), None)
        assert service is not None, "Sisämaalaus service not found"
        
        assert service["name"] == "Sisämaalaus"
        assert service["icon"] == "Paintbrush"
        assert service["enabled"] == True
        assert len(service["steps"]) >= 3, "Should have at least 3 steps"
        assert len(service["addons"]) >= 1, "Should have at least 1 addon"
        
        print("PASS: Sisämaalaus service has correct structure")
    
    def test_all_services_have_area_slider(self):
        """All services should have an area slider step"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        data = response.json()
        
        for service in data["services"]:
            has_slider = any(step["type"] == "slider" for step in service["steps"])
            assert has_slider, f"Service {service['id']} missing area slider"
        
        print("PASS: All services have area slider")
    
    def test_multipliers_are_valid_numbers(self):
        """All multipliers should be positive numbers"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        data = response.json()
        
        for service in data["services"]:
            for step in service["steps"]:
                if step["type"] == "cards":
                    for opt in step["options"]:
                        mult = opt["multiplier"]
                        assert isinstance(mult, (int, float)), f"Multiplier should be numeric: {mult}"
                        assert mult > 0, f"Multiplier should be positive: {mult}"
        
        print("PASS: All multipliers are valid positive numbers")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
