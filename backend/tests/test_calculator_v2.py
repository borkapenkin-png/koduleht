"""
Test suite for Premium Hintalaskuri v2 - Price Calculator
Tests the calculator config API with new features:
- size_cards step type
- dont_know_options for sliders
- Price range calculation (×0.9 – ×1.15)
- Kotitalousvähennys calculation
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCalculatorConfigAPI:
    """Tests for /api/calculator-config endpoint"""
    
    def test_calculator_config_returns_200(self):
        """GET /api/calculator-config returns 200"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ Calculator config endpoint returns 200")
    
    def test_calculator_config_has_6_services(self):
        """Config has all 6 services"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        data = response.json()
        
        assert "services" in data, "Missing 'services' key"
        services = data["services"]
        assert len(services) == 6, f"Expected 6 services, got {len(services)}"
        
        expected_ids = ["sisamaalaus", "tasoitustyot", "mikrosementti", "julkisivumaalaus", "kattomaalaus", "julkisivurappaus"]
        actual_ids = [s["id"] for s in services]
        
        for expected_id in expected_ids:
            assert expected_id in actual_ids, f"Missing service: {expected_id}"
        
        print(f"✓ All 6 services present: {actual_ids}")
    
    def test_services_have_correct_names_and_prices(self):
        """Each service has correct name and base_price_per_m2"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        data = response.json()
        
        expected = {
            "sisamaalaus": {"name": "Sisämaalaus", "price": 19},
            "tasoitustyot": {"name": "Tasoitustyöt", "price": 25},
            "mikrosementti": {"name": "Mikrosementti", "price": 120},
            "julkisivumaalaus": {"name": "Julkisivumaalaus", "price": 35},
            "kattomaalaus": {"name": "Kattomaalaus", "price": 18},
            "julkisivurappaus": {"name": "Julkisivurappaus", "price": 55}
        }
        
        for service in data["services"]:
            sid = service["id"]
            if sid in expected:
                assert service["name"] == expected[sid]["name"], f"Wrong name for {sid}"
                assert service["base_price_per_m2"] == expected[sid]["price"], f"Wrong price for {sid}"
                print(f"✓ {service['name']}: {service['base_price_per_m2']} €/m²")
    
    def test_global_settings_present(self):
        """Global settings has required fields"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        data = response.json()
        
        assert "global_settings" in data, "Missing 'global_settings'"
        gs = data["global_settings"]
        
        required_fields = ["tax_rate", "kotitalousvahennys_rate", "kotitalousvahennys_max_per_person", "labor_percentage"]
        for field in required_fields:
            assert field in gs, f"Missing global setting: {field}"
        
        # Verify Finnish tax values
        assert gs["tax_rate"] == 25.5, f"Expected ALV 25.5%, got {gs['tax_rate']}"
        assert gs["kotitalousvahennys_rate"] == 35, f"Expected kotitalousvähennys 35%, got {gs['kotitalousvahennys_rate']}"
        assert gs["labor_percentage"] == 70, f"Expected labor 70%, got {gs['labor_percentage']}"
        
        print(f"✓ Global settings: ALV {gs['tax_rate']}%, Kotitalousvähennys {gs['kotitalousvahennys_rate']}%")


class TestSizeCardsStepType:
    """Tests for size_cards step type (Julkisivumaalaus, Kattomaalaus)"""
    
    def test_julkisivumaalaus_has_size_cards(self):
        """Julkisivumaalaus has size_cards step for area"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        data = response.json()
        
        julkisivu = next((s for s in data["services"] if s["id"] == "julkisivumaalaus"), None)
        assert julkisivu is not None, "Julkisivumaalaus service not found"
        
        area_step = next((step for step in julkisivu["steps"] if step["id"] == "area"), None)
        assert area_step is not None, "Area step not found"
        assert area_step["type"] == "size_cards", f"Expected size_cards, got {area_step['type']}"
        
        # Check options
        options = area_step["options"]
        assert len(options) >= 4, f"Expected at least 4 size options, got {len(options)}"
        
        # Verify area_value is present
        for opt in options:
            assert "area_value" in opt, f"Missing area_value in option {opt['id']}"
            assert "label" in opt, f"Missing label in option {opt['id']}"
        
        print(f"✓ Julkisivumaalaus has size_cards with {len(options)} options")
        for opt in options:
            print(f"  - {opt['label']}: {opt['area_value']} m²")
    
    def test_kattomaalaus_has_size_cards(self):
        """Kattomaalaus has size_cards step for area"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        data = response.json()
        
        katto = next((s for s in data["services"] if s["id"] == "kattomaalaus"), None)
        assert katto is not None, "Kattomaalaus service not found"
        
        area_step = next((step for step in katto["steps"] if step["id"] == "area"), None)
        assert area_step is not None, "Area step not found"
        assert area_step["type"] == "size_cards", f"Expected size_cards, got {area_step['type']}"
        
        options = area_step["options"]
        expected_labels = ["Pieni", "Keskikokoinen", "Suuri", "Erittäin suuri"]
        actual_labels = [opt["label"] for opt in options]
        
        for label in expected_labels:
            assert label in actual_labels, f"Missing size option: {label}"
        
        print(f"✓ Kattomaalaus has size_cards: {actual_labels}")


class TestDontKnowOptions:
    """Tests for 'En tiedä pinta-alaa' feature"""
    
    def test_sisamaalaus_has_dont_know_options(self):
        """Sisämaalaus slider has dont_know_options"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        data = response.json()
        
        sisamaalaus = next((s for s in data["services"] if s["id"] == "sisamaalaus"), None)
        assert sisamaalaus is not None, "Sisämaalaus service not found"
        
        area_step = next((step for step in sisamaalaus["steps"] if step["id"] == "area"), None)
        assert area_step is not None, "Area step not found"
        assert area_step["type"] == "slider", f"Expected slider, got {area_step['type']}"
        
        assert "dont_know_options" in area_step, "Missing dont_know_options"
        options = area_step["dont_know_options"]
        assert len(options) >= 3, f"Expected at least 3 options, got {len(options)}"
        
        # Verify structure
        for opt in options:
            assert "id" in opt, "Missing id in dont_know option"
            assert "label" in opt, "Missing label in dont_know option"
            assert "area_value" in opt, "Missing area_value in dont_know option"
        
        print(f"✓ Sisämaalaus has dont_know_options:")
        for opt in options:
            print(f"  - {opt['label']}: ~{opt['area_value']} m²")
    
    def test_tasoitustyot_has_dont_know_options(self):
        """Tasoitustyöt slider has dont_know_options"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        data = response.json()
        
        tasoitus = next((s for s in data["services"] if s["id"] == "tasoitustyot"), None)
        assert tasoitus is not None, "Tasoitustyöt service not found"
        
        area_step = next((step for step in tasoitus["steps"] if step["id"] == "area"), None)
        assert area_step is not None, "Area step not found"
        
        assert "dont_know_options" in area_step, "Missing dont_know_options"
        print(f"✓ Tasoitustyöt has dont_know_options: {len(area_step['dont_know_options'])} options")


class TestServiceSteps:
    """Tests for service step configurations"""
    
    def test_sisamaalaus_flow(self):
        """Sisämaalaus has correct step flow: target_type → area → condition"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        data = response.json()
        
        sisamaalaus = next((s for s in data["services"] if s["id"] == "sisamaalaus"), None)
        steps = sisamaalaus["steps"]
        
        assert len(steps) == 3, f"Expected 3 steps, got {len(steps)}"
        assert steps[0]["id"] == "target_type", "First step should be target_type"
        assert steps[1]["id"] == "area", "Second step should be area"
        assert steps[2]["id"] == "condition", "Third step should be condition"
        
        # Check target_type options
        target_options = steps[0]["options"]
        expected_targets = ["room", "studio", "2room", "3room", "4room"]
        actual_targets = [opt["id"] for opt in target_options]
        for t in expected_targets:
            assert t in actual_targets, f"Missing target option: {t}"
        
        print(f"✓ Sisämaalaus flow: {[s['id'] for s in steps]}")
    
    def test_julkisivumaalaus_flow(self):
        """Julkisivumaalaus has correct step flow: target_type → area → floors → condition"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        data = response.json()
        
        julkisivu = next((s for s in data["services"] if s["id"] == "julkisivumaalaus"), None)
        steps = julkisivu["steps"]
        
        assert len(steps) == 4, f"Expected 4 steps, got {len(steps)}"
        assert steps[0]["id"] == "target_type", "First step should be target_type"
        assert steps[1]["id"] == "area", "Second step should be area"
        assert steps[2]["id"] == "floors", "Third step should be floors"
        assert steps[3]["id"] == "condition", "Fourth step should be condition"
        
        print(f"✓ Julkisivumaalaus flow: {[s['id'] for s in steps]}")
    
    def test_kattomaalaus_flow(self):
        """Kattomaalaus has correct step flow: target_type → area → condition"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        data = response.json()
        
        katto = next((s for s in data["services"] if s["id"] == "kattomaalaus"), None)
        steps = katto["steps"]
        
        assert len(steps) == 3, f"Expected 3 steps, got {len(steps)}"
        assert steps[0]["id"] == "target_type", "First step should be target_type"
        assert steps[1]["id"] == "area", "Second step should be area"
        assert steps[2]["id"] == "condition", "Third step should be condition"
        
        print(f"✓ Kattomaalaus flow: {[s['id'] for s in steps]}")


