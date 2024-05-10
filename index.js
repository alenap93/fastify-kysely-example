"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const fastify_kysely_1 = require("fastify-kysely");
const kysely_1 = require("kysely");
const listen = async () => {
    const sqliteDialect = new kysely_1.SqliteDialect({
        database: new better_sqlite3_1.default(':memory:')
    });
    const kyselyInstance = new kysely_1.Kysely({ dialect: sqliteDialect });
    const server = (0, fastify_1.default)();
    await server.register(fastify_kysely_1.fastifyKysely, {
        namespace: 'sqliteDB',
        kysely: kyselyInstance
    });
    await server.kysely.sqliteDB.schema.createTable('person')
        .addColumn('id', 'integer', (col) => col.primaryKey())
        .addColumn('first_name', 'varchar')
        .addColumn('last_name', 'varchar')
        .execute();
    await server.kysely.sqliteDB.insertInto('person')
        .values([
        {
            first_name: 'Max',
            last_name: 'Jack',
        },
        {
            first_name: 'Greg',
            last_name: 'Johnson',
        },
    ])
        .execute();
    server.get('/', async (request, reply) => {
        const result = await request.server.kysely.sqliteDB.selectFrom('person').selectAll().execute();
        return result;
    });
    server.listen({ port: 5000 }, (err, address) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log(`Server listening at ${address}`);
    });
};
listen().then();
