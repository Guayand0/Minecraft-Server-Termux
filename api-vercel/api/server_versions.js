import mysql from 'mysql2/promise';

export async function GET(req) {
    const url = new URL(req.url);

    const server = url.searchParams.get('server');
    const version = url.searchParams.get('version');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    let query = `
        SELECT
            s.name,
            v.version,
            sv.url,
            sv.build
        FROM server_versions sv
        JOIN servers s ON sv.server_id = s.id
        JOIN versions v ON sv.version_id = v.id
        WHERE 1=1
    `;

    const params = [];

    if (server) {
        query += ' AND s.name = ?';
        params.push(server);
    }

    if (version) {
        query += ' AND v.version = ?';
        params.push(version);
    }

    query += ' ORDER BY s.name, v.version';

    const [data] = await connection.execute(query, params);

    const [servers] = await connection.execute(
        'SELECT name FROM servers ORDER BY name'
    );

    const [versions] = await connection.execute(
        'SELECT version FROM versions ORDER BY version'
    );

    await connection.end();

    return Response.json({
        servers,
        versions,
        data
    });
}