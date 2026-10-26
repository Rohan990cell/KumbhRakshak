import { Router } from 'express';
import { getZones, getZoneById, updateZone, getMapData } from '../controllers/zoneController';

const router = Router();

router.get('/', getZones);
router.get('/map-data', getMapData);
router.get('/:id', getZoneById);
router.patch('/:id', updateZone);

export default router;
