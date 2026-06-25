import { getPool } from "./db.js";

function setCorsHeaders(res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Vary", "Origin");
}

function setCacheHeaders(res, hasFilters) {
    if (hasFilters) {
        res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
        return;
    }

    res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=900");
}

function buildWhereClause(server, version) {
    const conditions = [];
    const params = [];

    if (server) {
        conditions.push("s.name = ?");
        params.push(server);
    }

    if (version) {
        conditions.push("v.version = ?");
        params.push(version);
    }

    return {
        clause: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
        params
    };
}

export default async function handler(req, res) {
    setCorsHeaders(res);

    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }

    if (req.method !== "GET") {
        res.setHeader("Allow", "GET, OPTIONS");
        return res.status(405).json({ error: "Method not allowed" });
    }

    const url = new URL(req.url, `https://${req.headers.host}`);
    const server = url.searchParams.get("server");
    const version = url.searchParams.get("version");
    const { clause, params } = buildWhereClause(server, version);

    try {
        const pool = getPool();

        const dataQuery = `
            SELECT
                s.id AS serverId,
                s.name,
                v.id AS versionId,
                v.version,
                sv.url,
                sv.build
            FROM server_versions sv
            JOIN servers s ON sv.server_id = s.id
            JOIN versions v ON sv.version_id = v.id
            ${clause}
            ORDER BY s.id ASC, v.id ASC
        `;

        const [data, servers, versions] = await Promise.all([
            pool.query(dataQuery, params).then(([rows]) => rows),
            pool.query("SELECT id, name FROM servers ORDER BY id ASC").then(([rows]) => rows),
            pool.query("SELECT id, version FROM versions ORDER BY id ASC").then(([rows]) => rows)
        ]);

        setCacheHeaders(res, Boolean(server || version));

        return res.status(200).json({
            meta: {
                count: data.length,
                servers: servers.length,
                versions: versions.length,
                generatedAt: new Date().toISOString()
            },
            servers,
            versions,
            data
        });
    } catch (error) {
        console.error("server_versions error:", error);
        res.setHeader("Cache-Control", "no-store");

        return res.status(500).json({
            error: "Internal server error"
        });
    }
}
