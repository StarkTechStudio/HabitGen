import requests
import sys
from datetime import datetime
import json

class HabitGenAPITester:
    def __init__(self, base_url="https://71939fae-4469-45b0-abb7-142b5fcc004c.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.access_token = None

    def log_result(self, test_name, passed, details=""):
        """Log test result"""
        self.tests_run += 1
        if passed:
            self.tests_passed += 1
            print(f"✅ {test_name}")
        else:
            print(f"❌ {test_name} - {details}")
            self.failed_tests.append({"test": test_name, "details": details})

    def test_health_endpoint(self):
        """Test the health endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "status" in data and data["status"] == "ok":
                    self.log_result("Health endpoint", True)
                    return True
                else:
                    self.log_result("Health endpoint", False, f"Invalid response format: {data}")
            else:
                self.log_result("Health endpoint", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("Health endpoint", False, f"Connection error: {str(e)}")
        return False

    def test_auth_signup(self):
        """Test user signup"""
        test_user_data = {
            "email": f"test_{datetime.now().strftime('%H%M%S')}@habitgen.com",
            "password": "TestPassword123!"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/auth/signup",
                json=test_user_data,
                headers={"Content-Type": "application/json"},
                timeout=15
            )
            
            if response.status_code in [200, 201]:
                self.log_result("Auth signup", True)
                return test_user_data
            else:
                error_data = response.json() if response.headers.get("content-type", "").startswith("application/json") else response.text
                self.log_result("Auth signup", False, f"Status: {response.status_code}, Response: {error_data}")
        except Exception as e:
            self.log_result("Auth signup", False, f"Exception: {str(e)}")
        return None

    def test_auth_login(self, user_data=None):
        """Test user login"""
        if not user_data:
            # Use a test account for login
            user_data = {
                "email": "test@habitgen.com", 
                "password": "TestPassword123!"
            }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/auth/login",
                json=user_data,
                headers={"Content-Type": "application/json"},
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data:
                    self.access_token = data["access_token"]
                    self.log_result("Auth login", True)
                    return data
                else:
                    self.log_result("Auth login", False, f"No access token in response: {data}")
            else:
                error_data = response.json() if response.headers.get("content-type", "").startswith("application/json") else response.text
                self.log_result("Auth login", False, f"Status: {response.status_code}, Response: {error_data}")
        except Exception as e:
            self.log_result("Auth login", False, f"Exception: {str(e)}")
        return None

    def test_get_user(self):
        """Test get user endpoint with token"""
        if not self.access_token:
            self.log_result("Get user (no token)", False, "No access token available")
            return False
            
        try:
            response = requests.get(
                f"{self.base_url}/api/auth/user",
                headers={
                    "Authorization": f"Bearer {self.access_token}",
                    "Content-Type": "application/json"
                },
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "email" in data:
                    self.log_result("Get user", True)
                    return True
                else:
                    self.log_result("Get user", False, f"Invalid user data: {data}")
            else:
                error_data = response.json() if response.headers.get("content-type", "").startswith("application/json") else response.text
                self.log_result("Get user", False, f"Status: {response.status_code}, Response: {error_data}")
        except Exception as e:
            self.log_result("Get user", False, f"Exception: {str(e)}")
        return False

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting HabitGen Backend API Tests...\n")
        
        # Test health endpoint
        self.test_health_endpoint()
        
        # Test auth endpoints
        user_data = self.test_auth_signup()
        if user_data:
            self.test_auth_login(user_data)
        else:
            # Try login with existing test account
            self.test_auth_login()
        
        # Test authenticated endpoint
        self.test_get_user()
        
        # Print summary
        print(f"\n📊 Backend Tests Summary:")
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {self.tests_run - self.tests_passed}")
        print(f"Success rate: {(self.tests_passed / self.tests_run * 100):.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ Failed tests:")
            for failed in self.failed_tests:
                print(f"  - {failed['test']}: {failed['details']}")
        
        return self.tests_passed, self.tests_run, self.failed_tests

def main():
    tester = HabitGenAPITester()
    passed, total, failures = tester.run_all_tests()
    
    # Return appropriate exit code
    return 0 if passed == total else 1

if __name__ == "__main__":
    sys.exit(main())