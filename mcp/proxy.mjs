import http from "node:http";

const UPSTREAM = process.env.MCP_UPSTREAM || "http://127.0.0.1:8810";
const TOKEN = process.env.MCP_TOKEN || "";
const PORT = Number(process.env.MCP_PROXY_PORT || 8811);

if (!TOKEN) {
  console.error("[mcp-proxy] MCP_TOKEN is required");
  process.exit(1);
}

const server = http.createServer((req, res) => {
  if ((req.url || "").startsWith("/healthz")) {
    res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
    res.end("ok");
    return;
  }

  const authRaw = req.headers["authorization"] || "";
  const auth = Array.isArray(authRaw) ? authRaw[0] : authRaw;
  const bearer = String(auth || "").trim();
  if (!bearer.startsWith("Bearer ") || bearer.slice(7).trim() !== TOKEN) {
    console.warn("[mcp-proxy] unauthorized request", { path: req.url, hasAuth: Boolean(bearer), prefix: bearer.slice(0, 12) });
    res.writeHead(401, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "unauthorized" }));
    return;
  }

  const upstreamUrl = new URL(req.url || "/", UPSTREAM);
  const headers = { ...req.headers };
  headers.host = upstreamUrl.host;

  const upstreamReq = http.request(
    {
      protocol: upstreamUrl.protocol,
      hostname: upstreamUrl.hostname,
      port: upstreamUrl.port,
      method: req.method,
      path: upstreamUrl.pathname + upstreamUrl.search,
      headers,
    },
    (upstreamRes) => {
      res.writeHead(upstreamRes.statusCode || 502, upstreamRes.headers);
      upstreamRes.pipe(res);
    }
  );

  upstreamReq.on("error", (err) => {
    res.writeHead(502, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "bad_gateway", detail: String(err) }));
  });

  req.pipe(upstreamReq);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[mcp-proxy] listening on :${PORT}, upstream=${UPSTREAM}`);
});
