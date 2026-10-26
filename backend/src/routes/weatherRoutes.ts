import { Router } from 'express';
import { getWeather, simulateWeather } from '../controllers/weatherController';

const router = Router();

router.get('/', getWeather);
router.post('/simulate', simulateWeather);

export default router;
