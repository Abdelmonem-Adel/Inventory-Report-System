import React, { useRef, useState } from "react";
import * as XLSX from "xlsx";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL + "/api") || '/api';

// Helper functions for previewing files
function previewExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      resolve(rows);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

async function importFile(file, url) {
  if (!file) throw new Error("No file provided");
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(url, { method: "POST", body: formData });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Failed to import file");
  return result.rows;
}

export default function ImportPage() {
  const [logInventory, setLogInventory] = useState("");
  const [logScans, setLogScans] = useState("");
  const [logUniqueInventory, setLogUniqueInventory] = useState("");
  const fileInputInventory = useRef();
  const fileInputScans = useRef();
  const fileInputUniqueInventory = useRef();

  const handlePreviewInventory = async () => {
    const file = fileInputInventory.current.files[0];
    if (!file) return setLogInventory("Please select a file to preview.");
    try {
      const rows = await previewExcel(file);
      setLogInventory(`Preview (first 10 rows): ${JSON.stringify(rows.slice(0, 10))}`);
    } catch (e) {
      setLogInventory("Preview error: " + e.message);
    }
  };

  const handleImportInventory = async () => {
    const file = fileInputInventory.current.files[0];
    if (!file) return setLogInventory("Please select a file to import.");
    try {
      const count = await importFile(file, `${API_BASE_URL}/import-inventory`);
      setLogInventory(`Successfully imported ${count} inventory rows!`);
    } catch (e) {
      setLogInventory("Import error: " + e.message);
    }
  };

  const handlePreviewScans = async () => {
    const file = fileInputScans.current.files[0];
    if (!file) return setLogScans("Please select a file to preview.");
    try {
      const rows = await previewExcel(file);
      setLogScans(`Preview (first 10 rows): ${JSON.stringify(rows.slice(0, 10))}`);
    } catch (e) {
      setLogScans("Preview error: " + e.message);
    }
  };

  const handleImportScans = async () => {
    const file = fileInputScans.current.files[0];
    if (!file) return setLogScans("Please select a file to import.");
    try {
      const count = await importFile(file, `${API_BASE_URL}/import-scans`);
      setLogScans(`Successfully imported ${count} scan rows!`);
    } catch (e) {
      setLogScans("Import error: " + e.message);
    }
  };

  const handlePreviewUniqueInventory = async () => {
    const file = fileInputUniqueInventory.current.files[0];
    if (!file) return setLogUniqueInventory("Please select a file to preview.");
    try {
      const rows = await previewExcel(file);
      setLogUniqueInventory(`Preview (first 10 rows): ${JSON.stringify(rows.slice(0, 10))}`);
    } catch (e) {
      setLogUniqueInventory("Preview error: " + e.message);
    }
  };

  const handleImportUniqueInventory = async () => {
    const file = fileInputUniqueInventory.current.files[0];
    if (!file) return setLogUniqueInventory("Please select a file to import.");
    try {
      const count = await importFile(file, `${API_BASE_URL}/import-unique-inventory`);
      setLogUniqueInventory(`Successfully imported ${count} unique inventory rows!`);
    } catch (e) {
      setLogUniqueInventory("Import error: " + e.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-8 text-center">Import Data</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Inventory Card */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4 border border-gray-100">
          <h3 className="text-lg font-semibold mb-2 text-blue-700">Import Items <span className="text-xs text-muted">(Inventory View)</span></h3>
          <input
            type="file"
            ref={fileInputInventory}
            accept=".xlsx,.xls,.csv"
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-2"
          />
          <div className="flex gap-2">
            <button
              onClick={handlePreviewInventory}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition"
            >
              Preview
            </button>
            <button
              onClick={handleImportInventory}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              Import
            </button>
          </div>
          {logInventory && (
            <div className="bg-gray-50 border border-gray-200 rounded p-2 mt-2 text-xs text-gray-700 whitespace-pre-wrap max-h-40 overflow-auto">
              {logInventory}
            </div>
          )}
        </div>
        {/* Scans Card */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4 border border-gray-100">
          <h3 className="text-lg font-semibold mb-2 text-green-700">Import Scans <span className="text-xs text-muted">(Location View - Productivity View)</span></h3>
          <input
            type="file"
            ref={fileInputScans}
            accept=".xlsx,.xls,.csv"
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 mb-2"
          />
          <div className="flex gap-2">
            <button
              onClick={handlePreviewScans}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition"
            >
              Preview
            </button>
            <button
              onClick={handleImportScans}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              Import
            </button>
          </div>
          {logScans && (
            <div className="bg-gray-50 border border-gray-200 rounded p-2 mt-2 text-xs text-gray-700 whitespace-pre-wrap max-h-40 overflow-auto">
              {logScans}
            </div>
          )}
        </div>
        {/* Unique Inventory Card */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4 border border-gray-100">
          <h3 className="text-lg font-semibold mb-2 text-purple-700">Import Unique Inventory <span className="text-xs text-muted">(Unique Inventory Table)</span></h3>
          <input
            type="file"
            ref={fileInputUniqueInventory}
            accept=".xlsx,.xls,.csv"
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 mb-2"
          />
          <div className="flex gap-2">
            <button
              onClick={handlePreviewUniqueInventory}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition"
            >
              Preview
            </button>
            <button
              onClick={handleImportUniqueInventory}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              Import
            </button>
          </div>
          {logUniqueInventory && (
            <div className="bg-gray-50 border border-gray-200 rounded p-2 mt-2 text-xs text-gray-700 whitespace-pre-wrap max-h-40 overflow-auto">
              {logUniqueInventory}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

