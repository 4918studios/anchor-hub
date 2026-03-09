# Manual Testing with REST Client

We use the [VS Code REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension to exercise APIs, validate mock data, and facilitate code reviews.

## Why We Use It

1.  **Reproducibility**: Manual testers can run exactly the same requests as the developer.
2.  **Documentation**: `.http` files serve as living documentation of how the API is used and what responses look like.
3.  **Review Efficiency**: Reviewers can "Send Request" directly from `REVIEW.md` or a central script instead of manually typing `curl` commands or using Postman collections.
4.  **Zero-Setup**: Unlike Postman, the scripts live in the repository and don't require external accounts or shared workspaces.

## Where Scripts Live

- **Canonical Scripts**: Permanent, reusable manual flows live in [tests/manual/](tests/manual/) (e.g., [tests/manual/api-contracts.http](tests/manual/api-contracts.http)).
- **Task-Specific Requests**: During development and review, requests may be embedded in `REVIEW.md` files or specialized test files within the task folder.

## Workflow

### 1. Development (Phase 2+)
When implementing a new endpoint or refactoring an existing one:
- Create or update a `.http` file in `tests/manual/` early in the task.
- Use this file to exercise the code as you build it.

### 2. Testing & Review
- In your `TESTING.md` and `REVIEW.md`, provide direct links to the relevant `.http` files.
- For high-impact or complex individual flows, you can embed code blocks with the `http` language tag:

    ```http
    ### Get Health
    GET {{baseUrl}}/health
    ```

- This allows reviewers to run the request with a single click inside VS Code.

### 3. Closeout
- Before merging, ensure any useful task-specific requests are graduated to the canonical scripts in `tests/manual/`.

## Standards & Conventions

### Variables
Use file-level variables for configurations that might change per environment or dev machine.
```http
@baseUrl = http://127.0.0.1:3999
@authHeader = Bearer SOME_TOKEN
```

### Request Separation
Separate requests with exactly `###` followed by an optional description.
```http
### Get specific project
GET {{baseUrl}}/projects/PRJ001

### Update project status
POST {{baseUrl}}/projects/PRJ001/status
Content-Type: application/json

{
  "status": "Green"
}
```

### Comments
Use `#` for comments. Describe the purpose of the request and any specific prerequisites (e.g., "Must run POST /login first").

### Response Handling
If your workflow requires capturing values from one response and using them in the next, use the extension's named request feature:
```http
# @name createProject
POST {{baseUrl}}/projects
...

### Use ID from previous request
GET {{baseUrl}}/projects/{{createProject.response.body.id}}
```
*(Note: Named requests are preferred for complex multi-step manual flows.)*

## Setting Up
1.  Install the **REST Client** extension (`humao.rest-client`).
2.  Configuration (optional): You can define environments in `.vscode/settings.json` if we move toward multi-environment testing.
