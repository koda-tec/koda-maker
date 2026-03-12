"use client"
import * as XLSX from 'xlsx';
import { FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

interface ExportExcelProps {
  data: any[];
  fileName: string;
  sheetName: string;
}

export function ExportExcel({ data, fileName, sheetName }: ExportExcelProps) {
  const exportToExcel = () => {
    // Depuración: ver en consola qué estamos enviando
    console.log("Datos recibidos para Excel:", data);

    if (!data || data.length === 0) {
      toast.error("No hay datos para exportar", {
        description: "Asegúrate de tener pedidos registrados en este período."
      });
      return;
    }

    try {
      // 1. Crear la hoja a partir del JSON
      const worksheet = XLSX.utils.json_to_sheet(data);
      
      // 2. Crear el libro de trabajo
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      // 3. Generar archivo y descargar
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
      toast.success("Excel generado con éxito");
    } catch (error) {
      console.error("Error al exportar:", error);
      toast.error("Error técnico al generar el Excel");
    }
  };

  return (
    <button 
      onClick={exportToExcel}
      className="flex items-center gap-2 px-6 py-4 bg-green-600 text-white rounded-[20px] font-black uppercase text-[10px] tracking-widest hover:bg-green-700 transition-all shadow-xl shadow-green-100 active:scale-95 w-full md:w-auto justify-center"
    >
      <FileSpreadsheet size={18} /> Exportar Reporte Excel
    </button>
  );
}