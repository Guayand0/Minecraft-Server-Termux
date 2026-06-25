import mysql from "mysql2/promise";

let pool;

function getRequiredEnv(name) {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
}

export function getPool() {
    if (!pool) {
        pool = mysql.createPool({
            host: getRequiredEnv("DB_HOST"),
            user: getRequiredEnv("DB_USER"),
            password: getRequiredEnv("DB_PASSWORD"),
            database: getRequiredEnv("DB_NAME"),
            waitForConnections: true,
            connectionLimit: 8,
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0
        });
    }

    return pool;
}
