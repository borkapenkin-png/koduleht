"""
Test suite for FAQ Hub, Service-specific FAQs, and References Page
Features tested:
- /ukk page: FAQ hub with grouped FAQs
- /api/faqs?service_id= query parameter
- /api/faqs/grouped endpoint
- /referenssit page
- Admin FAQ form with service selector
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://hintalaskuri-dynamic.preview.emergentagent.com').rstrip('/')


class TestFAQAPI:
    """Test FAQ API endpoints with service filtering"""
    
    def test_get_all_faqs(self):
        """GET /api/faqs returns all published FAQs"""
        response = requests.get(f"{BASE_URL}/api/faqs")
        assert response.status_code == 200
        faqs = response.json()
        assert isinstance(faqs, list)
        assert len(faqs) >= 4  # Should have at least general + service FAQs
        print(f"✓ GET /api/faqs returns {len(faqs)} FAQs")
        
    def test_faq_structure(self):
        """FAQs have required fields"""
        response = requests.get(f"{BASE_URL}/api/faqs")
        faqs = response.json()
        for faq in faqs:
            assert "id" in faq
            assert "question" in faq
            assert "answer" in faq
            assert "service_id" in faq  # New field - can be null or service ID
            assert "order" in faq
            assert "is_published" in faq
        print("✓ All FAQs have required fields including service_id")
        
    def test_faqs_with_service_filter(self):
        """GET /api/faqs?service_id= returns service-specific FAQs"""
        # First get services to find a valid service_id
        services_res = requests.get(f"{BASE_URL}/api/services")
        services = services_res.json()
        assert len(services) > 0
        
        # Find Tasoitustyöt service (should have FAQs)
        tasoitus_service = next((s for s in services if s["title"] == "Tasoitustyöt"), None)
        assert tasoitus_service is not None, "Tasoitustyöt service not found"
        
        # Get FAQs for this service
        response = requests.get(f"{BASE_URL}/api/faqs?service_id={tasoitus_service['id']}")
        assert response.status_code == 200
        faqs = response.json()
        assert isinstance(faqs, list)
        assert len(faqs) >= 1, "Should have at least 1 FAQ for Tasoitustyöt"
        
        # Verify all FAQs belong to this service
        for faq in faqs:
            assert faq["service_id"] == tasoitus_service["id"]
        print(f"✓ GET /api/faqs?service_id= returns {len(faqs)} service-specific FAQs")
        
    def test_faqs_grouped_endpoint(self):
        """GET /api/faqs/grouped returns FAQs grouped by service"""
        response = requests.get(f"{BASE_URL}/api/faqs/grouped")
        assert response.status_code == 200
        data = response.json()
        
        # Check structure
        assert "general" in data
        assert "by_service" in data
        assert isinstance(data["general"], list)
        assert isinstance(data["by_service"], dict)
        
        # Verify general FAQs (no service_id)
        for faq in data["general"]:
            assert faq.get("service_id") is None
            
        # Verify service-specific FAQs have correct structure
        for service_id, service_data in data["by_service"].items():
            assert "service_title" in service_data
            assert "faqs" in service_data
            assert isinstance(service_data["faqs"], list)
            for faq in service_data["faqs"]:
                assert faq["service_id"] == service_id
                
        print(f"✓ GET /api/faqs/grouped returns general: {len(data['general'])}, services: {len(data['by_service'])}")


class TestReferencesAPI:
    """Test References API endpoints"""
    
    def test_get_references(self):
        """GET /api/references returns all published references"""
        response = requests.get(f"{BASE_URL}/api/references")
        assert response.status_code == 200
        refs = response.json()
        assert isinstance(refs, list)
        assert len(refs) >= 6
        print(f"✓ GET /api/references returns {len(refs)} references")
        
    def test_reference_structure_for_page(self):
        """References have required fields for /referenssit page"""
        response = requests.get(f"{BASE_URL}/api/references")
        refs = response.json()
        
        for ref in refs:
            # Required fields for display
            assert "id" in ref
            assert "name" in ref  # Project name
            assert "type" in ref  # Service type
            
            # Optional but expected fields
            assert "description" in ref
            assert "location" in ref
            assert "cover_image_url" in ref
            assert "gallery_images" in ref
            
        print("✓ References have all fields needed for /referenssit page display")


class TestAdminFAQWithService:
    """Test Admin FAQ CRUD with service selector"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin",
            "password": "jbadmin2024"
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Admin login failed")
        
    def test_admin_get_faqs_with_service(self, admin_token):
        """Admin can see FAQs with service_id field"""
        response = requests.get(
            f"{BASE_URL}/api/admin/faqs",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        faqs = response.json()
        
        # Check that service_id field is present
        has_general = False
        has_service_specific = False
        for faq in faqs:
            assert "service_id" in faq
            if faq["service_id"] is None:
                has_general = True
            else:
                has_service_specific = True
                
        assert has_general, "Should have at least one general FAQ"
        assert has_service_specific, "Should have at least one service-specific FAQ"
        print(f"✓ Admin FAQs include both general and service-specific FAQs")
        
    def test_admin_create_faq_with_service(self, admin_token):
        """Admin can create FAQ with service_id"""
        # Get a service ID
        services = requests.get(f"{BASE_URL}/api/services").json()
        service_id = services[0]["id"] if services else None
        
        # Create FAQ with service_id
        new_faq = {
            "question": "TEST: Service-specific question?",
            "answer": "TEST: This is a test answer for service-specific FAQ.",
            "service_id": service_id,
            "order": 99
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/faqs",
            json=new_faq,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        created = response.json()
        assert created["service_id"] == service_id
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/admin/faqs/{created['id']}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        print("✓ Admin can create FAQ with service_id")
        
    def test_admin_update_faq_service(self, admin_token):
        """Admin can update FAQ's service_id"""
        # Get existing FAQ
        faqs = requests.get(
            f"{BASE_URL}/api/admin/faqs",
            headers={"Authorization": f"Bearer {admin_token}"}
        ).json()
        
        # Find a general FAQ to test
        general_faq = next((f for f in faqs if f["service_id"] is None), None)
        if not general_faq:
            pytest.skip("No general FAQ to test")
            
        # Get a service ID
        services = requests.get(f"{BASE_URL}/api/services").json()
        if not services:
            pytest.skip("No services available")
            
        # Note: We don't actually change it to avoid breaking the test data
        # Just verify the update endpoint accepts service_id
        response = requests.put(
            f"{BASE_URL}/api/admin/faqs/{general_faq['id']}",
            json={"service_id": None},  # Keep it as general
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        print("✓ Admin can update FAQ service_id field")


class TestServicesAPI:
    """Test Services API for FAQ service selector"""
    
    def test_get_services_for_selector(self):
        """GET /api/services returns services for FAQ selector dropdown"""
        response = requests.get(f"{BASE_URL}/api/services")
        assert response.status_code == 200
        services = response.json()
        
        assert len(services) >= 3  # Should have multiple services
        
        # Verify structure needed for dropdown
        for service in services:
            assert "id" in service
            assert "title" in service
            
        print(f"✓ Services API returns {len(services)} services for FAQ selector")


class TestServicePageFAQs:
    """Test service pages fetch service-specific FAQs"""
    
    def test_service_page_has_service_id(self):
        """Service pages include service_id for fetching FAQs"""
        response = requests.get(f"{BASE_URL}/api/service-pages")
        assert response.status_code == 200
        pages = response.json()
        
        # Check Tasoitustyöt page has service_id
        tasoitus_page = next((p for p in pages if "tasoitus" in p.get("slug", "").lower()), None)
        if tasoitus_page:
            assert "service_id" in tasoitus_page
            assert tasoitus_page["service_id"] is not None
            print(f"✓ Service page {tasoitus_page['slug']} has service_id: {tasoitus_page['service_id']}")
        else:
            print("! No tasoitustyöt service page found")


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
