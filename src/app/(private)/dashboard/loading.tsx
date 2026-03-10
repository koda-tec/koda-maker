export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
      <div className="w-12 h-12 border-4 border-gray-100 border-t-[#f13d4b] rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] animate-pulse">
        Cargando Koda Maker...
      </p>
    </div>
  )
}