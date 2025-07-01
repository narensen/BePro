import { Bruno_Ace } from "next/font/google";

export default function SideBar() {
    const button = "rounded-3xl p-2 font-semibold mb-5 transition-all duration-300 hover:bg-black/30 hover:text-gray-900 hover:shadow-xl cursor-pointer";

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 shadow-xl hover:shadow-2xl transform transition-all duration-300">
        <div className="relative left-2 top-1 flex flex-col gap-3 w-fit">
            <button className={button}>Job Scrapper</button>
            <button className={button}>Profile</button>
            <button className={button}>Community</button>
            <button className={button}>Ada</button>
            <button className={button}>Communities</button>
            <button className={button}>Spaces</button>
            <button className={button}>Post</button>
        </div>
    </div>
  )
}