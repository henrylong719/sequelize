import cls from 'cls-hooked';
import { Sequelize, Dialect } from 'sequelize';

interface DbConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  dialect?: Dialect;
}

export class Database {
  environment: string;
  dbConfig: DbConfig;
  isTestEnvironment: boolean;
  sequelize: Sequelize | null = null;

  constructor(environment: string, dbConfig: DbConfig) {
    this.environment = environment;
    this.dbConfig = dbConfig;
    this.isTestEnvironment = this.environment === 'test';
  }

  async connect() {
    // Set up the namespace for transactions
    const namespace = cls.createNamespace('transactions-namespace');
    Sequelize.useCLS(namespace);

    // Create the connection
    const { username, password, host, port, database, dialect } = this.dbConfig;

    this.sequelize = new Sequelize(database, username, password, {
      host,
      port,
      dialect: dialect || 'postgres', // Default to 'postgres' if dialect is undefined
      logging: this.isTestEnvironment ? false : console.log,
    });

    try {
      await this.sequelize.authenticate({ logging: false });

      if (!this.isTestEnvironment) {
        console.log('Connection has been established successfully.');
      }
      // Register the models
      await this.sync();
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }
  }
  async disconnect() {
    await this.sequelize?.close();
  }

  async sync() {
    await this.sequelize?.sync({
      logging: false,
      force: this.isTestEnvironment,
    });

    if (!this.isTestEnvironment) {
      console.log('Connection synced successfully');
    }
  }
}
