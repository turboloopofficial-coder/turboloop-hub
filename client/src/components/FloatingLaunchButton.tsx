import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket } from "lucide-react";
import { SITE } from "@/lib/constants";

export default function FloatingLaunchButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > window.innerHeight);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          href={SITE.mainApp}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-sm"
          style={{
            background: "linear-gradient(135deg, #22D3EE, #06b6d4)",
            color: "#040810",
            boxShadow: "0 0 25px rgba(34,211,238,0.35), 0 4px 20px rgba(0,0,0,0.4)",
          }}
        >
          <Rocket className="w-4 h-4" />
          Launch App
        </motion.a>
      )}
    </AnimatePresence>
  );
}
