import os
import json
import httpx
import sys

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

def main():
    print("Starting Hindsight memory seeding process...")
    
    # Check if backend is running
    try:
        res = httpx.get(f"{BACKEND_URL}/api/health")
        if res.status_code == 200:
            info = res.json()
            print(f"Connected to backend. Hindsight mode: {info['hindsight']['mode']}")
        else:
            print(f"Backend returned non-200 health check: {res.status_code}")
            sys.exit(1)
    except Exception as e:
        print(f"Error connecting to backend at {BACKEND_URL}: {e}")
        print("Please make sure the FastAPI server is running before running this script.")
        sys.exit(1)

    # Path to incidents.json
    incidents_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "incidents.json")
    if not os.path.exists(incidents_path):
        print(f"Could not find incidents.json at {incidents_path}")
        sys.exit(1)
        
    with open(incidents_path, "r", encoding="utf-8") as f:
        incidents = json.load(f)
        
    resolved_incidents = [i for i in incidents if i.get("status") == "Resolved"]
    print(f"Found {len(resolved_incidents)} resolved incidents to seed.")
    
    success_count = 0
    for inc in resolved_incidents:
        inc_id = inc["incident_id"]
        print(f"Seeding {inc_id} ({inc['title']})...")
        
        # First, ensure the incident is present in the backend database by posting it or updating it
        # Then, we call the retain endpoint. Since the seed data is already in incidents.json,
        # we can just POST to /api/incidents/{incident_id}/retain directly
        try:
            res = httpx.post(f"{BACKEND_URL}/api/incidents/{inc_id}/retain")
            if res.status_code == 200:
                print(f"  -> Successfully retained memory for {inc_id}")
                success_count += 1
            else:
                # If it failed because status is not Resolved (maybe in active state currently), log it
                print(f"  -> Failed to retain {inc_id}: {res.status_code} - {res.text}")
        except Exception as e:
            print(f"  -> Network error for {inc_id}: {e}")
            
    print(f"\nSeeding complete! Successfully seeded {success_count}/{len(resolved_incidents)} memories.")

if __name__ == "__main__":
    main()
