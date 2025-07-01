import SideBar from "../components/SideBar"

export default function Home() {
    return (
        <main className="min-h-screen flex flex-col bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 text-gray-900 font-sans">
  <div className="relative z-10">
    <h1 className="text-center text-5xl md:text-7xl font-black mb-6 leading-tight mt-10">BePro</h1>
  </div>

  <section className="flex flex-1 px-4 py-6">
    <aside className="fixed w-50 relative bottom-10 left-30">
      <SideBar />
    </aside>

  </section>
</main>

    )
}