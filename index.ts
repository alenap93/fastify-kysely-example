import fastify from 'fastify'
import Database from 'better-sqlite3'
import { fastifyKysely } from 'fastify-kysely'
import { Generated, Kysely, SqliteDialect } from 'kysely'

interface Database {
    person: PersonTable
}

interface PersonTable {
    id: Generated<number>

    first_name: string

    last_name: string
}

declare module 'fastify' {

    interface FastifyKyselyNamespaces {
        sqliteDB: Kysely<Database>
    }

}


const listen = async (): Promise<void> => {

    const sqliteDialect = new SqliteDialect({
        database: new Database(':memory:')
      })
    
    const kyselyInstance = new Kysely<Database>({dialect: sqliteDialect});

    const server = fastify()

    await server.register(fastifyKysely, {
        namespace: 'sqliteDB',
        kysely: kyselyInstance
    })

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
        const result = await request.server.kysely.sqliteDB.selectFrom('person').selectAll().execute()
        return result
    })
    
    server.listen({ port: 5000 }, (err, address) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      console.log(`Server listening at ${address}`)
    })
}

listen().then()