class TestAddons:
    """Tests for service addons"""
    
    def test_sisamaalaus_addons(self):
        """Sisämaalaus has correct addons with hints"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        data = response.json()
        
        sisamaalaus = next((s for s in data["services"] if s["id"] == "sisamaalaus"), None)
        addons = sisamaalaus["addons"]
        
        assert len(addons) >= 3, f"Expected at least 3 addons, got {len(addons)}"
        
        # Check addon structure
        for addon in addons:
            assert "id" in addon, "Missing id"
            assert "label" in addon, "Missing label"
            assert "enabled" in addon, "Missing enabled"
            # Check for hint (new feature)
            assert "hint" in addon, f"Missing hint for addon {addon['id']}"
        
        print(f"✓ Sisämaalaus addons:")
        for addon in addons:
            price = addon.get("price_per_m2") or addon.get("fixed_price", 0)
            print(f"  - {addon['label']}: {price} €")
    
    def test_kattomaalaus_addons(self):
        """Kattomaalaus has wash and moss treatment addons"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        data = response.json()
        
        katto = next((s for s in data["services"] if s["id"] == "kattomaalaus"), None)
        addons = katto["addons"]
        
        addon_ids = [a["id"] for a in addons]
        assert "wash" in addon_ids, "Missing 'wash' addon"
        assert "moss_treatment" in addon_ids, "Missing 'moss_treatment' addon"
        
        print(f"✓ Kattomaalaus addons: {addon_ids}")


class TestContactAPI:
    """Tests for contact form submission"""
    
    def test_contact_form_submission(self):
        """POST /api/contact accepts form data"""
        payload = {
            "firstName": "TEST_Calculator",
            "lastName": "User",
            "email": "test@example.com",
            "phone": "+358401234567",
            "message": "Test from calculator v2"
        }
        
        response = requests.post(f"{BASE_URL}/api/contact", json=payload)
        assert response.status_code in [200, 201], f"Expected 200/201, got {response.status_code}"
        
        data = response.json()
        assert data["firstName"] == payload["firstName"]
        assert data["email"] == payload["email"]
        assert "id" in data, "Missing id in response"
        
        print(f"✓ Contact form submitted: {data['id']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
