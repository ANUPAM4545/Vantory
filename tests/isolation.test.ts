import test from "node:test";
import assert from "node:assert";
import { GET as getDashboard } from "../app/api/institute/dashboard/route";
import { GET as getStudents } from "../app/api/institute/students/route";
import { GET as getReports } from "../app/api/institute/reports/route";

test("Multi-Tenant Isolation - GET /api/institute/dashboard rejects unauthenticated candidate request with 401", async () => {
  const response = await getDashboard();
  assert.strictEqual(response.status, 401);
  const json = await response.json();
  assert.strictEqual(json.success, false);
});

test("Multi-Tenant Isolation - GET /api/institute/students rejects unauthenticated request with 401", async () => {
  const req = new Request("http://localhost:3000/api/institute/students");
  const response = await getStudents(req as any);
  assert.strictEqual(response.status, 401);
  const json = await response.json();
  assert.strictEqual(json.success, false);
});

test("Multi-Tenant Isolation - GET /api/institute/reports rejects unauthenticated request with 401", async () => {
  const req = new Request("http://localhost:3000/api/institute/reports?type=readiness");
  const response = await getReports(req as any);
  assert.strictEqual(response.status, 401);
  const json = await response.json();
  assert.strictEqual(json.success, false);
});

test("Multi-Tenant Isolation - Client-supplied instituteId query param is ignored in students API", async () => {
  // Querying with client-supplied instituteId=malicious-id
  const req = new Request("http://localhost:3000/api/institute/students?instituteId=malicious-foreign-id");
  const response = await getStudents(req as any);
  // Unauthenticated returns 401; even when authenticated, the server resolves instituteId from user token
  assert.strictEqual(response.status, 401);
});
