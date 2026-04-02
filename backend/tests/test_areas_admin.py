"""
Test Areas (Cities/Locations) Admin API
Tests CRUD operations for /api/admin/areas endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://maalaus-calc.preview.emergentagent.com')

# Test credentials
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "jbadmin2024"


class TestAreasAdminAPI:
    """Test Areas Admin API endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get token
        login_response = self.session.post(f"{BASE_URL}/api/admin/login", json={
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD
        })
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        self.token = login_response.json()["access_token"]
        self.session.headers.update({"Authorization": f"Bearer {self.token}"})
    
    def test_01_get_areas_public(self):
        """Test GET /api/areas - public endpoint returns areas list"""
        response = requests.get(f"{BASE_URL}/api/areas")
        assert response.status_code == 200, f"GET /api/areas failed: {response.text}"
        
        areas = response.json()
        assert isinstance(areas, list), "Response should be a list"
        print(f"✓ GET /api/areas returned {len(areas)} areas")
        
        # Check if default areas exist (seeded data)
        if len(areas) > 0:
            area_names = [a["name"] for a in areas]
            print(f"  Areas: {area_names}")
            
            # Verify area structure
            for area in areas:
                assert "id" in area, "Area should have id"
                assert "name" in area, "Area should have name"
                assert "slug" in area, "Area should have slug"
                assert "name_inessive" in area, "Area should have name_inessive"
                assert "is_default" in area, "Area should have is_default"
                assert "order" in area, "Area should have order"
    
    def test_02_get_areas_admin(self):
        """Test GET /api/admin/areas - admin endpoint returns areas list"""
        response = self.session.get(f"{BASE_URL}/api/admin/areas")
        assert response.status_code == 200, f"GET /api/admin/areas failed: {response.text}"
        
        areas = response.json()
        assert isinstance(areas, list), "Response should be a list"
        print(f"✓ GET /api/admin/areas returned {len(areas)} areas")
        
        # Check for default cities (Helsinki, Espoo, Vantaa, Kauniainen)
        area_names = [a["name"] for a in areas]
        expected_cities = ["Helsinki", "Espoo", "Vantaa", "Kauniainen"]
        for city in expected_cities:
            if city in area_names:
                print(f"  ✓ Found expected city: {city}")
        
        # Check Helsinki is default
        helsinki = next((a for a in areas if a["name"] == "Helsinki"), None)
        if helsinki:
            assert helsinki.get("is_default") == True, "Helsinki should be the default area"
            print(f"  ✓ Helsinki is marked as default")
    
    def test_03_create_area(self):
        """Test POST /api/admin/areas - create new area"""
        new_area = {
            "name": "TEST_Sipoo",
            "slug": "test-sipoo",
            "name_inessive": "Sipoossa",
            "is_default": False,
            "order": 99
        }
        
        response = self.session.post(f"{BASE_URL}/api/admin/areas", json=new_area)
        assert response.status_code == 200, f"POST /api/admin/areas failed: {response.text}"
        
        created = response.json()
        assert created["name"] == new_area["name"], "Name should match"
        assert created["slug"] == new_area["slug"], "Slug should match"
        assert created["name_inessive"] == new_area["name_inessive"], "Inessive should match"
        assert "id" in created, "Created area should have id"
        
        self.created_area_id = created["id"]
        print(f"✓ Created area: {created['name']} (id: {created['id']})")
        
        # Verify it appears in list
        list_response = self.session.get(f"{BASE_URL}/api/admin/areas")
        areas = list_response.json()
        area_ids = [a["id"] for a in areas]
        assert created["id"] in area_ids, "Created area should appear in list"
        print(f"  ✓ Area appears in list")
        
        return created["id"]
    
    def test_04_create_duplicate_slug_fails(self):
        """Test POST /api/admin/areas - duplicate slug should fail"""
        # Try to create area with existing slug
        duplicate_area = {
            "name": "Another Helsinki",
            "slug": "helsinki",  # This slug already exists
            "name_inessive": "Helsingissä",
            "is_default": False,
            "order": 100
        }
        
        response = self.session.post(f"{BASE_URL}/api/admin/areas", json=duplicate_area)
        assert response.status_code == 400, f"Duplicate slug should return 400, got {response.status_code}"
        print(f"✓ Duplicate slug correctly rejected with 400")
    
    def test_05_update_area(self):
        """Test PUT /api/admin/areas/{id} - update area"""
        # First create an area to update
        new_area = {
            "name": "TEST_UpdateCity",
            "slug": "test-update-city",
            "name_inessive": "UpdateCityssä",
            "is_default": False,
            "order": 98
        }
        create_response = self.session.post(f"{BASE_URL}/api/admin/areas", json=new_area)
        assert create_response.status_code == 200
        area_id = create_response.json()["id"]
        
        # Update the area
        update_data = {
            "name": "TEST_UpdatedCity",
            "order": 50
        }
        update_response = self.session.put(f"{BASE_URL}/api/admin/areas/{area_id}", json=update_data)
        assert update_response.status_code == 200, f"PUT failed: {update_response.text}"
        
        updated = update_response.json()
        assert updated["name"] == "TEST_UpdatedCity", "Name should be updated"
        assert updated["order"] == 50, "Order should be updated"
        assert updated["slug"] == "test-update-city", "Slug should remain unchanged"
        print(f"✓ Updated area: {updated['name']}")
        
        # Cleanup
        self.session.delete(f"{BASE_URL}/api/admin/areas/{area_id}")
    
    def test_06_delete_non_default_area(self):
        """Test DELETE /api/admin/areas/{id} - delete non-default area"""
        # First create an area to delete
        new_area = {
            "name": "TEST_DeleteCity",
            "slug": "test-delete-city",
            "name_inessive": "DeleteCityssä",
            "is_default": False,
            "order": 97
        }
        create_response = self.session.post(f"{BASE_URL}/api/admin/areas", json=new_area)
        assert create_response.status_code == 200
        area_id = create_response.json()["id"]
        
        # Delete the area
        delete_response = self.session.delete(f"{BASE_URL}/api/admin/areas/{area_id}")
        assert delete_response.status_code == 200, f"DELETE failed: {delete_response.text}"
        print(f"✓ Deleted non-default area successfully")
        
        # Verify it's gone
        list_response = self.session.get(f"{BASE_URL}/api/admin/areas")
        areas = list_response.json()
        area_ids = [a["id"] for a in areas]
        assert area_id not in area_ids, "Deleted area should not appear in list"
        print(f"  ✓ Area no longer in list")
    
    def test_07_delete_default_area_fails(self):
        """Test DELETE /api/admin/areas/{id} - deleting default area should fail"""
        # Get the default area (Helsinki)
        list_response = self.session.get(f"{BASE_URL}/api/admin/areas")
        areas = list_response.json()
        
        default_area = next((a for a in areas if a.get("is_default") == True), None)
        if not default_area:
            pytest.skip("No default area found to test deletion")
        
        # Try to delete the default area
        delete_response = self.session.delete(f"{BASE_URL}/api/admin/areas/{default_area['id']}")
        assert delete_response.status_code == 400, f"Deleting default area should return 400, got {delete_response.status_code}"
        print(f"✓ Deleting default area ({default_area['name']}) correctly rejected with 400")
    
    def test_08_update_area_not_found(self):
        """Test PUT /api/admin/areas/{id} - non-existent area returns 404"""
        update_data = {"name": "NonExistent"}
        response = self.session.put(f"{BASE_URL}/api/admin/areas/non-existent-id-12345", json=update_data)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print(f"✓ Update non-existent area returns 404")
    
    def test_09_delete_area_not_found(self):
        """Test DELETE /api/admin/areas/{id} - non-existent area returns 404"""
        response = self.session.delete(f"{BASE_URL}/api/admin/areas/non-existent-id-12345")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print(f"✓ Delete non-existent area returns 404")
    
    def test_10_areas_sorted_by_order(self):
        """Test that areas are returned sorted by order field"""
        response = self.session.get(f"{BASE_URL}/api/admin/areas")
        areas = response.json()
        
        if len(areas) > 1:
            orders = [a["order"] for a in areas]
            assert orders == sorted(orders), "Areas should be sorted by order"
            print(f"✓ Areas are sorted by order: {orders}")
    
    def test_11_regenerate_seo_pages(self):
        """Test POST /api/admin/regenerate-static - regenerate SEO pages"""
        response = self.session.post(f"{BASE_URL}/api/admin/regenerate-static", json={})
        assert response.status_code == 200, f"Regenerate failed: {response.text}"
        
        result = response.json()
        assert "success" in result, "Response should have success field"
        print(f"✓ Regenerate SEO pages: success={result.get('success')}")
    
    def test_cleanup(self):
        """Cleanup - remove any TEST_ prefixed areas"""
        response = self.session.get(f"{BASE_URL}/api/admin/areas")
        areas = response.json()
        
        test_areas = [a for a in areas if a["name"].startswith("TEST_")]
        for area in test_areas:
            self.session.delete(f"{BASE_URL}/api/admin/areas/{area['id']}")
            print(f"  Cleaned up: {area['name']}")
        
        print(f"✓ Cleanup complete - removed {len(test_areas)} test areas")


class TestAreasAdminAuth:
    """Test Areas Admin API authentication"""
    
    def test_admin_areas_requires_auth(self):
        """Test that admin areas endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/areas")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print(f"✓ GET /api/admin/areas requires authentication")
    
    def test_create_area_requires_auth(self):
        """Test that creating area requires authentication"""
        response = requests.post(f"{BASE_URL}/api/admin/areas", json={
            "name": "Unauthorized",
            "slug": "unauthorized",
            "name_inessive": "Unauthorizedissa"
        })
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print(f"✓ POST /api/admin/areas requires authentication")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
