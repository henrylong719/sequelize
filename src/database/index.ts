import cls from 'cls-hooked';
import { Sequelize, Dialect } from 'sequelize';
import { registerModels } from '../models';

interface DbConfig {
  development: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    dialect?: Dialect;
  };
  test: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    dialect?: Dialect;
  };
  // production: {
  //   host: string;
  //   port: number;
  //   database: string;
  //   username: string;
  //   password: string;
  //   dialect?: Dialect;
  // };
}

export default class Database {
  environment: keyof DbConfig;
  dbConfig: DbConfig;
  sequelize: Sequelize | null = null;

  constructor(environment: keyof DbConfig, dbConfig: DbConfig) {
    this.environment = environment;
    this.dbConfig = dbConfig;
  }

  async connect() {
    // Set up the namespace for transactions
    const namespace = cls.createNamespace('transactions-namespace');
    Sequelize.useCLS(namespace);

    // Create the connection
    const { username, password, host, port, database, dialect } =
      this.dbConfig[this.environment];
    this.sequelize = new Sequelize({
      username,
      password,
      host,
      port,
      database,
      dialect,
      logging: this.environment ? false : console.log,
    });

    // Check if we connected successfully
    await this.sequelize.authenticate({ logging: false });

    if (!this.environment) {
      console.log(
        'Connection to the database has been established successfully'
      );
    }

    // Register the models
    registerModels(this.sequelize);

    // Sync the models
    await this.sync();
  }

  async disconnect() {
    await this.sequelize?.close();
  }

  async sync() {
    try {
      await this.sequelize?.sync({
        logging: false,
        force: this.environment === 'test',
      });

      if (this.environment !== 'test') {
        console.log('Connection synced successfully');
      }
    } catch (error) {
      console.error('Unable to sync the database:', error);
    }
  }
}
