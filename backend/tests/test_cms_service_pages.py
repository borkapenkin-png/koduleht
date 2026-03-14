"""
CMS Service Pages API Tests
Tests for the new Finnish SEO-friendly service page URLs and admin CRUD operations
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://ssg-production-fix.preview.emergentagent.com')

# Expected service page slugs (Finnish SEO-friendly URLs)
EXPECTED_SLUGS = [
    "tasoitustyot-helsinki",
    "maalaustyot-helsinki", 
    "mikrosementti-helsinki",
    "julkisivurappaus-helsinki",
    "kattomaalaus-helsinki",
    "julkisivumaalaus-helsinki"
]


class TestPublicServicePagesAPI:
    """Tests for public service pages endpoints"""
    
    def test_get_all_service_pages(self):
        """GET /api/service-pages should return all published service pages"""
        response = requests.get(f"{BASE_URL}/api/service-pages")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) >= 6, f"Expected at least 6 service pages, got {len(data)}"
        
        # Verify all expected slugs exist
        slugs = [page["slug"] for page in data]
        for expected_slug in EXPECTED_SLUGS:
            assert expected_slug in slugs, f"Missing expected slug: {expected_slug}"
        
        print(f"✓ Found {len(data)} service pages with all expected slugs")
    
    def test_get_service_page_tasoitustyot(self):
        """GET /api/service-pages/tasoitustyot-helsinki should return the tasoitustyot page"""
        response = requests.get(f"{BASE_URL}/api/service-pages/tasoitustyot-helsinki")
        assert response.status_code == 200
        
        data = response.json()
        assert data["slug"] == "tasoitustyot-helsinki"
        assert data["is_published"] == True
        assert "Tasoitustyöt" in data["hero_title"]
        assert data["seo_title"] is not None
        assert data["seo_description"] is not None
        print(f"✓ Tasoitustyöt page: {data['hero_title']}")
    
    def test_get_service_page_maalaustyot(self):
        """GET /api/service-pages/maalaustyot-helsinki should return the maalaustyot page"""
        response = requests.get(f"{BASE_URL}/api/service-pages/maalaustyot-helsinki")
        assert response.status_code == 200
        
        data = response.json()
        assert data["slug"] == "maalaustyot-helsinki"
        assert "Maalaustyöt" in data["hero_title"]
        print(f"✓ Maalaustyöt page: {data['hero_title']}")
    
    def test_get_service_page_mikrosementti(self):
        """GET /api/service-pages/mikrosementti-helsinki should return the mikrosementti page"""
        response = requests.get(f"{BASE_URL}/api/service-pages/mikrosementti-helsinki")
        assert response.status_code == 200
        
        data = response.json()
        assert data["slug"] == "mikrosementti-helsinki"
        assert "Mikrosementti" in data["hero_title"]
        print(f"✓ Mikrosementti page: {data['hero_title']}")
    
    def test_get_service_page_julkisivurappaus(self):
        """GET /api/service-pages/julkisivurappaus-helsinki should return the julkisivurappaus page"""
        response = requests.get(f"{BASE_URL}/api/service-pages/julkisivurappaus-helsinki")
        assert response.status_code == 200
        
        data = response.json()
        assert data["slug"] == "julkisivurappaus-helsinki"
        assert "Julkisivurappaus" in data["hero_title"]
        print(f"✓ Julkisivurappaus page: {data['hero_title']}")
    
    def test_get_service_page_kattomaalaus(self):
        """GET /api/service-pages/kattomaalaus-helsinki should return the kattomaalaus page"""
        response = requests.get(f"{BASE_URL}/api/service-pages/kattomaalaus-helsinki")
        assert response.status_code == 200
        
        data = response.json()
        assert data["slug"] == "kattomaalaus-helsinki"
        assert "Maalaukset" in data["hero_title"] or "maalau" in data["hero_title"].lower()
        print(f"✓ Kattomaalaus page: {data['hero_title']}")
    
    def test_get_service_page_julkisivumaalaus(self):
        """GET /api/service-pages/julkisivumaalaus-helsinki should return the julkisivumaalaus page"""
        response = requests.get(f"{BASE_URL}/api/service-pages/julkisivumaalaus-helsinki")
        assert response.status_code == 200
        
        data = response.json()
        assert data["slug"] == "julkisivumaalaus-helsinki"
        assert "Julkisiv" in data["hero_title"]
        print(f"✓ Julkisivumaalaus page: {data['hero_title']}")
    
    def test_get_nonexistent_service_page(self):
        """GET /api/service-pages/nonexistent should return 404"""
        response = requests.get(f"{BASE_URL}/api/service-pages/nonexistent-slug")
        assert response.status_code == 404
        print("✓ Nonexistent page correctly returns 404")


class TestGlobalSettings:
    """Tests for global settings (trust badges, contact info, etc.)"""
    
    def test_get_settings(self):
        """GET /api/settings should return global settings"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        
        data = response.json()
        # Verify trust badges
        assert "trust_badge_1_title" in data
        assert "trust_badge_2_title" in data
        assert "trust_badge_3_title" in data
        assert "trust_badge_4_title" in data
        
        # Verify company info
        assert "company_name" in data
        assert "company_phone_primary" in data
        assert "company_email" in data
        
        # Verify service areas
        assert "service_areas" in data
        assert isinstance(data["service_areas"], list)
        assert len(data["service_areas"]) > 0
        
        # Verify process steps
        assert "process_step_1_title" in data
        assert "process_step_2_title" in data
        assert "process_step_3_title" in data
        assert "process_step_4_title" in data
        
        print(f"✓ Global settings loaded with {len(data.get('service_areas', []))} service areas")
        print(f"  Trust badges: {data.get('trust_badge_1_title')}, {data.get('trust_badge_2_title')}, {data.get('trust_badge_3_title')}, {data.get('trust_badge_4_title')}")


