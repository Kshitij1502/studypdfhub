import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use(
  "/api/*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Pragma",
      "Expires"
    ]
  })
);

const getAtlasConfig = (env) => ({
  baseUrl: String(env.ATLAS_DATA_API_URL || "").replace(/\/$/, ""),
  apiKey: env.ATLAS_DATA_API_KEY,
  dataSource: env.ATLAS_DATA_SOURCE || "Cluster0",
  database: env.ATLAS_DB_NAME || "studypdfhub",
  adminsCollection: env.ATLAS_COLLECTION_ADMINS || "admins",
  pdfsCollection: env.ATLAS_COLLECTION_PDFS || "pdfs",
  configCollection: env.ATLAS_COLLECTION_SITE_CONFIG || "siteconfigs"
});

const base64UrlEncode = (input) =>
  Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const base64UrlDecode = (input) => {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4;
  const normalized = pad ? padded + "=".repeat(4 - pad) : padded;
  return Buffer.from(normalized, "base64").toString("utf8");
};

const signJwt = async (payload, secret) => {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = {
    ...payload,
    iat: now,
    exp: now + 60 * 60 * 24
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(body));
  const data = `${encodedHeader}.${encodedPayload}`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data)
  );

  const signature = Buffer.from(signatureBuffer)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${data}.${signature}`;
};

const verifyJwt = async (token, secret) => {
  const [encodedHeader, encodedPayload, signature] = String(token || "").split(".");
  if (!encodedHeader || !encodedPayload || !signature) {
    throw new Error("Invalid token format");
  }

  const data = `${encodedHeader}.${encodedPayload}`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const signatureBuffer = Buffer.from(
    signature.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (signature.length % 4)) % 4),
    "base64"
  );

  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    signatureBuffer,
    new TextEncoder().encode(data)
  );

  if (!valid) {
    throw new Error("Invalid signature");
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload));
  const now = Math.floor(Date.now() / 1000);

  if (payload.exp && payload.exp < now) {
    throw new Error("Token expired");
  }

  return payload;
};

const atlasRequest = async (env, action, payload) => {
  const config = getAtlasConfig(env);

  if (!config.baseUrl || !config.apiKey) {
    throw new Error("Atlas Data API is not configured. Set ATLAS_DATA_API_URL and ATLAS_DATA_API_KEY in Worker secrets.");
  }

  const res = await fetch(`${config.baseUrl}/action/${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": config.apiKey
    },
    body: JSON.stringify(payload)
  });

  const raw = await res.text();
  let json = null;

  try {
    json = raw ? JSON.parse(raw) : {};
  } catch {
    json = null;
  }

  if (!res.ok) {
    const details = json?.error || json?.error_message || raw || `HTTP ${res.status}`;
    throw new Error(`Atlas ${action} failed: ${details}`);
  }

  if (json?.error || json?.error_message) {
    throw new Error(`Atlas ${action} failed: ${json.error || json.error_message}`);
  }

  return json || {};
};

const normalizeId = (doc) => {
  if (!doc) return doc;

  return {
    ...doc,
    _id:
      typeof doc._id === "object" && doc._id?.$oid
        ? doc._id.$oid
        : String(doc._id || "")
  };
};

