import React, { useState } from "react";
import { X, Copy, Share2, ShieldCheck, Check } from "lucide-react";

/**
 * AccessModal Component
 * * Features:
 * - Professional dark-themed UI with Lucide icons.
 * - Top-right close button (X).
 * - Inline "Copied" feedback state (replaces browser alerts).
 * - Security notice for professional context.
 */

interface Props {
  isOpen: boolean;
  onClose: () => void;
  link: string;
}

const AccessModal: React.FC<Props> = ({ isOpen, onClose, link }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    // Note: document.execCommand('copy') used for environment compatibility
    const textArea = document.createElement("textarea");
    textArea.value = link;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
    document.body.removeChild(textArea);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Scanner Access",
          text: "Authorized scanner access link for event check-in.",
          url: link,
        });
      } catch (err) {
        // Silent catch for user cancellation
      }
    } else {
      // Fallback if sharing is not supported
      handleCopy();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-800 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER & CLOSE BUTTON */}
        <div className="flex items-center justify-between p-6 pb-2">
          <h2 className="text-xl font-semibold text-white tracking-tight">
            Scanner Access
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 pt-2">
          <p className="text-slate-400 text-sm mb-6">
            This link grants authorized personnel access to the check-in scanner. 
            Keep this link secure.
          </p>

          {/* LINK DISPLAY BOX */}
          <div className="relative group mb-6">
            <div className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 pr-12 font-mono text-xs text-emerald-400 break-all min-h-[60px] flex items-center">
              {link || "Generating secure link..."}
            </div>
            <button
              onClick={handleCopy}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-emerald-400 transition-colors"
              title="Copy to clipboard"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>

          {/* ACTIONS */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-medium py-2.5 px-4 rounded-xl transition-all active:scale-95"
            >
              <Copy size={16} />
              {copied ? "Copied!" : "Copy Link"}
            </button>
            
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
            >
              <Share2 size={16} />
              Share
            </button>
          </div>

          {/* SECURITY BADGE */}
          <div className="mt-8 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
            <ShieldCheck size={12} className="text-emerald-500" />
            Secure Access Management
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessModal;