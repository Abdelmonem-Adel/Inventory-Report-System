import XLSX from "xlsx";
import fs from "fs";
import Inventory from "../DB/models/inventory.model.js";
import { parseExcelDate } from "../util/parseExcelDate.js";

export const importInventoryFile = async (req, res) => {
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
        const normalizedKey = key.trim().toLowerCase().replace(/\\s+/g, '');
        normalizedRow[normalizedKey] = row[key];
      }
      return normalizedRow;
    });

    const formattedData = data.map(row => ({
      // Handle possible key matches since we normalized headers to lowercase
      date: parseExcelDate(row.date),
      barcode: String(row.barcode || ""),
      id: String(row.id || row.itemcode || ""),
      SKUname: String(row.skuname || row.description || row.sku || ""),
      finalQuantity: Number(row.finalquantity || 0),
      sysQuantity: Number(row.sysquantity || 0),
      category: String(row.category || ""),
      productStatus: String(row.productstatus || row.status || ""),
      variance: Number(row.variance || 0)
    }));

    const insertedDocs = await Inventory.insertMany(formattedData, { ordered: false });


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