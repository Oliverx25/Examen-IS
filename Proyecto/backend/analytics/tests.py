from django.test import TestCase

# Create your tests here.
class AnalyticsTestCase(TestCase):
    """Tests básicos para la aplicación analytics"""

    def test_api_root_response(self):
        """Test que la raíz de la API responde correctamente"""
        response = self.client.get('/api/')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Data Warehouse')
