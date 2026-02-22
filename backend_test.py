import requests
import sys
from datetime import datetime
import base64

class JBMaalausAPITester:
    def __init__(self, base_url="https://modern-jbta.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.passed_tests = []
        
        # Admin credentials
        self.admin_username = "admin"
        self.admin_password = "jbadmin2024"
        self.admin_auth = (self.admin_username, self.admin_password)

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, auth=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if endpoint else self.api_url
        if not headers:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, auth=auth, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, auth=auth, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, auth=auth, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, auth=auth, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.passed_tests.append(name)
                print(f"✅ Passed - Status: {response.status_code}")
                if response.content:
                    try:
                        resp_json = response.json()
                        print(f"   Response: {str(resp_json)[:100]}...")
                    except:
                        print(f"   Response: {response.text[:100]}...")
            else:
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200] if response.text else "No response"
                })
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")

            return success, response.json() if response.content and success else {}

        except Exception as e:
            self.failed_tests.append({
                "test": name,
                "expected": expected_status,
                "actual": "Exception",
                "response": str(e)
            })
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_api_root(self):
        """Test the API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_contact_form_submission(self):
        """Test contact form submission"""
        test_data = {
            "firstName": "Test",
            "lastName": "User",
            "email": "test@example.com", 
            "phone": "+358 40 123 4567",
            "subject": "Test Tarjouspyyntö",
            "message": "Tämä on testiviestin sisältö maalaustyöstä."
        }
        
        return self.run_test("Contact Form Submission", "POST", "contact", 200, test_data)

    def test_status_creation(self):
        """Test status check creation"""
        test_data = {
            "client_name": "Test Client"
        }
        
        return self.run_test("Create Status Check", "POST", "status", 200, test_data)

    def test_get_status_checks(self):
        """Test retrieving status checks"""
        return self.run_test("Get Status Checks", "GET", "status", 200)

    def test_get_references(self):
        """Test retrieving references"""
        return self.run_test("Get References", "GET", "references", 200)

    def test_get_services(self):
        """Test retrieving services"""
        return self.run_test("Get Services", "GET", "services", 200)

    def test_get_partners(self):
        """Test retrieving partners/quality badges"""
        return self.run_test("Get Partners", "GET", "partners", 200)
    
    # ========== ADMIN TESTS ==========
    
    def test_admin_auth(self):
        """Test admin authentication"""
        return self.run_test("Admin Auth Verify", "GET", "admin/verify", 200, auth=self.admin_auth)
    
    def test_admin_auth_invalid(self):
        """Test invalid admin credentials"""
        invalid_auth = ("wrong", "credentials")
        success, _ = self.run_test("Admin Auth Invalid", "GET", "admin/verify", 401, auth=invalid_auth)
        return success
    
    def test_admin_seed_data(self):
        """Test seeding initial data"""
        return self.run_test("Admin Seed Data", "POST", "admin/seed", 200, auth=self.admin_auth)
    
    def test_admin_get_contacts(self):
        """Test getting contact messages via admin"""
        return self.run_test("Admin Get Contacts", "GET", "admin/contacts", 200, auth=self.admin_auth)
    
    def test_admin_services_crud(self):
        """Test full CRUD operations for services"""
        print("\n🔧 Testing Services CRUD...")
        
        # Create service
        test_service = {
            "title": "Test Service",
            "description": "Test service description",
            "icon": "Building2",
            "image_url": "https://example.com/test.jpg",
            "order": 99
        }
        
        success, create_response = self.run_test("Admin Create Service", "POST", "admin/services", 200, test_service, auth=self.admin_auth)
        if not success:
            return False
            
        service_id = create_response.get('id')
        if not service_id:
            print("❌ No service ID returned from create")
            return False
        
        # Update service
        update_data = {
            "title": "Updated Test Service",
            "description": "Updated description"
        }
        
        success, _ = self.run_test("Admin Update Service", "PUT", f"admin/services/{service_id}", 200, update_data, auth=self.admin_auth)
        if not success:
            return False
        
        # Delete service
        success, _ = self.run_test("Admin Delete Service", "DELETE", f"admin/services/{service_id}", 200, auth=self.admin_auth)
        return success
    
    def test_admin_references_crud(self):
        """Test full CRUD operations for references"""
        print("\n🔧 Testing References CRUD...")
        
        # Create reference
        test_reference = {
            "name": "Test Reference",
            "type": "Test Project Type", 
            "description": "Test reference description",
            "order": 99
        }
        
        success, create_response = self.run_test("Admin Create Reference", "POST", "admin/references", 200, test_reference, auth=self.admin_auth)
        if not success:
            return False
            
        reference_id = create_response.get('id')
        if not reference_id:
            print("❌ No reference ID returned from create")
            return False
        
        # Update reference
        update_data = {
            "name": "Updated Test Reference",
            "description": "Updated description"
        }
        
        success, _ = self.run_test("Admin Update Reference", "PUT", f"admin/references/{reference_id}", 200, update_data, auth=self.admin_auth)
        if not success:
            return False
        
        # Delete reference
        success, _ = self.run_test("Admin Delete Reference", "DELETE", f"admin/references/{reference_id}", 200, auth=self.admin_auth)
        return success

    def test_admin_partners_crud(self):
        """Test full CRUD operations for partners"""
        print("\n🔧 Testing Partners CRUD...")
        
        # Create partner
        test_partner = {
            "name": "Test Partner Company",
            "image_url": "https://example.com/test-logo.jpg",
            "order": 99
        }
        
        success, create_response = self.run_test("Admin Create Partner", "POST", "admin/partners", 200, test_partner, auth=self.admin_auth)
        if not success:
            return False
            
        partner_id = create_response.get('id')
        if not partner_id:
            print("❌ No partner ID returned from create")
            return False
        
        # Update partner
        update_data = {
            "name": "Updated Test Partner",
            "image_url": "https://example.com/updated-logo.jpg"
        }
        
        success, _ = self.run_test("Admin Update Partner", "PUT", f"admin/partners/{partner_id}", 200, update_data, auth=self.admin_auth)
        if not success:
            return False
        
        # Delete partner
        success, _ = self.run_test("Admin Delete Partner", "DELETE", f"admin/partners/{partner_id}", 200, auth=self.admin_auth)
        return success

    # ========== SITE SETTINGS TESTS ==========
    
    def test_get_site_settings(self):
        """Test getting site settings (public endpoint)"""
        return self.run_test("Get Site Settings", "GET", "settings", 200)
    
    def test_admin_update_site_settings(self):
        """Test updating site settings via admin"""
        print("\n🏠 Testing Site Settings Update...")
        
        # Test updating hero section settings
        hero_update = {
            "hero_slogan": "TEST SLOGAN",
            "hero_title_1": "Test Title 1",
            "hero_title_2": "Test Title 2", 
            "hero_title_3": "Test Title 3",
            "hero_description": "Test hero description for settings update",
            "hero_badge_1": "Test Badge 1",
            "hero_badge_2": "Test Badge 2"
        }
        
        success, response = self.run_test("Admin Update Hero Settings", "PUT", "admin/settings", 200, hero_update, auth=self.admin_auth)
        if not success:
            return False
            
        # Verify the settings were updated by fetching them
        success, get_response = self.test_get_site_settings()
        if not success:
            return False
        
        # Check if our test values are in the response
        if get_response.get('hero_slogan') != "TEST SLOGAN":
            print("❌ Hero slogan not updated correctly")
            return False
            
        print("✅ Hero settings updated successfully")
        
        # Test updating about section settings
        about_update = {
            "about_title": "Test About Title", 
            "about_subtitle": "TEST ABOUT SUBTITLE",
            "about_text_1": "Test about text 1",
            "about_year": "2024"
        }
        
        success, _ = self.run_test("Admin Update About Settings", "PUT", "admin/settings", 200, about_update, auth=self.admin_auth)
        if not success:
            return False
        
        print("✅ About settings updated successfully")
        
        # Test updating contact section settings
        contact_update = {
            "contact_title": "Test Contact Title",
            "contact_subtitle": "TEST CONTACT SUBTITLE", 
            "contact_description": "Test contact description",
            "contact_address": "Test Address 123, Test City",
            "contact_email": "test@testmaalaus.fi",
            "contact_phone_1": "+358 40 111 1111",
            "contact_phone_2": "+358 40 222 2222"
        }
        
        success, _ = self.run_test("Admin Update Contact Settings", "PUT", "admin/settings", 200, contact_update, auth=self.admin_auth)
        if not success:
            return False
        
        print("✅ Contact settings updated successfully")
        
        # Verify all settings were updated
        success, final_response = self.test_get_site_settings()
        if success:
            if (final_response.get('about_title') == "Test About Title" and 
                final_response.get('contact_title') == "Test Contact Title"):
                print("✅ All site settings updated and verified")
                return True
            else:
                print("❌ Settings verification failed")
                return False
        
        return success

    def test_admin_image_upload(self):
        """Test image upload endpoint"""
        print("\n📷 Testing Image Upload...")
        
        # Create a simple test image (1x1 pixel PNG)
        # Base64 encoded minimal PNG image
        test_image_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0bIDATx\x9cc```\x00\x00\x00\x04\x00\x01\xdd\x8d\xb4\x1c\x00\x00\x00\x00IEND\xaeB`\x82'
        
        # Use requests files parameter for multipart/form-data
        files = {'file': ('test.png', test_image_data, 'image/png')}
        
        url = f"{self.api_url}/admin/upload"
        self.tests_run += 1
        print(f"🔍 Testing Admin Image Upload...")
        print(f"   URL: {url}")
        
        try:
            response = requests.post(url, files=files, auth=self.admin_auth, timeout=10)
            
            success = response.status_code == 200
            if success:
                self.tests_passed += 1
                self.passed_tests.append("Admin Image Upload")
                print(f"✅ Passed - Status: {response.status_code}")
                resp_json = response.json()
                print(f"   Response: {str(resp_json)[:200]}...")
                return True, resp_json
            else:
                self.failed_tests.append({
                    "test": "Admin Image Upload",
                    "expected": 200,
                    "actual": response.status_code,
                    "response": response.text[:200] if response.text else "No response"
                })
                print(f"❌ Failed - Expected 200, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                return False, {}
        
        except Exception as e:
            self.failed_tests.append({
                "test": "Admin Image Upload",
                "expected": 200,
                "actual": "Exception",
                "response": str(e)
            })
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_create_reference(self):
        """Test creating a reference"""
        test_data = {
            "name": "Test Project",
            "type": "Tasoitus- ja maalaustyöt",
            "description": "Test project description",
            "image_url": "https://example.com/test.jpg"
        }
        
        success, response = self.run_test("Create Reference", "POST", "references", 200, test_data)
        return success, response.get('id') if success else None

    def test_delete_reference(self, reference_id):
        """Test deleting a reference"""
        if not reference_id:
            print("❌ Cannot test delete - no reference ID provided")
            return False
        
        return self.run_test("Delete Reference", "DELETE", f"references/{reference_id}", 200)

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting J&B Tasoitus ja Maalaus API Tests")
        print("=" * 60)
        
        # Test basic endpoints
        self.test_api_root()
        
        # Test status endpoints
        self.test_status_creation()
        self.test_get_status_checks()
        
        # Test contact form (main functionality)
        self.test_contact_form_submission()
        
        # Test public data endpoints
        self.test_get_services()
        self.test_get_references()
        self.test_get_partners()
        
        # Test admin authentication
        print("\n🔐 Testing Admin Authentication...")
        self.test_admin_auth()
        self.test_admin_auth_invalid()
        
        # Test admin data operations
        print("\n👨‍💼 Testing Admin Operations...")
        self.test_admin_seed_data()
        self.test_admin_get_contacts()
        
        # Test image upload functionality
        self.test_admin_image_upload()
        
        # Test admin CRUD operations
        self.test_admin_services_crud()
        self.test_admin_references_crud()
        self.test_admin_partners_crud()
        
        # Print results
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            print(f"\n❌ Failed Tests ({len(self.failed_tests)}):")
            for test in self.failed_tests:
                print(f"   • {test['test']}: Expected {test['expected']}, got {test['actual']}")
                print(f"     Response: {test['response']}")
        
        if self.passed_tests:
            print(f"\n✅ Passed Tests ({len(self.passed_tests)}):")
            for test in self.passed_tests:
                print(f"   • {test}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = JBMaalausAPITester()
    
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All tests passed!")
        return 0
    else:
        print(f"\n💥 {len(tester.failed_tests)} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())