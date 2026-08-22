import test from "node:test";
import assert from "node:assert";
import { GET as getDashboard } from "../app/api/institute/dashboard/route";
import { GET as getStudents } from "../app/api/institute/students/route";

test("Institute Security Boundaries - GET /api/institute/dashboard returns 401 when unauthenticated", async () => {
  const response = await getDashboard();
  assert.strictEqual(response.status, 401);
  const data = await response.json();
  assert.strictEqual(data.success, false);
});

test("Institute Security Boundaries - GET /api/institute/students returns 401 when unauthenticated", async () => {
  const req = new Request("http://localhost:3000/api/institute/students");
  const response = await getStudents(req as any);
  assert.strictEqual(response.status, 401);
  const data = await response.json();
  assert.strictEqual(data.success, false);
});
