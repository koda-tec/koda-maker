export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-bold text-[#000000]">SyG Creaciones</h1>
      <p className="mt-4 text-gray-600">Bienvenido al sistema de gestión</p>
      
      <div className="mt-10 grid grid-cols-1 gap-4 w-full max-w-sm">
        <div className="p-6 border rounded-xl bg-card shadow-sm">
          <h2 className="font-semibold">Resumen de Hoy</h2>
          <p className="text-sm text-gray-500">No hay pedidos pendientes para hoy.</p>
        </div>
      </div>
    </main>
  );
}