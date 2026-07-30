/**
 * PushNotificationPrompt — non-intrusive prompt to subscribe to web push notifications.
 *
 * Why: Retention drops to ~20-30% by Day 10. Push notifications are the most effective
 * re-engagement channel for mobile web users (87.8% of our traffic).
 *
 * Behavior:
 * - Only shows after 3+ page views in the session (engaged users)
 * - Appears as a small floating card in the bottom-left
 * - Dismissable for 30 days
 * - Uses the native Push API + service worker
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";

const DISMISS_KEY = "tl_push_prompt_dismissed";
const VIEW_KEY = "tl_push_pageviews";
const MIN_VIEWS = 3;
const DISMISS_DAYS = 30;

function isDismissed(): boolean {
  try {
    const val = localStorage.getItem(DISMISS_KEY);
    if (!val) return false;
    return Date.now() - parseInt(val, 10) < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

function isAlreadySubscribed(): boolean {
  return Notification.permission === "granted";
}

export default function PushNotificationPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isPushSupported()) return;
    if (isAlreadySubscribed()) return;
    if (isDismissed()) return;
    if (Notification.permission === "denied") return;

    // Count page views
    const views = parseInt(sessionStorage.getItem(VIEW_KEY) || "0", 10) + 1;
    sessionStorage.setItem(VIEW_KEY, views.toString());

    if (views >= MIN_VIEWS) {
      const timer = setTimeout(() => setShow(true), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    } catch {}
  };

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      if (result === "granted") {
        // Register with service worker
        const registration = await navigator.serviceWorker.ready;
        // In production, you'd subscribe to a VAPID push service here.
        // For now, we just register the permission and track the event.
        if (window.gtag) {
          window.gtag("event", "push_notification_subscribed", {
            event_category: "conversion",
            value: 1,
          });
        }
      }
      dismiss();
    } catch {
      dismiss();
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-20 left-4 z-[80] w-72 rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
          }}
        >
          {/* Top accent */}
          <div
            className="h-1"
            style={{ background: "linear-gradient(90deg, #0891B2, #7C3AED)" }}
          />

          <div className="p-4">
            {/* Close */}
            <button
              onClick={dismiss}
              className="absolute top-2 right-2 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {/* Content */}
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, rgba(8,145,178,0.1), rgba(124,58,237,0.1))",
                }}
              >
                <Bell className="h-4 w-4 text-cyan-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">
                  Stay in the Loop
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                  Get notified about new promotions, community calls, and yield updates.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={requestPermission}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:brightness-110"
                    style={{
                      background: "linear-gradient(135deg, #0891B2, #0E7490)",
                    }}
                  >
                    Enable
                  </button>
                  <button
                    onClick={dismiss}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
                  >
                    Not now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
