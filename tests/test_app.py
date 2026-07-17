from fastapi.testclient import TestClient

from src.app import app


client = TestClient(app)


def test_unregister_participant_from_activity():
    signup_response = client.post(
        "/activities/Basketball%20Team/signup",
        params={"email": "student@example.com"},
    )
    assert signup_response.status_code == 200

    unregister_response = client.delete(
        "/activities/Basketball%20Team/unregister",
        params={"email": "student@example.com"},
    )

    assert unregister_response.status_code == 200
    assert unregister_response.json()["message"] == "Unregistered student@example.com from Basketball Team"

    activities = client.get("/activities").json()
    assert "student@example.com" not in activities["Basketball Team"]["participants"]
