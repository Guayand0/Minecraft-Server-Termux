import mysql from "mysql2/promise";

export default async function handler(req, res) {
    const url = new URL(req.url, `https://${req.headers.host}`);

    const server = url.searchParams.get("server");
    const version = url.searchParams.get("version");

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    let query = `
        SELECT s.name, v.version, sv.url, sv.build
        FROM server_versions sv
        JOIN servers s ON sv.server_id = s.id
        JOIN versions v ON sv.version_id = v.id
        WHERE 1=1
    `;

    const params = [];

    if (server) {
        query += " AND s.name = ?";
        params.push(server);
    }

    if (version) {
        query += " AND v.version = ?";
        params.push(version);
    }

    const [data] = await connection.execute(query, params);

    const [servers] = await connection.execute("SELECT name FROM servers");
    const [versions] = await connection.execute("SELECT version FROM versions");

    await connection.end();

    res.status(200).json({
        servers,
        versions,
        data
    });
}