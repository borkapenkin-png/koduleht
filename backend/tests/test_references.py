"""
Tests for the References section feature - image-based cards with contractor support
Tests cover: API endpoints, new fields (cover_image_url, main_contractor, location, year, is_published)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')

class TestReferencesPublicAPI:
    """Test public references endpoints"""
    
    def test_get_references_returns_list(self):
        """GET /api/references returns a list of references"""
        response = requests.get(f"{BASE_URL}/api/references")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of references"
        print(f"PASS: GET /api/references returns {len(data)} references")

    def test_references_have_new_fields(self):
        """References include new fields: cover_image_url, main_contractor, location"""
        response = requests.get(f"{BASE_URL}/api/references")
        assert response.status_code == 200
        data = response.json()
        
        # Check at least one reference exists with new fields
        assert len(data) > 0, "Expected at least one reference"
        
        ref = data[0]
        # Check new fields exist (can be null but should be present)
        assert 'cover_image_url' in ref, "Missing cover_image_url field"
        assert 'main_contractor' in ref, "Missing main_contractor field"
        assert 'location' in ref, "Missing location field"
        assert 'year' in ref, "Missing year field"
        assert 'is_published' in ref, "Missing is_published field"
        assert 'gallery_images' in ref, "Missing gallery_images field"
        
        print(f"PASS: Reference has all new fields")
        print(f"  - name: {ref.get('name')}")
        print(f"  - type: {ref.get('type')}")
        print(f"  - cover_image_url: {ref.get('cover_image_url')}")
        print(f"  - main_contractor: {ref.get('main_contractor')}")
        print(f"  - location: {ref.get('location')}")

    def test_references_have_sample_data(self):
        """Verify sample references with images and contractors exist"""
        response = requests.get(f"{BASE_URL}/api/references")
        assert response.status_code == 200
        data = response.json()
        
        # Check we have at least 4 references (to show "Näytä lisää" button)
        assert len(data) >= 4, f"Expected at least 4 references for 'Näytä lisää' feature, got {len(data)}"
        
        # Check contractors are present
        contractors = [r.get('main_contractor') for r in data if r.get('main_contractor')]
        assert len(contractors) > 0, "Expected at least one reference with main_contractor"
        
        # Check cover images are present
        images = [r.get('cover_image_url') for r in data if r.get('cover_image_url')]
        assert len(images) > 0, "Expected at least one reference with cover_image_url"
        
        print(f"PASS: {len(data)} references found")
        print(f"  - {len(contractors)} with contractors: {set(contractors)}")
        print(f"  - {len(images)} with cover images")

    def test_references_only_published_returned(self):
        """Public API should only return published references"""
        response = requests.get(f"{BASE_URL}/api/references")
        assert response.status_code == 200
        data = response.json()
        
        for ref in data:
            # is_published should be True or not exist (defaults to True)
            assert ref.get('is_published', True) == True, f"Unpublished reference {ref.get('name')} should not be in public API"
        
        print(f"PASS: All {len(data)} references are published")


class TestSettingsReferencesSection:
    """Test settings for references section display logic"""
    
    def test_settings_have_references_fields(self):
        """GET /api/settings returns references section settings"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        
        # Check references section settings exist
        assert 'references_subtitle' in data, "Missing references_subtitle"
        assert 'references_title' in data, "Missing references_title"
        assert 'references_initial_count_desktop' in data, "Missing references_initial_count_desktop"
        assert 'references_initial_count_mobile' in data, "Missing references_initial_count_mobile"
        assert 'references_load_more_enabled' in data, "Missing references_load_more_enabled"
        assert 'references_show_more_text' in data, "Missing references_show_more_text"
        assert 'references_show_less_text' in data, "Missing references_show_less_text"
        
        print(f"PASS: Settings have all references section fields")
        print(f"  - subtitle: {data.get('references_subtitle')}")
        print(f"  - title: {data.get('references_title')}")
        print(f"  - initial_count_desktop: {data.get('references_initial_count_desktop')}")
        print(f"  - show_more_text: {data.get('references_show_more_text')}")
        print(f"  - show_less_text: {data.get('references_show_less_text')}")

    def test_settings_references_defaults(self):
        """Verify default values for references settings"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        
        # Check expected default values
        assert data.get('references_initial_count_desktop') == 4, "Expected initial_count_desktop=4"
        assert data.get('references_initial_count_mobile') == 2, "Expected initial_count_mobile=2"
        assert data.get('references_load_more_enabled') == True, "Expected load_more_enabled=True"
        assert data.get('references_show_more_text') == "Näytä lisää", "Expected show_more_text='Näytä lisää'"
        assert data.get('references_show_less_text') == "Näytä vähemmän", "Expected show_less_text='Näytä vähemmän'"
        
        print("PASS: References settings have correct defaults")


class TestAdminReferencesAPI:
    """Test admin references endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin",
            "password": "jbadmin2024"
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed - skipping admin tests")
    
    def test_admin_get_all_references(self, auth_token):
        """GET /api/admin/references returns all references including unpublished"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/references", headers=headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of references"
        
        print(f"PASS: Admin GET /api/admin/references returns {len(data)} references")
        
        # Verify structure of first reference
        if len(data) > 0:
            ref = data[0]
            assert 'id' in ref
            assert 'name' in ref
            assert 'type' in ref
            assert 'cover_image_url' in ref
            assert 'main_contractor' in ref
            print(f"  - First reference: {ref.get('name')} (contractor: {ref.get('main_contractor')})")

    def test_admin_create_reference_with_new_fields(self, auth_token):
        """Admin can create reference with new fields"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        new_ref = {
            "name": "TEST_New Project 2024",
            "type": "Maalaustyöt",
            "description": "Test reference for automated testing",
            "main_contractor": "TEST Contractor Oy",
            "location": "Tampere",
            "year": "2024",
            "cover_image_url": "https://example.com/test-image.jpg",
            "is_published": True,
            "order": 99
        }
        
        response = requests.post(f"{BASE_URL}/api/admin/references", json=new_ref, headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        created = response.json()
        assert created['name'] == new_ref['name']
        assert created['main_contractor'] == new_ref['main_contractor']
        assert created['location'] == new_ref['location']
        assert created['year'] == new_ref['year']
        assert created['cover_image_url'] == new_ref['cover_image_url']
        assert 'id' in created
        
        print(f"PASS: Created reference with ID {created['id']}")
        
        # Cleanup - delete the test reference
        delete_response = requests.delete(f"{BASE_URL}/api/admin/references/{created['id']}", headers=headers)
        assert delete_response.status_code == 200, f"Cleanup failed: {delete_response.text}"
        print(f"  - Cleaned up test reference")

    def test_admin_update_reference(self, auth_token):
        """Admin can update reference fields"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Get first reference to update
        response = requests.get(f"{BASE_URL}/api/admin/references", headers=headers)
        refs = response.json()
        assert len(refs) > 0, "No references to update"
        
        ref_id = refs[0]['id']
        original_name = refs[0]['name']
        
        # Update with PUT
        update_data = {
            "main_contractor": "Updated Contractor TEST"
        }
        
        update_response = requests.put(f"{BASE_URL}/api/admin/references/{ref_id}", json=update_data, headers=headers)
        assert update_response.status_code == 200, f"Update failed: {update_response.text}"
        
        updated = update_response.json()
        assert updated['main_contractor'] == "Updated Contractor TEST"
        assert updated['name'] == original_name  # Name should not change
        
        print(f"PASS: Updated reference {ref_id}")
        
        # Revert the change
        revert_data = {"main_contractor": refs[0].get('main_contractor', 'NCC')}
        requests.put(f"{BASE_URL}/api/admin/references/{ref_id}", json=revert_data, headers=headers)
        print(f"  - Reverted changes")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
