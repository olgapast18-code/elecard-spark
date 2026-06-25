import { useState } from "react";
import { useApp, type Announcement } from "@/context/AppContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send } from "lucide-react";
import { EmojiPicker } from "@/components/EmojiPicker";

export function NewsDialog({ announcement, open, onOpenChange }: {
  announcement: Announcement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { currentUser, addComment } = useApp();
  const [draft, setDraft] = useState("");

  if (!announcement) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setDraft(""); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{announcement.title}</DialogTitle>
          <div className="text-xs text-muted-foreground">{new Date(announcement.date).toLocaleDateString("ru-RU")}</div>
        </DialogHeader>

        {announcement.image && (
          <img src={announcement.image} alt="" className="rounded-lg max-h-72 w-full object-cover" />
        )}
        <div className="text-sm whitespace-pre-wrap text-foreground/90">{announcement.body}</div>

        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 mb-3 text-sm font-semibold">
            <MessageSquare className="h-4 w-4 text-brand" /> Обсуждение ({announcement.comments.length})
          </div>

          {announcement.comments.length === 0 ? (
            <p className="text-sm text-muted-foreground mb-3">Будьте первым, кто оставит комментарий</p>
          ) : (
            <ul className="space-y-2 mb-3 max-h-60 overflow-y-auto pr-1">
              {announcement.comments.map((c) => (
                <li key={c.id} className="flex gap-2 text-sm bg-muted/40 rounded-lg p-2">
                  <img src={c.authorAvatar} className="h-8 w-8 rounded-full object-cover aspect-square shrink-0" alt="" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs">
                      <span className="font-medium">{c.authorName}</span>
                      <span className="text-muted-foreground"> · {new Date(c.date).toLocaleString("ru-RU")}</span>
                    </div>
                    <div className="text-sm whitespace-pre-wrap break-words">{c.body}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {currentUser && (
            <div className="flex gap-2 items-start">
              <img src={currentUser.avatar} className="h-8 w-8 rounded-full object-cover aspect-square shrink-0 mt-1" alt="" />
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Написать комментарий..."
                rows={2}
                className="text-sm flex-1"
              />
              <div className="flex flex-col gap-1">
                <EmojiPicker onPick={(e) => setDraft((d) => d + e)} />
                <Button
                  size="sm"
                  onClick={() => {
                    const body = draft.trim();
                    if (!body) return;
                    addComment(announcement.id, body);
                    setDraft("");
                  }}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
