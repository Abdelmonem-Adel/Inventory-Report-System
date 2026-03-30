import XLSX from "xlsx";
import fs from "fs";
import Scans from "../DB/models/scans.model.js";
import { parseExcelDate } from "../util/parseExcelDate.js";

export const importScansFile = async (req, res) => {
  try {
    const filePath = req.file.path;

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    const formattedData = data.map(row => ({
      date: parseExcelDate(row.date),
      productLocation: row.productLocation,
      barcode: Number(row.barcode),
      id: Number(row.id),
      SKUname: row.SKUname,
      productionDate: parseExcelDate(row.productionDate),
      expirationDate: parseExcelDate(row.expirationDate),
      finalQuantity: Number(row.finalQuantity),
      sysQuantity: Number(row.sysQuantity),
      userName: row.userName,
      dateInput: parseExcelDate(row.dateInput),
      category: row.category,
      locationStatus: row.locationStatus,
      productStatus: row.productStatus,
      accuracy: row.accuracy,
      variance: Number(row.variance)
    }));

    await Scans.insertMany(formattedData, { ordered: false });

    fs.unlinkSync(filePath);

    res.json({
      message: "File Imported Successfully",
      rows: formattedData.length
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};