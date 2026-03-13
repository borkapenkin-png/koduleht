"""
Test QuoteRequestForm API endpoints
Tests the /api/contact endpoint with new optional fields:
- services (multi-select array)
- propertyType (Kohde dropdown)
- areaSize (Pinta-ala dropdown)
- location (Sijainti text field)
- timeline (Aikataulu dropdown)
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestContactAPIWithNewFields:
    """Test contact form API with new optional fields"""
    
    def test_contact_with_all_new_fields(self):
        """Test form submission with all new optional fields"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        
        payload = {
            "firstName": "Test",
            "lastName": "User",
            "email": unique_email,
            "phone": "+358401234567",
            "message": "Test message with all fields",
            "services": ["tasoitustyot", "sisamaalaus", "julkisivumaalaus"],
            "propertyType": "omakotitalo",
            "areaSize": "50-150",
            "location": "Helsinki",
            "timeline": "heti"
        }
        
        response = requests.post(f"{BASE_URL}/api/contact", json=payload)
        
        # Status code assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Data assertions
        data = response.json()
        assert data["firstName"] == "Test"
        assert data["lastName"] == "User"
        assert data["email"] == unique_email
        assert data["phone"] == "+358401234567"
        assert data["message"] == "Test message with all fields"
        
        # New fields assertions
        assert data["services"] == ["tasoitustyot", "sisamaalaus", "julkisivumaalaus"]
        assert data["propertyType"] == "omakotitalo"
        assert data["areaSize"] == "50-150"
        assert data["location"] == "Helsinki"
        assert data["timeline"] == "heti"
        
        # ID should be generated
        assert "id" in data
        assert len(data["id"]) > 0
        
        print(f"✓ Contact created with all new fields: {data['id']}")
    
    def test_contact_with_only_required_fields(self):
        """Test form submission with only required fields (backward compatibility)"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        
        payload = {
            "firstName": "Test",
            "lastName": "User",
            "email": unique_email,
            "message": "Test message with only required fields"
        }
        
        response = requests.post(f"{BASE_URL}/api/contact", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["firstName"] == "Test"
        assert data["lastName"] == "User"
        assert data["email"] == unique_email
        assert data["message"] == "Test message with only required fields"
        
        # Optional fields should be None or empty
        assert data.get("services") is None or data.get("services") == []
        assert data.get("propertyType") is None
        assert data.get("areaSize") is None
        assert data.get("location") is None
        assert data.get("timeline") is None
        
        print("✓ Contact created with only required fields (backward compatible)")
    
    def test_contact_with_partial_new_fields(self):
        """Test form submission with only some new optional fields"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        
        payload = {
            "firstName": "Test",
            "lastName": "User",
            "email": unique_email,
            "message": "Test message with partial fields",
            "services": ["kattomaalaus"],
            "propertyType": "kerrostalo"
            # No areaSize, location, or timeline
        }
        
        response = requests.post(f"{BASE_URL}/api/contact", json=payload)
        
        assert response.status_code == 200
        
        data = response.json()
        assert data["services"] == ["kattomaalaus"]
        assert data["propertyType"] == "kerrostalo"
        assert data.get("areaSize") is None
        assert data.get("location") is None
        assert data.get("timeline") is None
        
        print("✓ Contact created with partial new fields")
    
    def test_contact_with_empty_services_array(self):
        """Test form submission with empty services array"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        
        payload = {
            "firstName": "Test",
            "lastName": "User",
            "email": unique_email,
            "message": "Test message with empty services",
            "services": []
        }
        
        response = requests.post(f"{BASE_URL}/api/contact", json=payload)
        
        assert response.status_code == 200
        
        data = response.json()
        assert data["services"] == [] or data["services"] is None
        
        print("✓ Contact created with empty services array")
    
    def test_contact_all_service_options(self):
        """Test form submission with all available service options"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        
        all_services = [
            "tasoitustyot", "sisamaalaus", "julkisivumaalaus", 
            "julkisivurappaus", "mikrosementti", "kattomaalaus",
            "huoltomaalaus", "parvekemaalaus", "muu"
        ]
        
        payload = {
            "firstName": "Test",
            "lastName": "User",
            "email": unique_email,
            "message": "Test with all services",
            "services": all_services
        }
        
        response = requests.post(f"{BASE_URL}/api/contact", json=payload)
        
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["services"]) == 9
        assert set(data["services"]) == set(all_services)
        
        print("✓ Contact created with all 9 service options")
    
    def test_contact_all_property_types(self):
        """Test all property type dropdown options"""
        property_types = ["omakotitalo", "kerrostalo", "taloyhtio", "toimitila", "muu"]
        
        for prop_type in property_types:
            unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
            
            payload = {
                "firstName": "Test",
                "lastName": "User",
                "email": unique_email,
                "message": f"Test with property type: {prop_type}",
                "propertyType": prop_type
            }
            
            response = requests.post(f"{BASE_URL}/api/contact", json=payload)
            assert response.status_code == 200
            assert response.json()["propertyType"] == prop_type
        
        print("✓ All property types (Kohde) work correctly")
    
    def test_contact_all_area_sizes(self):
        """Test all area size dropdown options"""
        area_sizes = ["alle-50", "50-150", "150-500", "yli-500", "en-osaa-sanoa"]
        
        for area in area_sizes:
            unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
            
            payload = {
                "firstName": "Test",
                "lastName": "User",
                "email": unique_email,
                "message": f"Test with area size: {area}",
                "areaSize": area
            }
            
            response = requests.post(f"{BASE_URL}/api/contact", json=payload)
            assert response.status_code == 200
            assert response.json()["areaSize"] == area
        
        print("✓ All area sizes (Pinta-ala) work correctly")
    
    def test_contact_all_timelines(self):
        """Test all timeline dropdown options"""
        timelines = ["heti", "1-3kk", "myohemmin", "suunnittelu"]
        
        for timeline in timelines:
            unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
            
            payload = {
                "firstName": "Test",
                "lastName": "User",
                "email": unique_email,
                "message": f"Test with timeline: {timeline}",
                "timeline": timeline
            }
            
            response = requests.post(f"{BASE_URL}/api/contact", json=payload)
            assert response.status_code == 200
            assert response.json()["timeline"] == timeline
        
        print("✓ All timelines (Aikataulu) work correctly")
    
    def test_contact_validation_missing_required(self):
        """Test validation for missing required fields"""
        # Missing firstName
        payload = {
            "lastName": "User",
            "email": "test@example.com",
            "message": "Test message"
        }
        
        response = requests.post(f"{BASE_URL}/api/contact", json=payload)
        assert response.status_code == 422, "Should reject missing firstName"
        
        # Missing lastName
        payload = {
            "firstName": "Test",
            "email": "test@example.com",
            "message": "Test message"
        }
        
        response = requests.post(f"{BASE_URL}/api/contact", json=payload)
        assert response.status_code == 422, "Should reject missing lastName"
        
        # Missing email
        payload = {
            "firstName": "Test",
            "lastName": "User",
            "message": "Test message"
        }
        
        response = requests.post(f"{BASE_URL}/api/contact", json=payload)
        assert response.status_code == 422, "Should reject missing email"
        
        # Missing message
        payload = {
            "firstName": "Test",
            "lastName": "User",
            "email": "test@example.com"
        }
        
        response = requests.post(f"{BASE_URL}/api/contact", json=payload)
        assert response.status_code == 422, "Should reject missing message"
        
        print("✓ Required field validation works correctly")


class TestAPIHealthAndBasics:
    """Basic API health checks"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ API root: {data['message']}")
    
    def test_settings_endpoint(self):
        """Test settings endpoint returns data"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        assert "company_name" in data or "hero_title_1" in data
        print("✓ Settings endpoint working")
    
    def test_services_endpoint(self):
        """Test services endpoint returns array"""
        response = requests.get(f"{BASE_URL}/api/services")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Services endpoint: {len(data)} services")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
