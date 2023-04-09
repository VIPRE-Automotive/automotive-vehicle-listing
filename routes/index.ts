import express from 'express';
import ratelimit from 'express-rate-limit';
import { default as WebRoutes } from './web';
import { default as ApiRoutes } from './api';

const router = express.Router();
const limit = ratelimit({ windowMs: 15 * 1000, max: 5 });

router.use(limit);
router.use('/', WebRoutes);
router.use('/api/v1', ApiRoutes);

export default router;
