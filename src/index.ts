import { handleBrvinConnectionProbe } from "./brvin-v2.js";
import { handleOperatorRequest } from "./operator.js";
import { handleRequest as publicRequest } from "./health.js";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (new URL(request.url).pathname === "/brvin/connection-probe") {
      return handleBrvinConnectionProbe(request, env);
    }
    const response = await handleOperatorRequest(request, env, ctx);
    return response ?? publicRequest(request);
  }
};

type BrvinV2Failure = {
  ok: false;
  code: string;
  message: string;
  retryable: boolean;
  userMessage?: string;
  requestId?: string;
};

type BrvinV2Result<T> = { ok: true; data: T } | BrvinV2Failure;

interface BrvinV2Binding {
  listAuthorizedProjectsV2(): Promise<BrvinV2Result<Array<{
    projectId: string;
    slug: string;
    name: string;
    description: string;
    ready: boolean;
    authorizedSourceCount: number;
  }>>>;
  getProjectStatusV2(input: { projectId: string }): Promise<BrvinV2Result<{
    projectId: string;
    ready: boolean;
    authorizedSourceCount: number;
  }>>;
  retrieveProjectContextV2(input: {
    projectId: string;
    queries: string[];
    pageNumbers?: number[];
    requestId?: string;
  }): Promise<BrvinV2Result<{
    passages: Array<{
      id: string;
      bookId: string;
      bookTitle: string;
      pdfPage: number;
      printedPage?: string;
      section?: string;
      text: string;
      score: number;
    }>;
    pageImages?: Array<{
      mimeType: "image/jpeg" | "image/png" | "image/webp";
      data: string;
      byteLength: number;
    }>;
    searchedSources: number;
    searchCount: number;
  }>>;
  proveConnectionV2(input: {
    challengeId: string;
    nonce: string;
  }): Promise<BrvinV2Result<{
    challengeId: string;
    proof: string;
    ready: boolean;
    authorizedSourceCount: number;
  }>>;
}

type BrvinManagementResponse<T extends Record<string, unknown> = Record<string, unknown>> =
  | ({ ok: true } & T)
  | { ok: false; code: string; message: string; retryable?: boolean };

interface BrvinTeachersManagementBinding {
  health(): Promise<BrvinManagementResponse<{ application: string; management: string }>>;
  listTeacherProjects(input: { tenantReference: string }): Promise<BrvinManagementResponse<{ projects: Array<Record<string, unknown>> }>>;
  createTeacherProject(input: { tenantReference: string; name: string; subject: string; description?: string; ownerLabel?: string; requestId: string }): Promise<BrvinManagementResponse<{ project: Record<string, unknown> }>>;
  updateTeacherProject(input: { tenantReference: string; projectId: string; name: string; subject: string; description?: string }): Promise<BrvinManagementResponse<{ project: Record<string, unknown> }>>;
  listTeacherCollections(input: { tenantReference: string; projectId: string }): Promise<BrvinManagementResponse<{ collections: Array<Record<string, unknown>> }>>;
  createTeacherCollection(input: { tenantReference: string; projectId: string; name: string; description?: string; requestId: string }): Promise<BrvinManagementResponse<{ collection: Record<string, unknown> }>>;
  updateTeacherCollection(input: { tenantReference: string; projectId: string; collectionId: string; name: string; description?: string }): Promise<BrvinManagementResponse<{ collection: Record<string, unknown> }>>;
  grantTeacherCollection(input: { tenantReference: string; projectId: string; collectionId: string }): Promise<BrvinManagementResponse<{ projectId: string; collectionId: string }>>;
  revokeTeacherCollection(input: { tenantReference: string; projectId: string; collectionId: string }): Promise<BrvinManagementResponse<{ projectId: string; collectionId: string }>>;
  listTeacherSources(input: { tenantReference: string; projectId: string; collectionId: string }): Promise<BrvinManagementResponse<{ sources: Array<Record<string, unknown>> }>>;
  startTeacherSourceUpload(input: { tenantReference: string; projectId: string; collectionId: string; title: string; filename: string; sha256: string; size: number; costConfirmed: boolean }): Promise<BrvinManagementResponse<{ source: Record<string, unknown>; upload: Record<string, unknown> }>>;
  uploadTeacherSourceChunk(input: { tenantReference: string; projectId: string; collectionId: string; importId: string; start: number; totalSize: number; bytes: ArrayBuffer }): Promise<BrvinManagementResponse<{ upload: Record<string, unknown> }>>;
  completeTeacherSourceUpload(input: { tenantReference: string; projectId: string; collectionId: string; importId: string }): Promise<BrvinManagementResponse<{ result: Record<string, unknown> }>>;
  resumeTeacherSourceUpload(input: { tenantReference: string; projectId: string; collectionId: string; importId: string }): Promise<BrvinManagementResponse<{ result: Record<string, unknown> }>>;
  getTeacherSourceStatus(input: { tenantReference: string; projectId: string; collectionId: string; importId: string }): Promise<BrvinManagementResponse<{ result: Record<string, unknown> }>>;
}

interface Env {
  DB: D1Database;
  BRVIN_MANAGEMENT?: BrvinTeachersManagementBinding;
  BRVIN_SERVICE?: BrvinV2Binding;
}
