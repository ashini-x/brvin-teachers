import { handleOperatorRequest } from "./operator.js";
import { handleRequest as publicRequest } from "./health.js";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const response = await handleOperatorRequest(request, env, ctx);
    return response ?? publicRequest(request);
  }
};

type BrvinManagementResponse<T extends Record<string, unknown> = Record<string, unknown>> =
  | ({ ok: true } & T)
  | { ok: false; code: string; message: string; retryable?: boolean };

interface BrvinTeachersManagementBinding {
  health(): Promise<BrvinManagementResponse<{ application: string; management: string }>>;
  listTeacherProjects(input: { tenantReference: string }): Promise<BrvinManagementResponse<{ projects: Array<Record<string, unknown>> }>>;
  createTeacherProject(input: { tenantReference: string; name: string; subject: string; description?: string; ownerLabel?: string; requestId: string }): Promise<BrvinManagementResponse<{ project: Record<string, unknown> }>>;
  listTeacherCollections(input: { tenantReference: string; projectId: string }): Promise<BrvinManagementResponse<{ collections: Array<Record<string, unknown>> }>>;
  createTeacherCollection(input: { tenantReference: string; projectId: string; name: string; description?: string; requestId: string }): Promise<BrvinManagementResponse<{ collection: Record<string, unknown> }>>;
  grantTeacherCollection(input: { tenantReference: string; projectId: string; collectionId: string }): Promise<BrvinManagementResponse<{ projectId: string; collectionId: string }>>;
  revokeTeacherCollection(input: { tenantReference: string; projectId: string; collectionId: string }): Promise<BrvinManagementResponse<{ projectId: string; collectionId: string }>>;
  listTeacherSources(input: { tenantReference: string; projectId: string; collectionId: string }): Promise<BrvinManagementResponse<{ sources: Array<Record<string, unknown>> }>>;
  startTeacherSourceUpload(input: { tenantReference: string; projectId: string; collectionId: string; title: string; filename: string; sha256: string; size: number; pageCount: number; costConfirmed: boolean }): Promise<BrvinManagementResponse<{ source: Record<string, unknown>; upload: Record<string, unknown> }>>;
  uploadTeacherSourceChunk(input: { tenantReference: string; projectId: string; collectionId: string; importId: string; start: number; totalSize: number; bytes: ArrayBuffer }): Promise<BrvinManagementResponse<{ upload: Record<string, unknown> }>>;
  completeTeacherSourceUpload(input: { tenantReference: string; projectId: string; collectionId: string; importId: string }): Promise<BrvinManagementResponse<{ result: Record<string, unknown> }>>;
  resumeTeacherSourceUpload(input: { tenantReference: string; projectId: string; collectionId: string; importId: string }): Promise<BrvinManagementResponse<{ result: Record<string, unknown> }>>;
  getTeacherSourceStatus(input: { tenantReference: string; projectId: string; collectionId: string; importId: string }): Promise<BrvinManagementResponse<{ result: Record<string, unknown> }>>;
}

interface Env {
  DB: D1Database;
  BRVIN_MANAGEMENT?: BrvinTeachersManagementBinding;
}
