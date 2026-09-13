from starlette.testclient import TestClient

from admin.main import app
from bot.config import settings


def test_admin_requires_login():
    with TestClient(app) as client:
        response = client.get("/admin/", follow_redirects=False)
        assert response.status_code == 302
        assert "/admin/login" in response.headers["location"]


def test_admin_login_and_dashboard():
    with TestClient(app) as client:
        login = client.post(
            "/admin/login",
            data={"username": settings.admin_username, "password": settings.admin_password},
            follow_redirects=False,
        )
        assert login.status_code == 302

        dashboard = client.get("/admin/dashboard")
        assert dashboard.status_code == 200
        assert "Active subscribers" in dashboard.text


def test_admin_login_rejects_wrong_password():
    with TestClient(app) as client:
        login = client.post(
            "/admin/login", data={"username": "admin", "password": "wrong"}
        )
        assert login.status_code == 400

        response = client.get("/admin/", follow_redirects=False)
        assert response.status_code == 302


def test_admin_product_crud():
    with TestClient(app) as client:
        client.post(
            "/admin/login",
            data={"username": settings.admin_username, "password": settings.admin_password},
        )
        response = client.post(
            "/admin/product/create",
            data={"name": "Admin Test Widget", "price": "12.34", "is_available": "y"},
        )
        assert response.status_code == 200

        listing = client.get("/admin/product/list")
        assert "Admin Test Widget" in listing.text
