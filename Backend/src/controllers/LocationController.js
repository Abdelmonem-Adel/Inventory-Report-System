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
                    finalQuantityForItem: 0,
                    totlesysQuantityForItem: 0,
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

export const toggleAlertVisibility = async (req, res) => {
    try {
        const { id } = req.params;
        const scan = await Scans.findById(id);
        if (!scan) {
            return res.status(404).json({ message: 'Scan not found' });
        }
        scan.hiddenFromAlerts = !scan.hiddenFromAlerts;
        await scan.save();
        res.json(scan);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const bulkToggleAlertVisibility = async (req, res) => {
    try {
        const { ids, hidden } = req.body;
        if (!Array.isArray(ids)) {
            return res.status(400).json({ message: 'IDs must be an array' });
        }
        await Scans.updateMany(
            { _id: { $in: ids } },
            { $set: { hiddenFromAlerts: hidden } }
        );
        res.json({ message: 'Scans updated successfully', count: ids.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Helper to escape regex special characters
const escapeRegExp = (string) => {
    return string ? string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '';
};

// Helper to build scan query from filters
const buildScanQuery = (filters) => {
    const { search, categoryL1, categoryL2, dateFrom, dateTo, selectedDays, daysFilterMode } = filters;
    let query = {};

    if (search) {
        const escapedSearch = escapeRegExp(search);
        const searchRegex = new RegExp(escapedSearch, 'i');
        query.$or = [
            { SKUname: searchRegex },
            { barcode: searchRegex },
            { id: searchRegex },
            { userName: searchRegex },
            { productLocation: searchRegex }
        ];
    }

    if (categoryL1 && categoryL1 !== 'All Categories') {
        const cats = categoryL1.split(',');
        if (cats.length > 0) {
            query.category = { $in: cats.map(c => new RegExp(escapeRegExp(c), 'i')) };
        }
    }

    if (daysFilterMode === 'days' && selectedDays) {
        const days = selectedDays.split(',');
        if (days.length > 0) {
            const startDates = days.map(d => new Date(d)).filter(d => !isNaN(d));
            const endDates = startDates.map(d => {
                const de = new Date(d);
                de.setHours(23, 59, 59, 999);
                return de;
            });
            if (startDates.length > 0) {
                query.$or = (query.$or || []).concat(startDates.map((start, i) => ({
                    date: { $gte: start, $lte: endDates[i] }
                })));
            }
        }
    } else {
        if (dateFrom || dateTo) {
            query.date = {};
            if (dateFrom && !isNaN(new Date(dateFrom))) query.date.$gte = new Date(dateFrom);
            if (dateTo && !isNaN(new Date(dateTo))) {
                const dt = new Date(dateTo);
                dt.setHours(23, 59, 59, 999);
                query.date.$lte = dt;
            }
            if (Object.keys(query.date).length === 0) delete query.date;
        }
    }

    return query;
};

export const getLocationsSummary = async (req, res) => {
    try {
        const query = buildScanQuery(req.query);
        const scans = await Scans.find(query);

        // 1. Basic KPIs
        const totalProducts = new Set(scans.map(s => s.id)).size;
        const totalLocations = new Set(scans.map(s => s.productLocation)).size;

        const locStatusMatch = scans.filter(s => s.locationStatus === 'Match').length;
        const locStatusMismatch = scans.length - locStatusMatch;
        const locMatchPercent = scans.length > 0 ? (locStatusMatch / scans.length) * 100 : 0;
        const locMismatchPercent = scans.length > 0 ? (locStatusMismatch / scans.length) * 100 : 0;

        const itemDayKeyToHasMismatch = new Map();
        scans.forEach(scan => {
            const dateStr = scan.date ? (typeof scan.date === 'string' ? scan.date.slice(0, 10) : scan.date.toISOString().slice(0, 10)) : 'Unknown';
            const itemId = scan.id ?? 'Unknown';
            const key = `${dateStr}|${itemId}`;
            const hasMismatchHere = scan.locationStatus !== 'Match';
            itemDayKeyToHasMismatch.set(key, (itemDayKeyToHasMismatch.get(key) || false) || hasMismatchHere);
        });

        let prodStatusMatch = 0;
        let prodStatusMismatch = 0;
        itemDayKeyToHasMismatch.forEach(hasMismatch => {
            if (hasMismatch) prodStatusMismatch++;
            else prodStatusMatch++;
        });

        const prodDenom = prodStatusMatch + prodStatusMismatch;
        const prodMatchPercent = prodDenom > 0 ? (prodStatusMatch / prodDenom) * 100 : 0;

        // 2. Per Item Stats
        const itemGroups = scans.reduce((acc, scan) => {
            if (!acc[scan.id]) {
                acc[scan.id] = {
                    name: scan.SKUname,
                    id: scan.id,
                    category: scan.category,
                    matchLocs: 0,
                    missMatchLocs: 0,
                    totalFinalQty: 0,
                    totalSysQty: 0,
                    variance: 0,
                    locations: []
                };
            }
            const item = acc[scan.id];
            if (scan.locationStatus === 'Match') item.matchLocs++;
            else item.missMatchLocs++;
            item.totalFinalQty += (Number(scan.finalQuantity) || 0);
            item.totalSysQty += (Number(scan.sysQuantity) || 0);
            item.variance += (Number(scan.variance) || 0);

            item.locations.push({
                productLocation: scan.productLocation,
                locationStatus: scan.locationStatus,
                finalQuantity: scan.finalQuantity,
                sysQuantity: scan.sysQuantity,
                variance: scan.variance,
                _id: scan._id
            });
            return acc;
        }, {});

        const itemStats = Object.values(itemGroups).map(item => {
            if (item.totalFinalQty > item.totalSysQty) item.status = 'Extra';
            else if (item.totalFinalQty < item.totalSysQty) item.status = 'Missing';
            else item.status = 'Match';
            return item;
        });

        // 3. Discrepancy Putaway
        const discrepancyPutaway = scans
            .filter(s => Number(s.sysQuantity) === 0 && Number(s.finalQuantity) > 0)
            .map(s => ({
                id: s.id,
                SKUname: s.SKUname,
                productLocation: s.productLocation,
                finalQuantity: s.finalQuantity,
                sysQuantity: s.sysQuantity,
                variance: s.variance
            }));

        // 4. Available Days & Categories per day (for the dropdown)
        const categoriesByDay = {};
        scans.forEach(s => {
            const dInput = s.dateInput || s.date;
            if (!dInput) return;
            const dayKey = typeof dInput === 'string' ? dInput.slice(0, 10) : dInput.toISOString().slice(0, 10);
            if (!categoriesByDay[dayKey]) categoriesByDay[dayKey] = new Set();
            if (s.category) {
                s.category.split(',').forEach(c => categoriesByDay[dayKey].add(c.trim()));
            }
        });

        const availableDays = Object.keys(categoriesByDay).sort().reverse();
        // Convert sets to sorted arrays
        Object.keys(categoriesByDay).forEach(day => {
            categoriesByDay[day] = Array.from(categoriesByDay[day]).sort();
        });

        res.json({
            metrics: {
                totalProducts,
                totalLocations,
                productStatus: {
                    match: prodStatusMatch,
                    mismatch: prodStatusMismatch,
                    matchPercent: prodMatchPercent,
                    mismatchPercent: prodDenom > 0 ? (prodStatusMismatch / prodDenom) * 100 : 0
                },
                locationStatus: {
                    match: locStatusMatch,
                    mismatch: locStatusMismatch,
                    matchPercent: locMatchPercent,
                    mismatchPercent: locMismatchPercent
                }
            },
            itemStats,
            discrepancyPutaway,
            availableDays,
            categoriesByDay
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPaginatedScans = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 25;
        const skip = (page - 1) * limit;

        const query = buildScanQuery(req.query);

        const total = await Scans.countDocuments(query);
        const scans = await Scans.find(query)
            .sort({ dateInput: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            data: scans,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
