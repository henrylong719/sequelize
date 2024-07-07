import Database from './database';
import environment from './config/environment';
import dbConfig from './config/database';
import './config';

(async () => {
  try {
    const nodeEnv = environment.nodeEnv as keyof typeof dbConfig;
    const db = new Database(nodeEnv, dbConfig as any);
    await db.connect();

    const App = require('./app').default;
    const app = new App();
    app.listen();
  } catch (error) {
    console.error('Error connecting to the database:\n', error);
  }
})();
