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
  <SelectTrigger className="w-[180px] text-white">
    <SelectValue placeholder="Select duration" />
  </SelectTrigger>
  <SelectContent className="font-mono bg-black text-white">
    <SelectItem value="1w">1 Week</SelectItem>
    <SelectItem value="2w">2 Weeks</SelectItem>
    <SelectItem value="1m">1 Month</SelectItem>
    <SelectItem value="3m">3 Months</SelectItem>
    <SelectItem value="6m">6 Months</SelectItem>
    <SelectItem value="1y">1 Year</SelectItem>
  </SelectContent>
</Select>

  )
}

export default function QueryBox({ prompt, setPrompt, duration, setDuration }) {
  return (
    <div className="glow-container">
      <textarea
        className="resize-none rounded-xl p-4 bg-black w-full h-full text-amber-400 placeholder:text-amber-400"
        placeholder="Okay Pro, what’s the gameplan?"
        value={prompt || ""}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <div className='relative bottom-12 z-30 left-112 font-mono'>
            <DurationDropDown duration={duration} setDuration={setDuration}  />
        </div>
    </div>
  );
}
