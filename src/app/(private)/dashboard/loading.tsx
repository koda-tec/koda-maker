export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="w-10 h-10 border-4 border-gray-100 border-t-[#f13d4b] rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] animate-pulse">Sincronizando datos...</p>
    </div>
  )
}