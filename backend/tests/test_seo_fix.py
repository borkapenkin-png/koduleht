"""
SEO Fix Verification Tests
Tests for SSG (Static Site Generation) templates and SEO content
"""
import pytest
import requests
import os
from pathlib import Path

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://maalaus-calc.preview.emergentagent.com')
BUILD_DIR = Path("/app/frontend/build")


class TestAPIEndpoints:
    """Test API endpoints return valid JSON"""
    
    def test_settings_api_returns_json(self):
        """Test /api/settings returns valid JSON"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        assert "company_name" in data
        assert "hero_title_1" in data
        print(f"✓ /api/settings returns valid JSON with company_name: {data.get('company_name')}")
    
    def test_services_api_returns_json(self):
        """Test /api/services returns valid JSON array"""
        response = requests.get(f"{BASE_URL}/api/services")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        # Check first service has required fields
        first_service = data[0]
        assert "title" in first_service
        assert "description" in first_service
        print(f"✓ /api/services returns {len(data)} services")
    
    def test_references_api_returns_json(self):
        """Test /api/references returns valid JSON array"""
        response = requests.get(f"{BASE_URL}/api/references")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        # Check first reference has required fields
        first_ref = data[0]
        assert "name" in first_ref
        assert "type" in first_ref
        print(f"✓ /api/references returns {len(data)} references")


class TestSSGBuildFiles:
    """Test SSG generated HTML files in build directory"""
    
    def test_build_index_has_seo_prerender(self):
        """Verify build/index.html contains data-seo-prerender attribute"""
        index_path = BUILD_DIR / "index.html"
        assert index_path.exists(), "build/index.html does not exist"
        content = index_path.read_text()
        assert 'data-seo-prerender="true"' in content, "data-seo-prerender attribute not found"
        print("✓ build/index.html contains data-seo-prerender attribute")
    
    def test_maalaustyot_has_h1(self):
        """Verify build/maalaustyot-helsinki.html contains H1 with correct text"""
        file_path = BUILD_DIR / "maalaustyot-helsinki.html"
        assert file_path.exists(), "maalaustyot-helsinki.html does not exist"
        content = file_path.read_text()
        assert "<h1>" in content, "H1 tag not found"
        assert "Maalaustyöt Helsingissä" in content, "Expected H1 text not found"
        print("✓ build/maalaustyot-helsinki.html contains H1 with 'Maalaustyöt Helsingissä'")
    
    def test_tasoitustyot_has_h1(self):
        """Verify build/tasoitustyot-helsinki.html contains H1"""
        file_path = BUILD_DIR / "tasoitustyot-helsinki.html"
        assert file_path.exists(), "tasoitustyot-helsinki.html does not exist"
        content = file_path.read_text()
        assert "<h1>" in content, "H1 tag not found"
        assert "Tasoitustyöt Helsingissä" in content, "Expected H1 text not found"
        print("✓ build/tasoitustyot-helsinki.html contains H1 with 'Tasoitustyöt Helsingissä'")
    
    def test_ukk_has_faq_questions(self):
        """Verify build/ukk.html contains FAQ questions (52 H3 tags)"""
        file_path = BUILD_DIR / "ukk.html"
        assert file_path.exists(), "ukk.html does not exist"
        content = file_path.read_text()
        h3_count = content.count("<h3>")
        assert h3_count >= 50, f"Expected at least 50 H3 tags, found {h3_count}"
        print(f"✓ build/ukk.html contains {h3_count} H3 tags (FAQ questions)")
    
    def test_referenssit_exists(self):
        """Verify build/referenssit.html exists"""
        file_path = BUILD_DIR / "referenssit.html"
        assert file_path.exists(), "referenssit.html does not exist"
        content = file_path.read_text()
        assert "<h1>" in content, "H1 tag not found"
        assert "Referenssit" in content, "Expected H1 text not found"
        print("✓ build/referenssit.html exists with H1 'Referenssit'")
    
    def test_all_service_pages_exist(self):
        """Verify all service page HTML files exist"""
        service_pages = [
            "maalaustyot-helsinki.html",
            "tasoitustyot-helsinki.html",
            "mikrosementti-helsinki.html",
            "julkisivurappaus-helsinki.html",
            "julkisivumaalaus-helsinki.html",
            "kattomaalaus-helsinki.html"
        ]
        for page in service_pages:
            file_path = BUILD_DIR / page
            assert file_path.exists(), f"{page} does not exist"
        print(f"✓ All {len(service_pages)} service page HTML files exist")


class TestSSGContent:
    """Test SSG content quality for SEO"""
    
    def test_index_has_navigation(self):
        """Verify index.html has navigation links for crawlers"""
        index_path = BUILD_DIR / "index.html"
        content = index_path.read_text()
        assert 'href="/#palvelut"' in content, "Palvelut link not found"
        assert 'href="/referenssit"' in content, "Referenssit link not found"
        assert 'href="/ukk"' in content, "UKK link not found"
        print("✓ build/index.html has navigation links for crawlers")
    
    def test_index_has_services_section(self):
        """Verify index.html has services section with content"""
        index_path = BUILD_DIR / "index.html"
        content = index_path.read_text()
        assert 'id="palvelut"' in content, "Palvelut section not found"
        assert "Palvelumme" in content, "Services heading not found"
        print("✓ build/index.html has services section")
    
    def test_index_has_contact_section(self):
        """Verify index.html has contact section"""
        index_path = BUILD_DIR / "index.html"
        content = index_path.read_text()
        assert 'id="yhteystiedot"' in content, "Yhteystiedot section not found"
        assert "info@jbtasoitusmaalaus.fi" in content, "Email not found"
        print("✓ build/index.html has contact section with email")
    
    def test_service_page_has_breadcrumbs(self):
        """Verify service pages have breadcrumb navigation"""
        file_path = BUILD_DIR / "maalaustyot-helsinki.html"
        content = file_path.read_text()
        assert 'aria-label="Murupolku"' in content, "Breadcrumb nav not found"
        assert "Etusivu" in content, "Etusivu breadcrumb not found"
        print("✓ Service pages have breadcrumb navigation")
    
    def test_pages_have_json_ld(self):
        """Verify pages have JSON-LD structured data"""
        index_path = BUILD_DIR / "index.html"
        content = index_path.read_text()
        assert 'application/ld+json' in content, "JSON-LD script not found"
        assert '"@type": "LocalBusiness"' in content, "LocalBusiness schema not found"
        print("✓ Pages have JSON-LD structured data")


class TestFrontendPages:
    """Test frontend pages load correctly via HTTP"""
    
    def test_homepage_loads(self):
        """Test homepage loads with 200 status"""
        response = requests.get(f"{BASE_URL}/")
        assert response.status_code == 200
        assert "J&B Tasoitus" in response.text or "Ammattitaitoista" in response.text
        print("✓ Homepage loads with 200 status")
    
    def test_maalaustyot_page_loads(self):
        """Test /maalaustyot-helsinki loads"""
        response = requests.get(f"{BASE_URL}/maalaustyot-helsinki")
        assert response.status_code == 200
        print("✓ /maalaustyot-helsinki loads with 200 status")
    
    def test_tasoitustyot_page_loads(self):
        """Test /tasoitustyot-helsinki loads"""
        response = requests.get(f"{BASE_URL}/tasoitustyot-helsinki")
        assert response.status_code == 200
        print("✓ /tasoitustyot-helsinki loads with 200 status")
    
    def test_ukk_page_loads(self):
        """Test /ukk loads"""
        response = requests.get(f"{BASE_URL}/ukk")
        assert response.status_code == 200
        print("✓ /ukk loads with 200 status")
    
    def test_referenssit_page_loads(self):
        """Test /referenssit loads"""
        response = requests.get(f"{BASE_URL}/referenssit")
        assert response.status_code == 200
        print("✓ /referenssit loads with 200 status")
    
    def test_admin_page_loads(self):
        """Test /admin loads"""
        response = requests.get(f"{BASE_URL}/admin")
        assert response.status_code == 200
        print("✓ /admin loads with 200 status")


class TestAdminLogin:
    """Test admin authentication"""
    
    def test_admin_login_success(self):
        """Test admin login with correct credentials"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin",
            "password": "jbadmin2024"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        print("✓ Admin login successful with correct credentials")
    
    def test_admin_login_failure(self):
        """Test admin login with wrong credentials"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Admin login correctly rejects wrong credentials")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