const requireAdmin = async (c, next) => {
  try {
    const authHeader = c.req.header("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return c.json({ message: "No token provided" }, 401);
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyJwt(token, c.env.JWT_SECRET);

    const cfg = getAtlasConfig(c.env);
    const found = await atlasRequest(c.env, "findOne", {
      dataSource: cfg.dataSource,
      database: cfg.database,
      collection: cfg.adminsCollection,
      filter: { _id: { $oid: payload.id } }
    });

    if (!found.document) {
      return c.json({ message: "Admin access only" }, 403);
    }

    c.set("admin", normalizeId(found.document));
    return next();
  } catch (error) {
    return c.json({ message: "Invalid token" }, 401);
  }
};

app.get("/", (c) => c.text("StudyPdfHub Worker API is running"));

app.get("/api/health", (c) =>
  c.json({
    success: true,
    message: "Worker API healthy"
  })
);

app.get("/api/system/status", async (c) => {
  try {
    const cfg = getAtlasConfig(c.env);

    const result = await atlasRequest(c.env, "findOne", {
      dataSource: cfg.dataSource,
      database: cfg.database,
      collection: cfg.configCollection,
      filter: { key: "global" }
    });

    return c.json({
      success: true,
      maintenanceMode: Boolean(result.document?.maintenanceMode)
    });
  } catch {
    return c.json({ success: true, maintenanceMode: false });
  }
});

app.put("/api/system/maintenance", requireAdmin, async (c) => {
  try {
    const { maintenanceMode } = await c.req.json();

    if (typeof maintenanceMode !== "boolean") {
      return c.json({ message: "maintenanceMode must be boolean" }, 400);
    }

    const cfg = getAtlasConfig(c.env);

    await atlasRequest(c.env, "updateOne", {
      dataSource: cfg.dataSource,
      database: cfg.database,
      collection: cfg.configCollection,
      filter: { key: "global" },
      update: {
        $set: {
          key: "global",
          maintenanceMode,
          updatedAt: new Date().toISOString()
        }
      },
      upsert: true
    });

    return c.json({
      success: true,
      maintenanceMode,
      message: maintenanceMode ? "Maintenance mode enabled" : "Live mode enabled"
    });
  } catch (error) {
    return c.json({ message: error.message }, 500);
  }
});

app.post("/api/admin/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedPassword = String(password || "").trim();

    if (!normalizedEmail || !normalizedPassword) {
      return c.json({ message: "Email and password are required" }, 400);
    }

    if (!c.env.JWT_SECRET) {
      return c.json({ message: "JWT_SECRET is not configured in Worker secrets" }, 500);
    }

    const cfg = getAtlasConfig(c.env);

    const result = await atlasRequest(c.env, "findOne", {
      dataSource: cfg.dataSource,
      database: cfg.database,
      collection: cfg.adminsCollection,
      filter: {
        email: { $regex: `^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" }
      }
    });

    const admin = result.document;

    if (!admin || String(admin.password || "").trim() !== normalizedPassword) {
      return c.json({ message: "Invalid credentials" }, 401);
    }

    const adminId = admin._id?.$oid || String(admin._id);
    const token = await signJwt({ id: adminId }, c.env.JWT_SECRET);

    return c.json({ token });
  } catch (error) {
    return c.json({ message: error.message }, 500);
  }
});

app.get("/api/pdfs/subjects", async (c) => {
  try {
    const course = String(c.req.query("course") || "").toUpperCase();
    const semester = Number(c.req.query("semester"));

    if (!course || !semester) {
      return c.json([], 200);
    }

    const cfg = getAtlasConfig(c.env);

    const result = await atlasRequest(c.env, "distinct", {
      dataSource: cfg.dataSource,
      database: cfg.database,
      collection: cfg.pdfsCollection,
      field: "subject",
      query: { course, semester }
    });

    return c.json(result.values || []);
  } catch {
    return c.json([], 200);
  }
});

app.get("/api/pdfs/units", async (c) => {
  try {
    const course = String(c.req.query("course") || "").toUpperCase();
    const semester = Number(c.req.query("semester"));
    const subject = String(c.req.query("subject") || "").toLowerCase();

    const cfg = getAtlasConfig(c.env);

    const result = await atlasRequest(c.env, "distinct", {
      dataSource: cfg.dataSource,
      database: cfg.database,
      collection: cfg.pdfsCollection,
      field: "unit",
      query: { course, semester, subject }
    });

    const values = (result.values || []).map((n) => Number(n)).sort((a, b) => a - b);
    return c.json(values);
  } catch {
    return c.json([]);
  }
});

app.get("/api/pdfs", async (c) => {
  try {
    const course = c.req.query("course");
    const semester = c.req.query("semester");
    const subject = c.req.query("subject");
    const unit = c.req.query("unit");

    const filter = {};
    if (course) filter.course = String(course).toUpperCase();
    if (semester !== undefined) filter.semester = Number(semester);
    if (subject) filter.subject = { $regex: `^${String(subject).toLowerCase()}$`, $options: "i" };
    if (unit !== undefined) filter.unit = Number(unit);

    const cfg = getAtlasConfig(c.env);

    const result = await atlasRequest(c.env, "find", {
      dataSource: cfg.dataSource,
      database: cfg.database,
      collection: cfg.pdfsCollection,
      filter,
      sort: { uploadedAt: -1 }
    });

    const docs = (result.documents || []).map(normalizeId);
    return c.json(docs);
  } catch (error) {
    return c.json({ message: error.message }, 500);
  }
});

app.get("/api/pdfs/file/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const cfg = getAtlasConfig(c.env);

    const result = await atlasRequest(c.env, "findOne", {
      dataSource: cfg.dataSource,
      database: cfg.database,
      collection: cfg.pdfsCollection,
      filter: { _id: { $oid: id } }
    });

    const pdf = result.document;
    if (!pdf || !pdf.fileData) {
      return c.json({ message: "File not found" }, 404);
    }

    const binary = Buffer.from(pdf.fileData, "base64");

    return new Response(binary, {
      status: 200,
      headers: {
        "Content-Type": pdf.fileType || "application/pdf",
        "Content-Disposition": `inline; filename="${pdf.fileName || "file.pdf"}"`
      }
    });
  } catch (error) {
    return c.json({ message: error.message }, 500);
  }
});

app.post("/api/pdfs/upload", requireAdmin, async (c) => {
  try {
    const formData = await c.req.formData();

    const title = String(formData.get("title") || "").trim();
    const course = String(formData.get("course") || "").toUpperCase().trim();
    const semester = Number(formData.get("semester"));
    const subject = String(formData.get("subject") || "").toLowerCase().trim();
    const unit = Number(formData.get("unit"));
    const file = formData.get("pdf");

    if (!title || !course || !semester || !subject || !file || typeof file === "string") {
      return c.json({ message: "Missing required fields" }, 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileData = Buffer.from(arrayBuffer).toString("base64");

    const cfg = getAtlasConfig(c.env);

    const insertResult = await atlasRequest(c.env, "insertOne", {
      dataSource: cfg.dataSource,
      database: cfg.database,
      collection: cfg.pdfsCollection,
      document: {
        title,
        course,
        semester,
        subject,
        unit: Number.isNaN(unit) ? null : unit,
        fileName: file.name,
        fileType: file.type || "application/pdf",
        fileData,
        uploadedAt: new Date().toISOString()
      }
    });

    const insertedId = insertResult.insertedId || insertResult.insertedId?.$oid;
    const fileUrl = `api/pdfs/file/${insertedId}`;

    await atlasRequest(c.env, "updateOne", {
      dataSource: cfg.dataSource,
      database: cfg.database,
      collection: cfg.pdfsCollection,
      filter: { _id: { $oid: insertedId } },
      update: { $set: { fileUrl } }
    });

    return c.json({
      success: true,
      message: "PDF uploaded successfully",
      fileUrl
    });
  } catch (error) {
    return c.json({ message: error.message }, 500);
  }
});

app.delete("/api/pdfs/:id", requireAdmin, async (c) => {
  try {
    const id = c.req.param("id");
    const cfg = getAtlasConfig(c.env);

    await atlasRequest(c.env, "deleteOne", {
      dataSource: cfg.dataSource,
      database: cfg.database,
      collection: cfg.pdfsCollection,
      filter: { _id: { $oid: id } }
    });

    return c.json({ success: true, message: "PDF deleted" });
  } catch (error) {
    return c.json({ message: error.message }, 500);
  }
});

export default app;


