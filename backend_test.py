import requests
import sys
import json
from datetime import datetime

class APITester:
    def __init__(self, base_url="https://ideaverdict.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.session_id = None
        self.user_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_user_registration(self):
        """Test user registration"""
        test_email = f"test_{datetime.now().strftime('%H%M%S')}@example.com"
        test_password = "TestPass123!"
        test_name = "Test User"
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={"email": test_email, "password": test_password, "name": test_name}
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response.get('user', {}).get('id')
            print(f"   Registered user: {test_email}")
            return True, test_email, test_password
        return False, None, None

    def test_user_login(self, email, password):
        """Test user login"""
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={"email": email, "password": password}
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response.get('user', {}).get('id')
            return True
        return False

    def test_get_user_profile(self):
        """Test getting user profile"""
        success, response = self.run_test(
            "Get User Profile",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_create_session(self):
        """Test creating a validation session"""
        success, response = self.run_test(
            "Create Validation Session",
            "POST",
            "sessions",
            200,
            data={}
        )
        
        if success and 'id' in response:
            self.session_id = response['id']
            print(f"   Created session: {self.session_id}")
            return True
        return False

    def test_get_sessions(self):
        """Test getting user sessions"""
        success, response = self.run_test(
            "Get User Sessions",
            "GET",
            "sessions",
            200
        )
        return success

    def test_get_session_details(self):
        """Test getting specific session details"""
        if not self.session_id:
            print("❌ No session ID available for testing")
            return False
            
        success, response = self.run_test(
            "Get Session Details",
            "GET",
            f"sessions/{self.session_id}",
            200
        )
        return success

    def test_get_session_messages(self):
        """Test getting session messages"""
        if not self.session_id:
            print("❌ No session ID available for testing")
            return False
            
        success, response = self.run_test(
            "Get Session Messages",
            "GET",
            f"sessions/{self.session_id}/messages",
            200
        )
        return success

    def test_send_chat_message(self):
        """Test sending a chat message"""
        if not self.session_id:
            print("❌ No session ID available for testing")
            return False
            
        test_message = "I want to build a mobile app that helps people find parking spots in busy cities. The problem is that drivers waste time and fuel looking for parking."
        
        success, response = self.run_test(
            "Send Chat Message",
            "POST",
            "chat/message",
            200,
            data={"session_id": self.session_id, "message": test_message}
        )
        
        if success:
            print(f"   AI Response: {response.get('message', '')[:100]}...")
            print(f"   Current Step: {response.get('current_step')}")
            print(f"   Step Name: {response.get('step_name')}")
        
        return success

    def test_analyze_session(self):
        """Test session analysis (final verdict)"""
        if not self.session_id:
            print("❌ No session ID available for testing")
            return False
            
        # Send a few more messages to progress through steps
        messages = [
            "The target users are urban commuters and city drivers who struggle with parking daily.",
            "I assume people will pay for convenience and that parking data can be collected from various sources.",
            "I plan to interview drivers in downtown areas and survey parking lot operators about data sharing."
        ]
        
        for i, msg in enumerate(messages):
            print(f"\n📝 Sending message {i+2} to progress through steps...")
            success, response = self.run_test(
                f"Chat Message {i+2}",
                "POST",
                "chat/message",
                200,
                data={"session_id": self.session_id, "message": msg}
            )
            if not success:
                print(f"❌ Failed to send message {i+2}")
                return False
        
        # Now try to analyze
        success, response = self.run_test(
            "Analyze Session (Final Verdict)",
            "POST",
            "chat/analyze",
            200,
            data={"session_id": self.session_id}
        )
        
        if success:
            print(f"   Market Fit Score: {response.get('market_fit_score')}")
            print(f"   Decision: {response.get('decision')}")
            print(f"   Reasoning: {response.get('reasoning', '')[:100]}...")
            print(f"   Next Actions: {response.get('next_actions', [])}")
        
        return success

def main():
    print("🚀 Starting AI Startup Validation Co-Founder API Tests")
    print("=" * 60)
    
    tester = APITester()
    
    # Test user registration
    reg_success, email, password = tester.test_user_registration()
    if not reg_success:
        print("❌ Registration failed, stopping tests")
        return 1

    # Test user login
    if not tester.test_user_login(email, password):
        print("❌ Login failed, stopping tests")
        return 1

    # Test user profile
    if not tester.test_get_user_profile():
        print("❌ Get user profile failed")

    # Test session creation
    if not tester.test_create_session():
        print("❌ Session creation failed, stopping validation tests")
        return 1

    # Test session listing
    if not tester.test_get_sessions():
        print("❌ Get sessions failed")

    # Test session details
    if not tester.test_get_session_details():
        print("❌ Get session details failed")

    # Test session messages
    if not tester.test_get_session_messages():
        print("❌ Get session messages failed")

    # Test chat functionality
    if not tester.test_send_chat_message():
        print("❌ Send chat message failed")
        return 1

    # Test session analysis
    if not tester.test_analyze_session():
        print("❌ Session analysis failed")

    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 API Tests Summary:")
    print(f"   Tests Run: {tester.tests_run}")
    print(f"   Tests Passed: {tester.tests_passed}")
    print(f"   Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All API tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())