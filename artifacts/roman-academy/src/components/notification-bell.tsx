import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, X, CheckCheck, BookOpen, FlaskConical, Trophy } from "lucide-react";

export type Notification = {
  id: string;
  title: string;
  body: string;
  type: string;
  createdAt: string;
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  chapter_start:    <BookOpen className="size-4 text-gold-400" />,
  chapter_complete: <CheckCheck className="size-4 text-emerald-400" />,
  test_result:      <Trophy className="size-4 text-blue-400" />,
  default:          <Bell className="size-4 text-ivory-100/60" />,
};

function NotificationItem({
  n,
  onRead,
}: {
  n: Notification;
  onRead: (id: string) => void;
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 border-b border-gold-500/10 hover:bg-gold-400/5 transition-colors group last:border-0">
      <div className="shrink-0 mt-0.5">
        {TYPE_ICONS[n.type] ?? TYPE_ICONS.default}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white leading-snug">{n.title}</p>
        <p className="text-xs text-ivory-100/60 mt-0.5 leading-relaxed">{n.body}</p>
        <p className="text-xs text-ivory-100/30 mt-1">
          {new Date(n.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      <button
        onClick={() => onRead(n.id)}
        title="Mark as read"
        className="shrink-0 p-1 rounded text-ivory-100/20 hover:text-ivory-100/60 hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

function NotificationToast({
  n,
  onDismiss,
  onRead,
}: {
  n: Notification;
  onDismiss: () => void;
  onRead: (id: string) => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 6000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-24 lg:bottom-6 right-4 z-[200] w-80 animate-in slide-in-from-right-full duration-300">
      <div className="rounded-xl border border-gold-500/30 bg-navy-900/95 backdrop-blur-md shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-gold-500/15 bg-gold-400/5">
          <Bell className="size-3.5 text-gold-400" />
          <span className="text-xs font-semibold text-gold-300 uppercase tracking-wider">New Notification</span>
          <button onClick={onDismiss} className="ml-auto text-ivory-100/40 hover:text-white transition-colors">
            <X className="size-3.5" />
          </button>
        </div>
        <div className="flex items-start gap-3 p-4">
          <div className="shrink-0 mt-0.5">{TYPE_ICONS[n.type] ?? TYPE_ICONS.default}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">{n.title}</p>
            <p className="text-xs text-ivory-100/60 mt-1 leading-relaxed">{n.body}</p>
          </div>
        </div>
        <div className="flex gap-2 px-4 pb-4">
          <button
            onClick={() => { onRead(n.id); onDismiss(); }}
            className="flex-1 text-xs py-1.5 rounded-lg bg-gold-400/15 text-gold-300 border border-gold-400/25 hover:bg-gold-400/25 transition-colors font-semibold"
          >
            Mark Read
          </button>
          <button
            onClick={onDismiss}
            className="flex-1 text-xs py-1.5 rounded-lg text-ivory-100/50 border border-gold-500/15 hover:bg-white/5 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

export function NotificationBell({ studentId }: { studentId?: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<Notification | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const shownIds = useRef<Set<string>>(new Set());
  const base = import.meta.env.BASE_URL;

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${base}api/student/notifications`);
      if (!res.ok) return;
      const data: Notification[] = await res.json();
      if (!Array.isArray(data)) return;
      setNotifications(data);
      const newest = data.find(n => !shownIds.current.has(n.id));
      if (newest) {
        shownIds.current.add(newest.id);
        setToast(newest);
      }
    } catch {}
  }, [base]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const markRead = async (id: string) => {
    try {
      await fetch(`${base}api/student/notifications/${id}/read`, { method: "PATCH" });
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (toast?.id === id) setToast(null);
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await fetch(`${base}api/student/notifications/read-all`, { method: "PATCH" });
      setNotifications([]);
      setToast(null);
    } catch {}
  };

  const count = notifications.length;

  return (
    <>
      {toast && (
        <NotificationToast
          n={toast}
          onDismiss={() => setToast(null)}
          onRead={markRead}
        />
      )}

      <div className="relative" ref={panelRef}>
        <button
          onClick={() => setOpen(o => !o)}
          className="relative p-2 rounded-lg border border-gold-400/20 bg-navy-950/50 hover:bg-white/10 text-gold-300 transition-all"
          title="Notifications"
        >
          <Bell className="size-4" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-gold-400 text-navy-950 text-[10px] font-bold flex items-center justify-center px-1">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-80 z-[100] rounded-xl border border-gold-500/20 bg-navy-900/98 backdrop-blur-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gold-500/15">
              <div className="flex items-center gap-2">
                <Bell className="size-4 text-gold-400" />
                <span className="text-sm font-bold text-white">Notifications</span>
                {count > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-gold-400/20 text-gold-300 text-xs font-semibold">{count}</span>
                )}
              </div>
              {count > 0 && (
                <button onClick={markAllRead} className="text-xs text-ivory-100/50 hover:text-gold-300 transition-colors">
                  Clear all
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {count === 0 ? (
                <div className="py-10 text-center">
                  <Bell className="size-8 mx-auto mb-2 text-gold-400/20" />
                  <p className="text-sm text-ivory-100/40">All caught up!</p>
                  <p className="text-xs text-ivory-100/25 mt-1">No new notifications</p>
                </div>
              ) : (
                notifications.map(n => (
                  <NotificationItem key={n.id} n={n} onRead={markRead} />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
