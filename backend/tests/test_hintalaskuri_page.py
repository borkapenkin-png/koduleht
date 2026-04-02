"""
Test suite for Hintalaskuri page with DynamicServicePage sections
Tests the new feature: DynamicServicePage-like sections below the calculator
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHintalaskuriAPI:
    """Test the hintalaskuri service page API endpoint"""
    
    def test_hintalaskuri_page_exists(self):
        """Test that /api/service-pages/hintalaskuri returns page data"""
        response = requests.get(f"{BASE_URL}/api/service-pages/hintalaskuri")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Verify required fields
        assert data.get('slug') == 'hintalaskuri', "Slug should be 'hintalaskuri'"
        assert data.get('is_published') == True, "Page should be published"
        assert 'seo_title' in data, "Should have seo_title"
        assert 'seo_description' in data, "Should have seo_description"
        print(f"✓ Hintalaskuri page exists with slug: {data['slug']}")
    
    def test_hintalaskuri_page_has_description(self):
        """Test that hintalaskuri page has description section content"""
        response = requests.get(f"{BASE_URL}/api/service-pages/hintalaskuri")
        assert response.status_code == 200
        data = response.json()
        
        assert 'description_title' in data, "Should have description_title"
        assert 'description_text' in data, "Should have description_text"
        assert len(data.get('description_text', '')) > 100, "Description text should be substantial"
        print(f"✓ Description title: {data['description_title']}")
        print(f"✓ Description text length: {len(data.get('description_text', ''))} chars")
    
    def test_hintalaskuri_page_has_features(self):
        """Test that hintalaskuri page has features section (4 service category cards)"""
        response = requests.get(f"{BASE_URL}/api/service-pages/hintalaskuri")
        assert response.status_code == 200
        data = response.json()
        
        features = data.get('features', [])
        assert len(features) == 4, f"Expected 4 features, got {len(features)}"
        
        # Check feature structure
        for feature in features:
            assert 'title' in feature, "Feature should have title"
            assert 'description' in feature, "Feature should have description"
            assert 'icon' in feature, "Feature should have icon"
        
        # Check expected feature titles
        feature_titles = [f['title'] for f in features]
        expected_titles = ['Sisämaalaus', 'Tasoitustyöt', 'Julkisivumaalaus', 'Mikrosementti']
        for title in expected_titles:
            assert title in feature_titles, f"Expected feature '{title}' not found"
        
        print(f"✓ Features: {feature_titles}")
    
    def test_hintalaskuri_page_has_why_items(self):
        """Test that hintalaskuri page has 'Why Choose Us' items"""
        response = requests.get(f"{BASE_URL}/api/service-pages/hintalaskuri")
        assert response.status_code == 200
        data = response.json()
        
        why_items = data.get('why_items', [])
        assert len(why_items) >= 6, f"Expected at least 6 why_items, got {len(why_items)}"
        
        # Check for expected content
        why_text = ' '.join(why_items).lower()
        assert 'kotitalousvähennys' in why_text or 'hinta-arvio' in why_text, "Should mention kotitalousvähennys or hinta-arvio"
        
        print(f"✓ Why items count: {len(why_items)}")
        for item in why_items[:3]:
            print(f"  - {item}")
    
    def test_hintalaskuri_page_has_process_settings(self):
        """Test that hintalaskuri page has process section settings"""
        response = requests.get(f"{BASE_URL}/api/service-pages/hintalaskuri")
        assert response.status_code == 200
        data = response.json()
        
        assert 'process_title' in data, "Should have process_title"
        assert 'use_global_process' in data, "Should have use_global_process"
        print(f"✓ Process title: {data.get('process_title')}")
        print(f"✓ Use global process: {data.get('use_global_process')}")
    
    def test_hintalaskuri_page_has_cta(self):
        """Test that hintalaskuri page has CTA section"""
        response = requests.get(f"{BASE_URL}/api/service-pages/hintalaskuri")
        assert response.status_code == 200
        data = response.json()
        
        assert 'cta_title' in data, "Should have cta_title"
        assert 'cta_text' in data, "Should have cta_text"
        assert len(data.get('cta_title', '')) > 0, "CTA title should not be empty"
        print(f"✓ CTA title: {data.get('cta_title')}")


class TestServicePagesNoRegression:
    """Test that existing service pages still work after adding hintalaskuri"""
    
    def test_maalaustyot_helsinki_still_works(self):
        """Test that /maalaustyot-helsinki service page still works"""
        response = requests.get(f"{BASE_URL}/api/service-pages/maalaustyot-helsinki")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data.get('slug') == 'maalaustyot-helsinki'
        assert 'Maalaustyöt' in data.get('hero_title', '')
        print(f"✓ maalaustyot-helsinki works: {data.get('hero_title')}")
    
    def test_all_service_pages_list(self):
        """Test that /api/service-pages returns all pages including hintalaskuri"""
        response = requests.get(f"{BASE_URL}/api/service-pages")
        assert response.status_code == 200
        pages = response.json()
        
        slugs = [p['slug'] for p in pages]
        assert 'hintalaskuri' in slugs, "hintalaskuri should be in service pages list"
        assert 'maalaustyot-helsinki' in slugs, "maalaustyot-helsinki should still exist"
        
        print(f"✓ Total service pages: {len(pages)}")
        print(f"✓ Slugs: {slugs}")


class TestHintalaskuriFAQs:
    """Test FAQs for hintalaskuri (expected to be empty)"""
    
    def test_hintalaskuri_faqs_endpoint(self):
        """Test that FAQs endpoint works for hintalaskuri"""
        response = requests.get(f"{BASE_URL}/api/faqs?service_id=hintalaskuri")
        assert response.status_code == 200
        faqs = response.json()
        
        # Per agent context, there are no FAQs with service_id=hintalaskuri yet
        print(f"✓ FAQs for hintalaskuri: {len(faqs)} (expected 0)")


class TestAdminServicePagesAccess:
    """Test admin access to service pages including hintalaskuri"""
    
    @pytest.fixture
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin",
            "password": "jbadmin2024"
        })
        if response.status_code == 200:
            return response.json().get('access_token')
        pytest.skip("Admin login failed")
    
    def test_admin_can_see_hintalaskuri_page(self, auth_token):
        """Test that admin can see hintalaskuri in service pages list"""
        response = requests.get(
            f"{BASE_URL}/api/admin/service-pages",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        pages = response.json()
        
        hintalaskuri_page = next((p for p in pages if p['slug'] == 'hintalaskuri'), None)
        assert hintalaskuri_page is not None, "Admin should see hintalaskuri page"
        print(f"✓ Admin can see hintalaskuri page with id: {hintalaskuri_page.get('id')}")


class TestCalculatorConfig:
    """Test that calculator config still works"""
    
    def test_calculator_config_endpoint(self):
        """Test that /api/calculator-config returns valid config"""
        response = requests.get(f"{BASE_URL}/api/calculator-config")
        assert response.status_code == 200
        config = response.json()
        
        assert 'services' in config, "Should have services"
        assert len(config['services']) >= 6, "Should have at least 6 services"
        print(f"✓ Calculator config has {len(config['services'])} services")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
