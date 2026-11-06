const APP_NAME = "brvin-teachers";
const VERSION = "0.2.0-operator-foundation";

export function handleRequest(request) {
  const url = new URL(request.url);
  if (request.method === "GET" && url.pathname === "/health") {
    return Response.json(
      { ok: true, app: APP_NAME, status: "operator-console", version: VERSION },
      { headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } }
    );
  }
  if (request.method === "GET" && url.pathname === "/") {
    return Response.json(
      { app: APP_NAME, status: "operator-console", operatorPath: "/operator" },
      { headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } }
    );
  }
  return Response.json(
    { ok: false, error: "NOT_FOUND" },
    { status: 404, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } }
  );
}
