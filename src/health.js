const APP_NAME = "brvin-teachers";
const BOOTSTRAP_VERSION = "0.1.0-bootstrap";

/**
 * Minimal, non-sensitive health handler used to verify the CI/CD path.
 * This endpoint intentionally exposes no tenant, provider or database data.
 */
export function handleRequest(request) {
  const url = new URL(request.url);

  if (request.method === "GET" && url.pathname === "/health") {
    return Response.json(
      {
        ok: true,
        app: APP_NAME,
        status: "bootstrap",
        version: BOOTSTRAP_VERSION
      },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }

  if (request.method === "GET" && url.pathname === "/") {
    return Response.json({
      app: APP_NAME,
      status: "bootstrap",
      message: "BRVIN Teachers runtime is deployed. Application features are not implemented yet."
    });
  }

  return Response.json(
    { ok: false, error: "NOT_FOUND" },
    {
      status: 404,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
