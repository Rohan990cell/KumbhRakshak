import { Router } from 'express';
import { triggerSimulation, getSimulationStatus } from '../controllers/simulationController';

const router = Router();

router.post('/trigger', triggerSimulation);
router.get('/status', getSimulationStatus);

export default router;
