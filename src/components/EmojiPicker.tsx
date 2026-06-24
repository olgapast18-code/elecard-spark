import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Smile } from "lucide-react";

const EMOJIS = ["😀","😄","😊","😍","🤩","😎","🤗","🙌","👍","👏","🙏","💪","🎉","🎊","🥳","🔥","✨","⭐","🚀","💡","💼","💻","📣","📰","🛒","🎁","☕","🍕","🍰","❤️","💙","💚","✅","❓","❗","🤝","👋","😂","😉","🤔","😅"];

export function EmojiPicker({ onPick }: { onPick: (e: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" size="icon" variant="ghost" className="shrink-0"><Smile className="h-4 w-4" /></Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="grid grid-cols-8 gap-1">
          {EMOJIS.map((e) => (
            <button key={e} type="button" onClick={() => { onPick(e); setOpen(false); }} className="text-xl hover:bg-accent rounded p-1">{e}</button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
