import { createConnection } from 'typeorm'

export async function createTestDatabaseConnection() {
  const connection = await createConnection({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: '',
    database: 'nightwatch_test',
    synchronize: false,
    logging: false,
    entities: ['src/db/entity/**/*.ts'],
    migrations: ['src/db/migrations/**/*.ts'],
    subscribers: ['src/db/subscribers/**/*.ts'],
    cli: {
      entitiesDir: 'src/db/entities',
      migrationsDir: 'src/db/migrations',
      subscribersDir: 'src/db/subscribers'
    }
  })

  await connection.runMigrations()
}
