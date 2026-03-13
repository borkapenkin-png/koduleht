"""
Test FAQ CRUD and References Page functionality
Tests for:
- GET /api/faqs (public)
- POST /api/admin/faqs (create)
- PUT /api/admin/faqs/{id} (update)
- DELETE /api/admin/faqs/{id} (delete)
- GET /api/references (for /referenssit page)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "jbadmin2024"


class TestFAQPublicEndpoint:
    """Test public FAQ endpoint for homepage display"""
    
    def test_get_faqs_returns_list(self):
        """GET /api/faqs should return list of FAQs"""
        response = requests.get(f"{BASE_URL}/api/faqs")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "FAQs should be a list"
        print(f"PASS: GET /api/faqs returns {len(data)} FAQs")
    
    def test_faqs_have_required_fields(self):
        """Each FAQ should have question, answer, order fields"""
        response = requests.get(f"{BASE_URL}/api/faqs")
        assert response.status_code == 200
        
        data = response.json()
        if len(data) > 0:
            faq = data[0]
            assert "id" in faq, "FAQ missing 'id' field"
            assert "question" in faq, "FAQ missing 'question' field"
            assert "answer" in faq, "FAQ missing 'answer' field"
            assert "order" in faq, "FAQ missing 'order' field"
            print(f"PASS: FAQs have required fields (id, question, answer, order)")
        else:
            pytest.skip("No FAQs to validate")
    
    def test_faqs_sorted_by_order(self):
        """FAQs should be sorted by order field"""
        response = requests.get(f"{BASE_URL}/api/faqs")
        assert response.status_code == 200
        
        data = response.json()
        if len(data) > 1:
            orders = [f.get('order', 0) for f in data]
            assert orders == sorted(orders), "FAQs should be sorted by order"
            print(f"PASS: FAQs sorted by order: {orders}")
        else:
            print("PASS: Single or no FAQs, sort order N/A")


class TestFAQAdminCRUD:
    """Test admin FAQ CRUD operations - requires auth"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        token = response.json().get("access_token")
        assert token, "No token returned"
        return token
    
    def test_admin_can_view_faqs(self, auth_token):
        """Admin should be able to view all FAQs"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/faqs", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Admin FAQs should be a list"
        print(f"PASS: Admin can view {len(data)} FAQs")
    
    def test_admin_can_create_faq(self, auth_token):
        """Admin should be able to create a new FAQ"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        new_faq = {
            "question": "TEST_FAQ_Question_" + str(os.urandom(4).hex()),
            "answer": "This is a test answer for automated testing",
            "order": 100
        }
        
        response = requests.post(f"{BASE_URL}/api/admin/faqs", json=new_faq, headers=headers)
        assert response.status_code == 200, f"Create failed: {response.text}"
        
        created = response.json()
        assert created.get("question") == new_faq["question"], "Question mismatch"
        assert created.get("answer") == new_faq["answer"], "Answer mismatch"
        assert "id" in created, "Created FAQ missing ID"
        
        # Clean up - delete the test FAQ
        faq_id = created["id"]
        delete_response = requests.delete(f"{BASE_URL}/api/admin/faqs/{faq_id}", headers=headers)
        assert delete_response.status_code == 200, f"Cleanup delete failed: {delete_response.text}"
        
        print(f"PASS: Admin can create FAQ, created ID: {faq_id}")
    
    def test_admin_can_update_faq(self, auth_token):
        """Admin should be able to update an existing FAQ"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # First create a FAQ to update
        new_faq = {
            "question": "TEST_FAQ_Update_Original",
            "answer": "Original answer",
            "order": 101
        }
        create_response = requests.post(f"{BASE_URL}/api/admin/faqs", json=new_faq, headers=headers)
        assert create_response.status_code == 200
        faq_id = create_response.json()["id"]
        
        # Now update it
        update_data = {
            "question": "TEST_FAQ_Update_Modified",
            "answer": "Modified answer"
        }
        update_response = requests.put(f"{BASE_URL}/api/admin/faqs/{faq_id}", json=update_data, headers=headers)
        assert update_response.status_code == 200, f"Update failed: {update_response.text}"
        
        updated = update_response.json()
        assert updated.get("question") == "TEST_FAQ_Update_Modified", "Question not updated"
        assert updated.get("answer") == "Modified answer", "Answer not updated"
        
        # Clean up
        requests.delete(f"{BASE_URL}/api/admin/faqs/{faq_id}", headers=headers)
        print(f"PASS: Admin can update FAQ")
    
    def test_admin_can_delete_faq(self, auth_token):
        """Admin should be able to delete a FAQ"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Create a FAQ to delete
        new_faq = {
            "question": "TEST_FAQ_Delete",
            "answer": "This will be deleted",
            "order": 102
        }
        create_response = requests.post(f"{BASE_URL}/api/admin/faqs", json=new_faq, headers=headers)
        assert create_response.status_code == 200
        faq_id = create_response.json()["id"]
        
        # Delete it
        delete_response = requests.delete(f"{BASE_URL}/api/admin/faqs/{faq_id}", headers=headers)
        assert delete_response.status_code == 200, f"Delete failed: {delete_response.text}"
        
        # Verify it's deleted (should not be in public list)
        get_response = requests.get(f"{BASE_URL}/api/faqs")
        faqs = get_response.json()
        faq_ids = [f.get("id") for f in faqs]
        assert faq_id not in faq_ids, "FAQ should be deleted"
        
        print(f"PASS: Admin can delete FAQ")
    
    def test_faq_crud_without_auth_fails(self):
        """CRUD operations without auth should fail with 401"""
        # Try to create without auth
        response = requests.post(f"{BASE_URL}/api/admin/faqs", json={"question": "test", "answer": "test"})
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: Create FAQ without auth returns 401")


