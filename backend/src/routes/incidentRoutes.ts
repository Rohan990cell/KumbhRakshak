import { Router } from 'express';
import { getIncidents, getIncidentById, createIncident, updateIncident } from '../controllers/incidentController';

const router = Router();

router.get('/', getIncidents);
router.get('/:id', getIncidentById);
router.post('/', createIncident);
router.patch('/:id', updateIncident);

export default router;
