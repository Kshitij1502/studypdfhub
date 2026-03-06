import { env, createExecutionContext, waitOnExecutionContext, SELF } from "cloudflare:test";
import { describe, it, expect } from "vitest";
import worker from "../src";

describe("StudyPdfHub Worker API", () => {
  it("responds with API running message (unit style)", async () => {
    const request = new Request("http://example.com/");
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);
    expect(await response.text()).toBe("StudyPdfHub Worker API is running");
  });

  it("returns health status JSON", async () => {
    const response = await SELF.fetch("http://example.com/api/health");
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
