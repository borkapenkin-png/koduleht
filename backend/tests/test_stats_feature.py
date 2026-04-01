"""
Test suite for company stats feature and trust badges relocation
Tests:
1. API endpoint /api/settings returns company_stats array with 4 items
2. Admin login works
3. Admin can update company_stats
4. Trust badges are in settings (footer_trust_badge_1, footer_trust_badge_2)
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCompanyStatsAPI:
    """Test company stats in settings API"""
    
    def test_settings_returns_company_stats(self):
        """Verify /api/settings returns company_stats array"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "company_stats" in data, "company_stats field missing from settings"
        
        stats = data["company_stats"]
        assert isinstance(stats, list), "company_stats should be a list"
        assert len(stats) == 4, f"Expected 4 stats, got {len(stats)}"
        
        # Verify each stat has value and label
        for i, stat in enumerate(stats):
            assert "value" in stat, f"Stat {i} missing 'value' field"
            assert "label" in stat, f"Stat {i} missing 'label' field"
        
        print(f"✓ company_stats has {len(stats)} items")
    
    def test_company_stats_expected_values(self):
        """Verify company_stats contains expected values"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        
        data = response.json()
        stats = data.get("company_stats", [])
        
        # Expected values
        expected_values = ["300+", "3,7M€", "18", "40 000+"]
        found_values = [s.get("value", "") for s in stats]
        
        for expected in expected_values:
            assert expected in found_values, f"Expected stat value '{expected}' not found"
        
        print(f"✓ All expected stat values found: {expected_values}")
    
    def test_trust_badges_in_settings(self):
        """Verify trust badge URLs are in settings"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        
        data = response.json()
        
        # Trust badges should be in footer_trust_badge_1 and footer_trust_badge_2
        badge1 = data.get("footer_trust_badge_1", "")
        badge2 = data.get("footer_trust_badge_2", "")
        
        # At least one badge should be set
        assert badge1 or badge2, "No trust badges configured in settings"
        
        if badge1:
            print(f"✓ Trust badge 1: {badge1[:50]}...")
        if badge2:
            print(f"✓ Trust badge 2: {badge2[:50]}...")


class TestAdminAuth:
    """Test admin authentication"""
    
    def test_admin_login_success(self):
        """Verify admin login works with correct credentials"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin",
            "password": "jbadmin2024"
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        
        data = response.json()
        assert "access_token" in data, "No access_token in response"
        assert data.get("token_type") == "bearer", "Invalid token type"
        
        print("✓ Admin login successful")
        return data["access_token"]
    
    def test_admin_login_wrong_password(self):
        """Verify admin login fails with wrong password"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin",
            "password": "wrongpassword"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Admin login correctly rejects wrong password")


class TestAdminStatsManagement:
    """Test admin can manage company stats"""
    
    @pytest.fixture
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin",
            "password": "jbadmin2024"
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin login failed")
    
    def test_admin_can_read_settings(self, auth_token):
        """Verify admin can read settings"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/settings", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "company_stats" in data
        print("✓ Admin can read settings with company_stats")
    
    def test_admin_can_update_stats(self, auth_token):
        """Verify admin can update company_stats"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Get current settings
        response = requests.get(f"{BASE_URL}/api/settings", headers=headers)
        current_stats = response.json().get("company_stats", [])
        
        # Update with same stats (to not break the site)
        update_data = {"company_stats": current_stats}
        response = requests.put(f"{BASE_URL}/api/admin/settings", 
                               json=update_data, 
                               headers=headers)
        assert response.status_code == 200, f"Update failed: {response.text}"
        
        # Verify update persisted
        response = requests.get(f"{BASE_URL}/api/settings")
        updated_stats = response.json().get("company_stats", [])
        assert len(updated_stats) == len(current_stats)
        
        print("✓ Admin can update company_stats")


class TestServicesAPI:
    """Test services API still works"""
    
    def test_services_endpoint(self):
        """Verify /api/services returns services"""
        response = requests.get(f"{BASE_URL}/api/services")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "No services returned"
        
        print(f"✓ Services API returns {len(data)} services")


class TestReferencesAPI:
    """Test references API still works"""
    
    def test_references_endpoint(self):
        """Verify /api/references returns references"""
        response = requests.get(f"{BASE_URL}/api/references")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "No references returned"
        
        print(f"✓ References API returns {len(data)} references")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
