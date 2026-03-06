import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use("/api/*", cors());

app.get("/", (c) => {
  return c.text("StudyPdfHub Worker API is running");
});

app.get("/api/health", (c) => {
  return c.json({
    success: true,
    message: "Worker API healthy"
  });
});

app.get("/api/system/status", (c) => {
  return c.json({
    success: true,
    maintenanceMode: false
  });
});

export default app;
