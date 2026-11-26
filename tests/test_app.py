import re
import unittest
from unittest.mock import patch

from app import app, scoring_reference


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

    def test_scoring_reference_renders_all_fans_and_unicode_example_in_closed_toggle(self):
        html = self.client.get("/").get_data(as_text=True)
        toggle = re.search(r'<details id="scoring-reference"([^>]*)>', html)
        self.assertIsNotNone(toggle)
        self.assertNotIn("open", toggle.group(1))
        self.assertIn("Show scoring table", html)
        self.assertIn("Hide scoring table", html)
        rows = re.findall(
            r"<tr>\s*<td><code>([A-Z_]+)</code></td>\s*<td[^>]*>(.*?)</td>"
            r"\s*<td>(.*?)</td>\s*<td>(.*?)</td>\s*</tr>",
            html,
            re.DOTALL,
        )
        self.assertEqual(len(rows), 81)
        self.assertEqual(len({row[0] for row in rows}), 81)
        self.assertEqual(rows[0][:2], ("BIG_FOUR_WINDS", "88"))
        self.assertEqual(rows[-1][:2], ("FLOWER_TILES", "1 each"))
        self.assertIn("maximum 8", rows[-1][2])
        self.assertIn("🀇🀈🀉 🀊🀋🀌 🀍🀎🀏 🀙🀚🀛 🀝🀝", html)
        self.assertIn("Self-drawn winning tile", html)
        self.assertIn("All other non-flower fans", html)
        self.assertNotIn("&lt;table&gt;", html)

    def test_missing_reference_markers_fail_explicitly_instead_of_showing_empty_table(self):
        for source in ("no markers", "<!-- scoring-reference:start -->\nunfinished"):
            with self.subTest(source=source):
                with patch("app.Path.read_text", return_value=source):
                    with self.assertRaisesRegex(ValueError, "scoring-reference start/end markers"):
                        scoring_reference()

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
