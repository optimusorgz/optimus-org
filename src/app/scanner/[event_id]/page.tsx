"use client";

import React, { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useParams, useSearchParams } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";

import AccessModal from "@/components/scanner/accessModel";

import {
  Camera,
  CameraOff,
  Download,
  ExternalLink,
  History,
  Loader2,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  XCircle as XCircleIcon,
} from "lucide-react";

export default function EventScannerPage() {
  const { event_id } = useParams() as { event_id: string };
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [cameraOn, setCameraOn] = useState(false);
  const [ticket, setTicket] = useState("");
  const [status, setStatus] = useState<"success" | "error" | "">("");
  const [message, setMessage] = useState("");
  const [scanning, setScanning] = useState(false);
  const [checkedList, setCheckedList] = useState<any[]>([]);
  const [accessLink, setAccessLink] = useState("");
  const [loadingCamera, setLoadingCamera] = useState(false);

  const [showModal, setShowModal] = useState(false);

  // ---------------- CAMERA CONTROL ----------------
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
  return () => {
    const scanner = html5QrCodeRef.current;

    if (scanner) {
      (async () => {
        try {
          await scanner.stop();
        } catch {}

        try {
          await scanner.clear();
        } catch {}

        html5QrCodeRef.current = null;
      })();
    }
  };
}, []);

  const startScanner = async () => {
    if (!event_id || cameraOn) return;

    console.log("Camera started");

    // 1. Clean up any existing instance before starting a new one
    if (html5QrCodeRef.current) {
      await stopScanner();
    }

    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 15,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const size = Math.floor(minEdge * 0.7);
            return { width: size, height: size };
          }, 
          aspectRatio: 1.0,
        },
        (decodedText, decodedResult) => {
          console.log("SCAN SUCCESS:", decodedText);
          console.log("FULL RESULT:", decodedResult);

          setScanning(true);
          handleTicketScan(decodedText);
        },
        (errorMessage) => {
          // 🔥 This runs continuously while scanning
          console.log("SCAN FAILED / TRYING:", errorMessage);
        }
      );

      setCameraOn(true);
    } catch (err) {
      console.error("Scanner start error:", err);
      // If start fails, clear the ref so we can try again
      html5QrCodeRef.current = null;
      alert("Camera permission denied or device not found");
    }
  };

  const stopScanner = async () => {
  const scanner = html5QrCodeRef.current;

  if (!scanner) {
    setCameraOn(false);
    return;
  }

  try {
    // 🔥 Always try stop safely
    await scanner.stop().catch(() => {});
  } catch {}

  try {
    // 🔥 Clear UI safely
    try {
      await scanner.clear();
    } catch {}
  } catch {}

  html5QrCodeRef.current = null;
  setCameraOn(false);
  setScanning(false);
};



  function handleScanError(err: any) {
    console.warn("QR Scan Error:", err);
  }

  // ---------------- CHECK-IN ----------------
  const handleTicketScan = async (ticketUid: string) => {
    setTicket(ticketUid);
    setStatus("");
    setMessage("Checking...");

    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        body: JSON.stringify({
          ticket_uid: ticketUid,
          event_id,
          token,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");

        setCheckedList((prev) => [
          {
            name: data.name || "Participant",
            time: new Date().toLocaleTimeString(),
            ticket: ticketUid,
          },
          ...prev,
        ]);
      } else {
        setStatus("error");
      }

      setMessage(data.message);
    } catch {
      setStatus("error");
      setMessage("Server error");
    }

    // 🔥 allow next scan
    setTimeout(() => {
      setScanning(false);
    }, 1500);
  };

  // ---------------- GENERATE ACCESS ----------------
  const generateAccess = () => {
  const fullLink = `${window.location.origin}/scanner/${event_id}`;

  setAccessLink(fullLink);
  setShowModal(true);
};

  const copyLink = () => {
    navigator.clipboard.writeText(accessLink);
    alert("Copied!");
  };

  const shareLink = async () => {
    if (navigator.share) {
      await navigator.share({ url: accessLink });
    } else {
      alert("Sharing not supported");
    }
  };

  // ---------------- DOWNLOAD CSV ----------------
  const downloadCSV = () => {
    const csv = [
      ["Name", "Time", "Ticket"],
      ...checkedList.map((u) => [u.name, u.time, u.ticket]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance.csv";
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 font-sans selection:bg-blue-500/30 mt-[2rem]">
      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* HEADER */}
        <header className="flex flex-row md:items-center justify-between gap-2 mb-12">
          <div>
            <div className="flex items-center gap-2 text-blue-400 font-medium mb-1">
              <ShieldCheck size={18} />
              <span className="text-xs uppercase tracking-widest">Secure Gateway</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Event <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Scanner</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={generateAccess}
              className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 px-4 py-2.5 rounded-xl transition-all text-sm font-medium"
            >
              <ExternalLink size={16} />
              Grant Access
            </button>
            {checkedList.length > 0 && (
              <button
                onClick={downloadCSV}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl transition-all text-sm font-medium shadow-lg shadow-emerald-900/20"
              >
                <Download size={16} />
                Export CSV
              </button>
            )}
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: SCANNER PANEL */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
                  <Camera className="text-blue-400" size={20} />
                  Live Viewport
                </h2>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${cameraOn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                  <span className="text-xs font-mono text-slate-400">{cameraOn ? 'ACTIVE' : 'OFFLINE'}</span>
                </div>
              </div>

              {/* SCANNER VIEWPORT */}
              <div className="relative group">
                <div className="relative w-[300px] h-[300px]">
                  {/* EMPTY container for scanner ONLY */}
                  <div
                    id="qr-reader"
                    // className="w-full aspect-square bg-slate-950 rounded-2xl border border-slate-800"
                    className="w-full h-full"
                    // style={{ width: "300px", height: "300px" }}
                  />

                  {/* UI overlay OUTSIDE scanner */}
                  {!cameraOn && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 pointer-events-none">
                      <CameraOff size={68} className="mb-4 opacity-20" />
                      <p className="text-sm">Camera is currently inactive</p>
                    </div>
                    
                  )}
                </div>
                
                {/* SCANNER OVERLAY */}
                {cameraOn && !scanning && (
                  <div className="absolute inset-0 pointer-events-none p-8">
                    <div className="w-full h-full border-2 border-blue-500/30 rounded-2xl relative">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />
                      <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-blue-500/50 animate-[scan_2s_ease-in-out_infinite]" />
                    </div>
                  </div>
                )}

                {/* STATUS OVERLAY */}
                {scanning && (
                  <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-md transition-all rounded-2xl ${
                    status === 'success' ? 'bg-emerald-500/10' : 
                    status === 'error' ? 'bg-red-500/10' : 'bg-blue-500/10'
                  }`}>
                    {status === 'success' && <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4 animate-bounce" />}
                    {status === 'error' && <XCircle className="w-16 h-16 text-red-500 mb-4 animate-shake" />}
                    
                    <div className="text-center px-6">
                      <p className={`font-bold text-lg mb-1 ${
                        status === 'success' ? 'text-emerald-400' : 
                        status === 'error' ? 'text-red-400' : 'text-blue-400'
                      }`}>
                      </p>
                      <p className="text-slate-300 text-sm font-medium">{message}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6">
                {!cameraOn ? (
                  <button
                    onClick={startScanner}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40"
                  >
                    <Camera size={18} />
                    Initialize Scanner
                  </button>
                ) : (
                  <button
                    onClick={stopScanner}
                    className="w-full bg-slate-800 hover:bg-red-900/40 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-900/50 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <CameraOff size={18} />
                    Terminate Session
                  </button>
                )}
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-800/50 rounded-2xl p-4 flex gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg shrink-0">
                <ShieldCheck className="text-blue-400" size={20} />
              </div>
              <p className="text-xs text-blue-200/70 leading-relaxed">
                Security verification is enabled. All scans are logged with timestamp and device ID for auditing purposes.
              </p>
            </div>
          </div>

          {/* RIGHT: HISTORY PANEL */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-md flex flex-col h-full">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
                  <History className="text-emerald-400" size={20} />
                  Entry Records
                </h2>
                <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">
                  {checkedList.length} Total
                </span>
              </div>

              <div className="flex-1 overflow-auto max-h-[600px]">
                {checkedList.length > 0 ? (
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-900/90 backdrop-blur text-slate-500 font-medium uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="px-6 py-4 border-b border-slate-800">Participant</th>
                        <th className="px-6 py-4 border-b border-slate-800">Timestamp</th>
                        <th className="px-6 py-4 border-b border-slate-800">Identity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {checkedList.map((entry, i) => (
                        <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                <UserCheck size={14} />
                              </div>
                              <span className="font-medium text-slate-200">{entry.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                            {entry.time}
                          </td>
                          <td className="px-6 py-4 font-mono text-slate-500 text-[10px]">
                            {entry.ticket.substring(0, 12)}...
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-20 flex flex-col items-center justify-center text-center opacity-50">
                    <History size={48} className="mb-4 text-slate-700" />
                    <p className="text-slate-500 max-w-xs">No entries recorded yet. Active scanning will populate this list automatically.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      

      <AccessModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        link={accessLink}
      />
    </div>
  );
}