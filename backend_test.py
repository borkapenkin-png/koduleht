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

    def test_get_contact_forms(self):
        """Test retrieving contact forms"""
        return self.run_test("Get Contact Forms", "GET", "contact", 200)

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
        self.test_get_contact_forms()
        
        # Test references
        self.test_get_references()
        success, ref_id = self.test_create_reference()
        if success and ref_id:
            self.test_delete_reference(ref_id)
        
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