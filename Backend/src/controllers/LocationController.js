import Scans from '../DB/models/scans.model.js';

export const getAllScansData = async (req, res) => {
    try {
        const scans = await Scans.find({});
        res.json(scans);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getitemUnique = async (req, res) => {
    try {
        const scans = await Scans.find({});
        const itemsMap = {};

        scans.forEach(scan => {
            if (!itemsMap[scan.id]) {
                itemsMap[scan.id] = {
                    date: scan.date,
                    barcode: scan.barcode,
                    SKUname: scan.SKUname,
                    id: scan.id,
                    totleMatchLocationForItem: 0,
                    totleMissMatchLocationForItem: 0,
                    finalQuantityForItem:  0,
                    totlesysQuantityForItem:  0,
                    productStatus: scan.productStatus,
                    allMatchLocationsForItem: new Set(),
                    allMissMatchLocationsForItem: new Set()
                };
            }

            itemsMap[scan.id].finalQuantityForItem += Number(scan.finalQuantity) || 0;
            itemsMap[scan.id].totlesysQuantityForItem += Number(scan.sysQuantity) || 0;

            const isMatch = scan.locationStatus === 'Match';
            
            if (isMatch) {
                itemsMap[scan.id].totleMatchLocationForItem++;
                if (scan.productLocation) itemsMap[scan.id].allMatchLocationsForItem.add(scan.productLocation);
            } else {
                itemsMap[scan.id].totleMissMatchLocationForItem++;
                if (scan.productLocation) itemsMap[scan.id].allMissMatchLocationsForItem.add(scan.productLocation);
            }
        });

        const result = Object.values(itemsMap).map(item => ({
            ...item,
            allMatchLocationsForItem: Array.from(item.allMatchLocationsForItem),
            allMissMatchLocationsForItem: Array.from(item.allMissMatchLocationsForItem)
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getTotleLocationUnique = async (req, res) => {
    try {
        const locations = await Scans.distinct('productLocation');
        res.json({ getTotleLocationUnique: locations.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getTotleLocationMatch = async (req, res) => {
    try {
        const matchLocations = await Scans.distinct('productLocation', { locationStatus: 'Match' });
        res.json({ getTotleLocationMatch: matchLocations.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getTotleLocationMissMatch = async (req, res) => {
    try {
        // As per prompt: getTotleLocationMissMatch(Extra,Missing)
        const missMatchLocations = await Scans.distinct('productLocation', { 
            locationStatus: { $in: ['Extra', 'Missing'] } 
        });
        res.json({ getTotleLocationMissMatch: missMatchLocations.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPersentageMatchLocation = async (req, res) => {
    try {
        const allUniqueLocations = await Scans.find();
        const matchLocations = await Scans.find({ locationStatus: 'Match' });
        
        const total = allUniqueLocations.length;
        const match = matchLocations.length;
        
        const percentage = total > 0 ? (match / total) * 100 : 0;
        res.json({ getPersentageMatchLocation: percentage });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPersentageMissMatchLocation = async (req, res) => {
    try {
        const allUniqueLocations = await Scans.find();
        const missMatchLocations = await Scans.find({ 
            locationStatus: { $in: ['Extra', 'Missing'] } 
        });
        
        const total = allUniqueLocations.length;
        const missMatch = missMatchLocations.length;
        
        const percentage = total > 0 ? (missMatch / total) * 100 : 0;
        res.json({ getPersentageMissMatchLocation: percentage });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getDiscrepancyLocations = async (req, res) => {
    try {
        // sysQuantity = 0, finalQuantity > 0
        const discrepancies = await Scans.find({
            sysQuantity: 0,
            finalQuantity: { $gt: 0 }
        });
        res.json(discrepancies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
