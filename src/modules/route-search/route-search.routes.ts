import { Router } from 'express';
import { routeSearchController } from './route-search.controller.js';

const router = Router();
router.get('/path', routeSearchController.findPath);

export default router;