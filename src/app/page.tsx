import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8">
        <div className="w-24 h-24 bg-black rounded-3xl flex items-center justify-center shadow-2xl rotate-3">
          <span className="text-white text-4xl font-black italic">K</span>
        </div>
        
        <div className="space-y-4 max-w-md">
          <h1 className="text-5xl font-black text-black leading-none uppercase tracking-tighter">
            Maker <br />
            <span className="text-[#f13d4b]">Control</span>
          </h1>
          <p className="text-gray-600 font-medium">
            El sistema de gestión para emprendedores de grabado láser e impresión 3D.
          </p>
        </div>

        <div className="flex flex-col w-full max-w-xs gap-4 pt-8">
          <Link 
            href="/login" 
            className="w-full p-4 bg-black text-white rounded-2xl font-bold text-lg shadow-xl active:scale-95 transition-all text-center"
          >
            Comenzar ahora
          </Link>
          <Link 
            href="/login" 
            className="w-full p-4 bg-white text-black border-2 border-black rounded-2xl font-bold text-lg active:scale-95 transition-all text-center"
          >
            Iniciar Sesión
          </Link>
        </div>
      </main>

      {/* Footer / Branding */}
      <footer className="p-8 text-center">
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
          Power by KODA Tech
        </p>
      </footer>
    </div>
  );
}