class TestPublicServices:
    """Tests for public services endpoint (homepage services)"""
    
    def test_get_services(self):
        """GET /api/services should return all 6 services"""
        response = requests.get(f"{BASE_URL}/api/services")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 6, f"Expected at least 6 services, got {len(data)}"
        
        # Verify expected service titles exist
        expected_titles = ["Tasoitustyöt", "Maalaustyöt", "Mikrosementti", "Julkisivurappaus"]
        titles = [s["title"] for s in data]
        for expected in expected_titles:
            assert any(expected in title for title in titles), f"Missing service: {expected}"
        
        print(f"✓ Found {len(data)} services on homepage")
        for s in data:
            print(f"  - {s['title']}")


class TestAdminLogin:
    """Tests for admin authentication"""
    
    def test_admin_login_success(self):
        """POST /api/admin/login with valid credentials should return token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin",
            "password": "jbadmin2024"
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["username"] == "admin"
        print("✓ Admin login successful")
        return data["access_token"]
    
    def test_admin_login_invalid_credentials(self):
        """POST /api/admin/login with invalid credentials should return 401"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Invalid credentials correctly rejected")
    
    def test_admin_verify_token(self):
        """GET /api/admin/verify should validate token"""
        # First login
        login_response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin",
            "password": "jbadmin2024"
        })
        token = login_response.json()["access_token"]
        
        # Verify token
        response = requests.get(f"{BASE_URL}/api/admin/verify", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        
        data = response.json()
        assert data["authenticated"] == True
        assert data["username"] == "admin"
        print("✓ Token verification successful")


class TestAdminServicePages:
    """Tests for admin service pages CRUD operations"""
    
    @pytest.fixture(autouse=True)
    def setup_token(self):
        """Get auth token before each test"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin",
            "password": "jbadmin2024"
        })
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_admin_get_all_service_pages(self):
        """GET /api/admin/service-pages should return all pages (including unpublished)"""
        response = requests.get(f"{BASE_URL}/api/admin/service-pages", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 6
        print(f"✓ Admin can see {len(data)} service pages")
    
    def test_admin_service_pages_requires_auth(self):
        """GET /api/admin/service-pages without auth should return 401"""
        response = requests.get(f"{BASE_URL}/api/admin/service-pages")
        assert response.status_code == 401
        print("✓ Admin endpoints correctly require authentication")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
