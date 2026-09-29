import { Router } from "express";
import {aiSearchController} from "../ai-search/ai-search.controller.js"
import { requireAuth } from "../../shared/middlewares/auth.middleware.js";
const router = Router()

router.post('/search',requireAuth,aiSearchController.search)

export default router