import pytest
from fastapi.testclient import TestClient
import sys
import os

# Adjust path to find app module
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(__file__))))

from app.main import app
from app.services.incident_service import incident_service

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "hindsight" in data
    assert "llm" in data

def test_dashboard_stats():
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "active_incidents" in data
    assert "resolved_incidents" in data
    assert "memory_facts" in data
    assert "average_resolution_time" in data

def test_get_incidents():
    response = client.get("/api/incidents")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    # Check that keys like incident_id exist
    assert "incident_id" in data[0]

def test_get_single_incident():
    response = client.get("/api/incidents/INC-1042")
    assert response.status_code == 200
    data = response.json()
    assert data["incident_id"] == "INC-1042"
    assert data["system"] == "prod-api-03"

def test_get_nonexistent_incident():
    response = client.get("/api/incidents/INC-9999")
    assert response.status_code == 404

def test_investigate_incident():
    # Reset database state
    client.post("/api/reset")
    
    response = client.post("/api/incidents/INC-1042/investigate")
    assert response.status_code == 200
    data = response.json()
    assert "incident" in data
    assert "recommendation" in data
    assert "memories" in data
    assert "reflection" in data
    
    # Assert status updated to Investigated
    assert data["incident"]["status"] == "Investigated"

def test_approve_recommendation():
    response = client.post("/api/incidents/INC-1042/approve")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "approved"
    assert "simulated_logs" in data
    assert len(data["simulated_logs"]) > 0

def test_resolve_and_retain():
    client.post("/api/reset")
    
    # Run investigation and approve
    client.post("/api/incidents/INC-1042/investigate")
    client.post("/api/incidents/INC-1042/approve")
    
    # Resolve
    resolve_payload = {
        "actions_taken": ["Block IP", "Disable passwords"],
        "resolution": "Test resolution notes",
        "resolution_time": 10,
        "outcome": "Success",
        "lessons_learned": "Test lesson"
    }
    response = client.post("/api/incidents/INC-1042/resolve", json=resolve_payload)
    assert response.status_code == 200
    assert response.json()["status"] == "Resolved"
    
    # Retain
    retain_response = client.post("/api/incidents/INC-1042/retain")
    assert retain_response.status_code == 200
    assert retain_response.json()["status"] == "retained"

def test_reset_endpoint():
    response = client.post("/api/reset")
    assert response.status_code == 200
    assert response.json()["status"] == "success"
