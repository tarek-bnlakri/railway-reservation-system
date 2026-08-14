import {Router} from 'express'
import { tripController } from './trips.controller.js'

const router = Router()

router.get('/search',tripController.search)

export default router