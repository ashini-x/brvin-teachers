import { handleOperatorRequest } from "./operator.js";
import { handleRequest as publicRequest } from "./health.js";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const response = await handleOperatorRequest(request, env, ctx);
    return response ?? publicRequest(request);
  }
};

interface Env { DB: D1Database; }
