import { Router } from 'express';
import registerRouter from './register';
import loginRouter from './login';
import tokenRouter from './token';
import logoutRouter from './logout';

const router = Router();

router.use([registerRouter, loginRouter, tokenRouter, logoutRouter]);

export default router;
