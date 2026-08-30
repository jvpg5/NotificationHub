---
name: curl-endpoint-testing
description: Standard operating procedure for testing CRUD endpoints with curl. Use when verifying a new controller or API end-to-end without writing e2e tests yet, or when manual endpoint verification is requested.
metadata:
  author: Amara Liz
---

# Curl Endpoint Testing

This skill provides a standard operating procedure for testing CRUD endpoints in a controller using `curl`. It is useful for quickly verifying that the API is fully functional end-to-end after implementing a new feature or controller, without needing to write full e2e tests right away or when manual verification is specifically requested.

## Prerequisites

1.  **Understand the App Configuration**: Check `src/main.ts` or `.env` to determine the port the application is running on (e.g., `2051`, `3000`) and the global prefix (e.g., `/api/v1`).
2.  **Know the Authentication Flow**: Identify the login route (e.g., `POST /api/v1/users/login`) and the required payload (e.g., `{"email":"...", "password":"..."}`).
3.  **Identify the Controller Endpoints**: Read the target controller to understand its routes, HTTP methods, and required payloads.

## Step-by-Step Guide

### 1. Authenticate and get the Bearer Token

First, you need to make a request to the login endpoint to retrieve the JWT token.

```bash
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"email":"manager@example.com","password":"123"}' \
  http://localhost:<PORT>/api/v1/users/login
```

*Note: The response will contain the token (e.g., `{"token": "eyJ..."}`). You need to extract this token.*

### 2. Create a bash script to test the CRUD endpoints

Instead of running each command manually, it's highly recommended to write a small, sequential bash script using the `Write` tool. This script should be placed inside `.claude/skills/curl-endpoint-testing/test-output/` directory (create it if it doesn't exist). The script should:
1. Log in and extract the token using `jq`.
2. Use the token to test the `POST` (Create) endpoint.
3. Extract the newly created resource's `ID` from the POST response using `jq`.
4. Use the extracted `ID` to test the `GET` (Read), `PUT` (Update), and `DELETE` (Delete) endpoints sequentially.
5. Also test the `GET` list endpoint.

### Example Script Template

Here is a complete example of how to test a standard CRUD controller (e.g., `epi-types`). **Adapt the URL, payloads, and JSON paths to the specific controller you are testing.**

```bash
# 1. Authenticate (replace with correct credentials and port)
LOGIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{"email":"manager@example.com","password":"123"}' \
  http://localhost:2051/api/v1/users/login)

# Extract token using jq (assumes response has a 'token' field)
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo "Failed to retrieve token. Login response:"
  echo $LOGIN_RESPONSE
  exit 1
fi

echo "Successfully authenticated."

# 2. Test POST (Create)
echo -e "\n--- Creating Item ---"
POST_RESPONSE=$(curl -s -X POST http://localhost:2051/api/v1/resource-route \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Item", "description": "Test description"}')
echo $POST_RESPONSE | jq '.'

# Extract the ID of the created item
ID=$(echo $POST_RESPONSE | jq -r '.id')
echo "Created Item ID: $ID"

# 3. Test GET (List)
echo -e "\n--- Listing Items ---"
curl -s -X GET "http://localhost:2051/api/v1/resource-route?search=Test" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# 4. Test GET (Find One)
echo -e "\n--- Finding Item $ID ---"
curl -s -X GET "http://localhost:2051/api/v1/resource-route/$ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# 5. Test PUT (Update)
echo -e "\n--- Updating Item $ID ---"
curl -s -X PUT "http://localhost:2051/api/v1/resource-route/$ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Item Updated"}' | jq '.'

# 6. Test DELETE (Remove)
echo -e "\n--- Deleting Item $ID ---"
curl -s -X DELETE "http://localhost:2051/api/v1/resource-route/$ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

## Best Practices
- **Use `-s` (silent) flag** with `curl` to avoid cluttering the output with progress meters.
- **Use `jq '.'`** to pretty-print the JSON responses so they are easily readable in the terminal output.
- **Always extract and reuse IDs**: When testing standard CRUD, always use the ID of the item you just created to test the read, update, and delete endpoints. This prevents tests from failing due to hardcoded, non-existent IDs and leaves the database clean.
- **Fail fast**: If the login fails or token extraction fails, stop the script.
