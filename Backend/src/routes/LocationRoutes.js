import express from 'express';
import {
    getAllScansData,
    getLocationsSummary,
    getPaginatedScans,
    getitemUnique,
    getTotleLocationUnique,
    getTotleLocationMatch,
    getTotleLocationMissMatch,
    getPersentageMatchLocation,
    getPersentageMissMatchLocation,
    getDiscrepancyLocations,
    toggleAlertVisibility,
    bulkToggleAlertVisibility
} from '../controllers/LocationController.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.get('/locations/scans', authMiddleware, getAllScansData);
router.get('/locations/summary', authMiddleware, getLocationsSummary);
router.get('/locations/scans/paginated', authMiddleware, getPaginatedScans);
router.get('/locations/unique-items', authMiddleware, getitemUnique);
router.get('/locations/total-unique', authMiddleware, getTotleLocationUnique);
router.get('/locations/total-match', authMiddleware, getTotleLocationMatch);
router.get('/locations/total-missmatch', authMiddleware, getTotleLocationMissMatch);
router.get('/locations/percentage-match', authMiddleware, getPersentageMatchLocation);
router.get('/locations/percentage-missmatch', authMiddleware, getPersentageMissMatchLocation);
router.get('/locations/discrepancies', authMiddleware, getDiscrepancyLocations);
router.patch('/locations/scans/:id/toggle-alert-visibility', authMiddleware, roleMiddleware('admin', 'top_admin'), toggleAlertVisibility);
router.patch('/locations/scans/bulk-toggle-alert-visibility', authMiddleware, roleMiddleware('admin', 'top_admin'), bulkToggleAlertVisibility);

export default router;
