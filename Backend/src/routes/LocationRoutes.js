import express from 'express';
import {
    getAllScansData,
    getitemUnique,
    getTotleLocationUnique,
    getTotleLocationMatch,
    getTotleLocationMissMatch,
    getPersentageMatchLocation,
    getPersentageMissMatchLocation,
    getDiscrepancyLocations
} from '../controllers/LocationController.js';

const router = express.Router();

router.get('/locations/scans', getAllScansData);
router.get('/locations/unique-items', getitemUnique);
router.get('/locations/total-unique', getTotleLocationUnique);
router.get('/locations/total-match', getTotleLocationMatch);
router.get('/locations/total-missmatch', getTotleLocationMissMatch);
router.get('/locations/percentage-match', getPersentageMatchLocation);
router.get('/locations/percentage-missmatch', getPersentageMissMatchLocation);
router.get('/locations/discrepancies', getDiscrepancyLocations);

export default router;
