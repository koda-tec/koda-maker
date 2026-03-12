"use client"
import * as XLSX from 'xlsx';
import { FileSpreadsheet } from "lucide-react";

interface ExportExcelProps {
  data: any[];
  fileName: string;
  sheetName: string;
}

export function ExportExcel({ data, fileName, sheetName }: ExportExcelProps) {
  const exportToExcel = () => {
    // 1. Crear el libro y la hoja
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // 2. Descargar
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  return (
    <button 
      onClick={exportToExcel}
      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-green-700 transition-all shadow-lg active:scale-95"
    >
      <FileSpreadsheet size={16} /> Exportar Excel
    </button>
  );
}