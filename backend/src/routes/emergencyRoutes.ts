import { Router } from 'express';
import { getEmergencyUnits, updateEmergencyUnit, getFieldTeams, updateFieldTeam } from '../controllers/emergencyController';

const router = Router();

router.get('/units', getEmergencyUnits);
router.patch('/units/:id', updateEmergencyUnit);
router.get('/teams', getFieldTeams);
router.patch('/teams/:id', updateFieldTeam);

export default router;
