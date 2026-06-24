import mysql from "mysql2/promise";

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

export default async function handler(req, res) {
    try {
        const { server, version } = req.query;

        let sql = `
            SELECT
                s.name,
                v.version,
                sv.url,
                sv.build
            FROM server_versions sv
            INNER JOIN servers s ON sv.server_id = s.id
            INNER JOIN versions v ON sv.version_id = v.id
            WHERE 1=1
        `;

        const params = [];

        if (server) {
            sql += " AND s.name = ?";
            params.push(server);
        }

        if (version) {
            sql += " AND v.version = ?";
            params.push(version);
        }

        sql += " ORDER BY s.name, v.version";

        const [rows] = await pool.query(sql, params);

        const [servers] = await pool.query(
            "SELECT name FROM servers ORDER BY name"
        );

        const [versions] = await pool.query(
            "SELECT version FROM versions ORDER BY version"
        );

        res.status(200).json({
            servers,
            versions,
            data: rows
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Database error"
        });
    }
}