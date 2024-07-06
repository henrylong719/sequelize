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

    // Determine the configuration based on the environment
    const config = this.dbConfig[this.environment];

    // Create the connection
    this.sequelize = new Sequelize(
      config.database,
      config.username,
      config.password,
      {
        host: config.host,
        port: config.port,
        dialect: config.dialect || 'postgres', // Default to 'postgres' if dialect is undefined
        logging: this.environment === 'test' ? false : console.log,
      }
    );

    try {
      await this.sequelize.authenticate();

      if (this.environment !== 'test') {
        console.log('Connection has been established successfully.');
      }

      // Register the models
      registerModels(this.sequelize);

      // Sync the model
      await this.sync();
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }
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
