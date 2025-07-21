export default function QueryPage() {
  return (
    <div className="relative w-full max-w-2xl rounded-2xl p-[1.5px] bg-gradient-to-r from-pink-500 via-blue-500 to-green-500 shadow-md">
      <div className="bg-white rounded-2xl w-full h-[220px]">

            <textarea
              className="w-full h-full bg-black text-white text-base px-6 py-4 rounded-2xl resize-none focus:outline-none placeholder:text-neutral-400"
              placeholder="Start writing your Codex here..."
            />
          </div>
        </div>
  )
}