class TestReferencesPage:
    """Test /api/references for /referenssit page"""
    
    def test_references_endpoint_returns_list(self):
        """GET /api/references should return list"""
        response = requests.get(f"{BASE_URL}/api/references")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list), "References should be a list"
        print(f"PASS: GET /api/references returns {len(data)} references")
    
    def test_references_have_required_fields(self):
        """Each reference should have fields needed for display"""
        response = requests.get(f"{BASE_URL}/api/references")
        assert response.status_code == 200
        
        data = response.json()
        if len(data) > 0:
            ref = data[0]
            assert "id" in ref, "Reference missing 'id'"
            assert "name" in ref, "Reference missing 'name'"
            assert "type" in ref, "Reference missing 'type'"
            # Optional but important for display
            assert "cover_image_url" in ref or "cover_image_url" in ref.keys(), "Reference should have cover_image_url field"
            assert "location" in ref.keys(), "Reference should have location field"
            print(f"PASS: References have required fields")
        else:
            pytest.skip("No references to validate")
    
    def test_references_only_published(self):
        """Public endpoint should only return published references"""
        response = requests.get(f"{BASE_URL}/api/references")
        assert response.status_code == 200
        
        data = response.json()
        for ref in data:
            # is_published should be True or not present (defaults to True)
            is_published = ref.get("is_published", True)
            assert is_published == True, f"Reference {ref.get('name')} should be published"
        print(f"PASS: All {len(data)} references are published")


class TestFAQSchemaData:
    """Test that FAQs return data suitable for JSON-LD schema"""
    
    def test_faq_data_for_schema_markup(self):
        """FAQs should have question and answer for FAQPage schema"""
        response = requests.get(f"{BASE_URL}/api/faqs")
        assert response.status_code == 200
        
        data = response.json()
        for faq in data:
            question = faq.get("question", "")
            answer = faq.get("answer", "")
            
            # Validate content exists for schema
            assert len(question) > 0, "Question should not be empty"
            assert len(answer) > 0, "Answer should not be empty"
            
        print(f"PASS: All {len(data)} FAQs have valid question/answer for schema")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
