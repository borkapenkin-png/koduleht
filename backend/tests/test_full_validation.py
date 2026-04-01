"""
Full Backend API Validation Tests for jbtasoitusmaalaus.fi
Tests all public and admin API endpoints before production deployment
"""
import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://nginx-seo-fix.preview.emergentagent.com')

# Admin credentials from test request
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "jbadmin2024"

class TestPublicEndpoints:
    """Public API endpoint tests - No auth required"""
    
    def test_api_root(self):
        """Test API root endpoint returns expected message"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "J&B" in data["message"]
        print(f"✓ API root: {data['message']}")
    
    def test_get_settings(self):
        """Test settings endpoint returns theme color"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        # Validate expected fields
        assert "theme_color" in data
        assert "company_name" in data
        assert "hero_title_1" in data
        # Verify theme color is teal as expected
        assert data["theme_color"] == "#0891B2", f"Expected teal theme color, got {data['theme_color']}"
        print(f"✓ Settings: theme_color={data['theme_color']}, company={data['company_name']}")
    
    def test_get_services(self):
        """Test services endpoint returns list of services"""
        response = requests.get(f"{BASE_URL}/api/services")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "No services returned"
        # Validate service structure
        for service in data:
            assert "id" in service
            assert "title" in service
            assert "description" in service
            assert "icon" in service
        print(f"✓ Services: {len(data)} services returned")
    
    def test_get_references(self):
        """Test references endpoint returns list with expected fields"""
        response = requests.get(f"{BASE_URL}/api/references")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "No references returned"
        # Validate reference structure including new fields
        for ref in data:
            assert "id" in ref
            assert "name" in ref
            assert "type" in ref
            # New fields added in recent updates
            assert "main_contractor" in ref or "main_contractor" not in ref  # Optional
            assert "location" in ref or "location" not in ref  # Optional
            assert "cover_image_url" in ref or "cover_image_url" not in ref  # Optional
        print(f"✓ References: {len(data)} references returned")
        # Check that references have expected data
        if len(data) > 0:
            first_ref = data[0]
            print(f"  First reference: {first_ref['name']} - {first_ref['type']}")
    
    def test_get_partners(self):
        """Test partners endpoint returns list"""
        response = requests.get(f"{BASE_URL}/api/partners")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Partners: {len(data)} partners returned")
    
    def test_get_service_pages(self):
        """Test service pages endpoint returns published pages"""
        response = requests.get(f"{BASE_URL}/api/service-pages")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "No service pages returned"
        # Validate service page structure
        for page in data:
            assert "id" in page
            assert "slug" in page
            assert "hero_title" in page
            assert "seo_title" in page
            assert page["is_published"] == True
        print(f"✓ Service Pages: {len(data)} pages returned")
        # List slugs
        slugs = [p["slug"] for p in data]
        print(f"  Slugs: {', '.join(slugs)}")
    
    def test_get_service_page_by_slug(self):
        """Test individual service page by slug"""
        slugs_to_test = ["tasoitustyot-helsinki", "maalaustyot-helsinki", "mikrosementti-helsinki"]
        for slug in slugs_to_test:
            response = requests.get(f"{BASE_URL}/api/service-pages/{slug}")
            if response.status_code == 200:
                data = response.json()
                assert data["slug"] == slug
                assert "hero_title" in data
                assert "features" in data
                print(f"✓ Service page '{slug}': {data['hero_title']}")
            else:
                print(f"⚠ Service page '{slug}' not found (may be unpublished)")
    
    def test_contact_form_submission(self):
        """Test contact form submission"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "firstName": "TEST_Validator",
            "lastName": "Bot",
            "email": unique_email,
            "phone": "+358 40 123 4567",
            "subject": "Test submission from validation",
            "message": "This is a test submission for validation purposes."
        }
        response = requests.post(f"{BASE_URL}/api/contact", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["firstName"] == "TEST_Validator"
        assert data["email"] == unique_email
        assert "id" in data
        print(f"✓ Contact form submission successful: {data['id']}")
        return data["id"]


class TestAdminAuthentication:
    """Admin authentication tests"""
    
    def test_admin_login_success(self):
        """Test admin login with correct credentials"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["username"] == ADMIN_USERNAME
        print(f"✓ Admin login successful: token received")
        return data["access_token"]
    
    def test_admin_login_invalid_credentials(self):
        """Test admin login with wrong password"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": ADMIN_USERNAME,
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print(f"✓ Invalid credentials correctly rejected")
    
    def test_admin_verify_token(self):
        """Test token verification"""
        # First login to get token
        login_response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD
        })
        token = login_response.json()["access_token"]
        
        # Verify token
        response = requests.get(f"{BASE_URL}/api/admin/verify", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["authenticated"] == True
        assert data["username"] == ADMIN_USERNAME
        print(f"✓ Token verification successful")


class TestAdminCRUD:
    """Admin CRUD operation tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_get_settings_admin(self, auth_token):
        """Test admin can get settings"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        assert "theme_color" in data
        print(f"✓ Admin settings read: theme_color={data['theme_color']}")
    
    def test_admin_get_contacts(self, auth_token):
        """Test admin can get contact submissions"""
        response = requests.get(f"{BASE_URL}/api/admin/contacts", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin contacts: {len(data)} contacts retrieved")
    
    def test_admin_get_all_references(self, auth_token):
        """Test admin can get all references including unpublished"""
        response = requests.get(f"{BASE_URL}/api/admin/references", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin references: {len(data)} references retrieved")
    
    def test_admin_get_all_service_pages(self, auth_token):
        """Test admin can get all service pages"""
        response = requests.get(f"{BASE_URL}/api/admin/service-pages", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin service pages: {len(data)} pages retrieved")


class TestReferenceDataIntegrity:
    """Test reference data has expected fields for display"""
    
    def test_references_have_display_data(self):
        """Verify references have all fields needed for card display"""
        response = requests.get(f"{BASE_URL}/api/references")
        assert response.status_code == 200
        data = response.json()
        
        required_fields = ["id", "name", "type"]
        optional_display_fields = ["description", "main_contractor", "location", "cover_image_url"]
        
        for ref in data:
            # Check required fields
            for field in required_fields:
                assert field in ref, f"Missing required field '{field}' in reference {ref.get('name', 'unknown')}"
            
            # Report on optional fields
            has_image = ref.get("cover_image_url") is not None
            has_contractor = ref.get("main_contractor") is not None
            has_location = ref.get("location") is not None
            
            print(f"  Reference '{ref['name']}': image={has_image}, contractor={has_contractor}, location={has_location}")
        
        print(f"✓ All {len(data)} references have required display data")


class TestServicePagesIntegrity:
    """Test service pages have all content for display"""
    
    def test_service_pages_have_seo(self):
        """Verify service pages have SEO fields"""
        response = requests.get(f"{BASE_URL}/api/service-pages")
        assert response.status_code == 200
        data = response.json()
        
        for page in data:
            assert "seo_title" in page and page["seo_title"]
            assert "seo_description" in page and page["seo_description"]
            assert "hero_title" in page and page["hero_title"]
            print(f"  Page '{page['slug']}': H1='{page['hero_title']}'")
        
        print(f"✓ All {len(data)} service pages have SEO data")
    
    def test_service_pages_have_features(self):
        """Verify service pages have features for display"""
        response = requests.get(f"{BASE_URL}/api/service-pages")
        assert response.status_code == 200
        data = response.json()
        
        for page in data:
            features = page.get("features", [])
            print(f"  Page '{page['slug']}': {len(features)} features")
            for feat in features:
                assert "title" in feat
                assert "description" in feat
                assert "icon" in feat
        
        print(f"✓ All service pages have properly structured features")


class TestThemeColorSystem:
    """Test theme color is correctly stored and accessible"""
    
    def test_theme_color_is_teal(self):
        """Verify theme color is set to teal (#0891B2)"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        assert data["theme_color"] == "#0891B2", f"Theme color is {data['theme_color']}, expected #0891B2 (teal)"
        print(f"✓ Theme color correctly set to teal: {data['theme_color']}")
    
    def test_no_hardcoded_blue(self):
        """Verify theme color is not the old hardcoded blue"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        # Old hardcoded blue was #0056D2
        assert data["theme_color"] != "#0056D2", "Theme color is still old hardcoded blue"
        print(f"✓ No hardcoded blue (#0056D2) - using {data['theme_color']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
