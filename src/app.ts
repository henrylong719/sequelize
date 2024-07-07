import express, { Application, Request, Response } from 'express';
import environment from './config/environment';
import logger from 'morgan';
import errorsMiddleware from './middlewares/errors';

export default class App {
  private app: Application;

  constructor() {
    this.app = express();
    this.app.use(
      logger('dev', {
        skip: (req: Request, res: Response) => environment.nodeEnv === 'test',
      })
    );

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.setRoutes();
  }

  private setRoutes(): void {
    this.app.use(errorsMiddleware);
  }

  public getApp(): Application {
    return this.app;
  }

  public listen(): void {
    const { port } = environment;
    this.app.listen(port, () => {
      console.log(`Listening at port ${port}`);
    });
  }
}
