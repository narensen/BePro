"use client";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function SideNavbar() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className={`${
        isOpen ? "w-64" : "w-16"
      } h-full bg-[#0d0d0d] border-r border-white/10 transition-all duration-300 flex flex-col relative`}
    >
      {}
      <button
        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {}
      <div className={`mt-16 px-4 ${isOpen ? "block" : "hidden"}`}>
        <nav className="space-y-4">
          <a href="#" className="block hover:text-yellow-300">Dashboard</a>
          <a href="#" className="block hover:text-yellow-300">Skills</a>
          <a href="#" className="block hover:text-yellow-300">Projects</a>
          <a href="#" className="block hover:text-yellow-300">Settings</a>
        </nav>
      </div>
    </div>
  );
}
