import unittest

from app import app


class AppTests(unittest.TestCase):
    def setUp(self):
        app.config.update(TESTING=True)
        self.client = app.test_client()

    def test_page_serves_local_scorer_and_accessible_controls(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'id="tile-search"', response.data)
        self.assertIn(b'id="win-type"', response.data)
        self.assertIn(b'type="module" src="/static/app.js"', response.data)

    def test_javascript_served_with_module_compatible_mimetype(self):
        with self.client.get("/static/scorer.js") as response:
            self.assertEqual(response.status_code, 200)
            self.assertIn(response.mimetype, ("text/javascript", "application/javascript"))
            self.assertIn(b"export function scoreHand", response.data)

    def test_health_and_rules_are_available(self):
        self.assertEqual(self.client.get("/health").json, {"status": "ok"})
        for path in ("/rules", "/audit"):
            with self.subTest(path=path):
                with self.client.get(path) as response:
                    self.assertEqual(response.status_code, 200)
                    self.assertIn(b"workspace-2023-v1", response.data)

    def test_missing_files_and_scoring_api_are_not_success_fallbacks(self):
        self.assertEqual(self.client.get("/static/missing.js").status_code, 404)
        self.assertEqual(self.client.post("/score", json={}).status_code, 404)


if __name__ == "__main__":
    unittest.main()
