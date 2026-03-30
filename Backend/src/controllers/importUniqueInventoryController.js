import XLSX from "xlsx";
import fs from "fs";
import UniqueInventory from "../DB/models/uniqueInventory.model.js";
import { parseExcelDate } from "../util/parseExcelDate.js";

export const importUniqueInventoryFile = async (req, res) => {
  try {
    const filePath = req.file.path;

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rawData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    // Normalize keys to lowercase and remove spaces 
    const data = rawData.map(row => {
      const normalizedRow = {};
      for (const key in row) {
        const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '');
        normalizedRow[normalizedKey] = row[key];
      }
      return normalizedRow;
    });

    const formattedData = data.map(row => ({
      date: parseExcelDate(row.date),
      category: row.category || "",
      matchedLocations: Number(row.matchedlocations || 0),
      missMatchedLocations: Number(row.missmatchedlocations || 0),
      locationAccuracy: Number(row.locationaccuracy || 0),
      matchedItems: Number(row.matcheditems || 0),
      missMatchedItems: Number(row.missmatcheditems || 0),
      itemsAccuracy: Number(row.itemsaccuracy || 0)
    }));

    const insertedDocs = await UniqueInventory.insertMany(formattedData, { ordered: false });

    if (formattedData.length > 0 && (!insertedDocs || insertedDocs.length === 0)) {
      throw new Error("Validation failed for all rows. Please check that Excel columns exist and are correctly named.");
    }

    fs.unlinkSync(filePath);

    res.json({
      message: "File Imported Successfully",
      rows: insertedDocs ? insertedDocs.length : 0
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
