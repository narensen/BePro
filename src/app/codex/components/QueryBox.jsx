import '../../codex/Codex.css'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function DurationDropDown({ duration, setDuration }) {
  return (
    <Select className="font-mono bg-black" onValueChange={setDuration}>
      <SelectTrigger className="w-full sm:w-[180px] text-white text-sm">
        <SelectValue placeholder="Select duration" />
      </SelectTrigger>
      <SelectContent className="font-mono bg-black text-white">
        <SelectItem value="1 week">1 Week</SelectItem>
        <SelectItem value="2 week">2 Weeks</SelectItem>
        <SelectItem value="1 month">1 Month</SelectItem>
        <SelectItem value="3 month">3 Months</SelectItem>
        <SelectItem value="6 month">6 Months</SelectItem>
        <SelectItem value="1 year">1 Year</SelectItem>
      </SelectContent>
    </Select>
  )
}

export default function QueryBox({ prompt, setPrompt, duration, setDuration }) {
  return (
    <div className=''>
      <div>
        <textarea
          className="resize-none rounded-xl p-3 lg:p-4 bg-black w-256 h-32 lg:h-48 lg:w-256 text-amber-400 placeholder:text-amber-400 text-sm lg:text-base"
          placeholder="Okay Pro, what's the gameplan?"
          value={prompt || ""}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>
      
      <div className="lg:mt-4 flex justify-center lg:justify-end relative bottom-16">
        <DurationDropDown duration={duration} setDuration={setDuration} />
      </div>
    </div>
  );
}