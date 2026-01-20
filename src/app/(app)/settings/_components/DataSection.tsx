"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Download,
  EyeOff,
  ShieldAlert,
  Trash2,
  FileJson,
  Database,
  Check,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useToastStore } from "@/hooks/use-toast-store";
import { useRouter } from "next/navigation";

export default function DataSection() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteType, setDeleteType] = useState<"history" | "account" | null>(
    null
  );
  const [privacyMode, setPrivacyMode] = useState(false);
  const [exporting, setExporting] = useState(false);
  const addToast = useToastStore((state) => state.addToast);
  const router = useRouter();
  const [confirmationInput, setConfirmationInput] = useState("");

  function ModuleToggle({
    label,
    description,
    storageKey,
    userInfo,
  }: {
    label: string;
    description: string;
    storageKey: string;
    userInfo?: string;
  }) {
    // We default to true. Note: in useEffect we'd properly sync.
    // For simple UI toggle, we'll use a local state initialized from localStorage.
    const [enabled, setEnabled] = useState(true);

    useEffect(() => {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) {
        setEnabled(stored === "true");
      }
    }, [storageKey]);

    const toggle = () => {
      const newVal = !enabled;
      setEnabled(newVal);
      localStorage.setItem(storageKey, String(newVal));
      addToast(
        `${label} ${newVal ? "Enabled" : "Disabled"} (Refresh Feed to Apply)`,
        "success"
      );
    };

    return (
      <div
        onClick={toggle}
        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
          enabled
            ? "bg-white/5 border-white/10 hover:bg-white/10"
            : "bg-transparent border-white/5 opacity-50 hover:opacity-80"
        }`}
      >
        <div>
          <h4 className="text-xs font-bold text-white/90">{label}</h4>
          <p className="text-[10px] text-white/40 mt-0.5">{description}</p>
        </div>
        <div
          className={`w-8 h-4 rounded-full relative transition-colors ${
            enabled ? "bg-white" : "bg-white/10"
          }`}
        >
          <motion.div
            animate={{ x: enabled ? 18 : 2 }}
            className={`absolute top-0.5 w-3 h-3 rounded-full ${
              enabled ? "bg-[#030712]" : "bg-white/20"
            }`}
          />
        </div>
      </div>
    );
  }
  useEffect(() => {
    // Load privacy mode from local storage
    const savedPrivacy = localStorage.getItem("ventora_privacy_mode");
    if (savedPrivacy) {
      setPrivacyMode(savedPrivacy === "true");
    }
  }, []);

  const togglePrivacy = () => {
    const newMode = !privacyMode;
    setPrivacyMode(newMode);
    localStorage.setItem("ventora_privacy_mode", String(newMode));
    addToast(`Privacy Mode ${newMode ? "Enabled" : "Disabled"}`, "success");
  };

  const handleExport = async () => {
    setExporting(true);
    const supabase = supabaseBrowser();
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Fetch all user data
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      const { data: entries } = await supabase
        .from("entries")
        .select("*")
        .eq("user_id", user.id);
      // Add other tables if necessary

      const exportData = {
        user: {
          id: user.id,
          email: user.email,
          ...profile,
        },
        entries: entries || [],
        timestamp: new Date().toISOString(),
      };

      // Create blob and download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ventora-export-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addToast("Data exported successfully", "success");
    } catch (error: any) {
      console.error("Export error:", error);
      addToast("Failed to export data", "error");
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteType) return;

    const supabase = supabaseBrowser();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      if (deleteType === "history") {
        // Delete from 'journals'
        const { error: journalsError } = await supabase
          .from("journals")
          .delete()
          .eq("user_id", user.id);
        if (journalsError) throw journalsError;

        // Delete from 'thoughts'
        const { error: thoughtsError } = await supabase
          .from("thoughts")
          .delete()
          .eq("user_id", user.id);
        if (thoughtsError) throw thoughtsError;

        addToast("Journal & Thought history wiped successfully", "success");
      } else if (deleteType === "account") {
        // Note: Deleting the user from auth usually requires admin/service role or edge function.
        // For now, we'll clear data and sign out. In a real app, call an edge function.

        // Delete journals
        await supabase.from("journals").delete().eq("user_id", user.id);
        // Delete thoughts
        await supabase.from("thoughts").delete().eq("user_id", user.id);
        // Delete profile
        await supabase.from("profiles").delete().eq("id", user.id);

        // Sign out
        await supabase.auth.signOut();
        router.push("/login");
        addToast("Account deleted", "success");
      }
    } catch (error: any) {
      console.error("Delete error:", error);
      addToast("Failed to delete data: " + error.message, "error");
    } finally {
      setShowDeleteConfirm(false);
      setDeleteType(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl space-y-10"
    >
      {/* 1. FEED CUSTOMIZATION (MODULES) */}
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white/90 uppercase tracking-widest text-[11px]">
            Feed Customization
          </h3>
          <p className="text-xs text-white/40 mt-1">
            Toggle modules to customize your feed experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ModuleToggle
            label="Sidebar Insights"
            description="Calendar and charts on the right"
            storageKey="ventora_module_sidebar"
            userInfo="This hides the Calendar/Charts panel."
          />
        </div>
      </section>

      {/* 2. DATA PORTABILITY */}
      <section className="space-y-4 pt-6 border-t border-white/5">
        <div>
          <h3 className="text-sm font-semibold text-white/90 uppercase tracking-widest text-[11px]">
            Data Portability
          </h3>
          <p className="text-xs text-white/40 mt-1">
            Export your life. Your data belongs to you.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* STANDARD - JSON */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-white/5 text-white/60">
                <FileJson size={20} />
              </div>
              <div>
                <span className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white/90">
                    Standard Export
                  </h4>
                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-bold text-white/50 uppercase tracking-wide">
                    Free
                  </span>
                </span>
                <p className="text-[10px] text-white/40 mt-0.5">
                  Raw JSON format. Best for backups.
                </p>
              </div>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="text-white/40 hover:text-white transition-colors disabled:opacity-50"
            >
              <Download size={18} />
            </button>
          </div>

          {/* PRO - PDF / Excel */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between group opacity-60">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-white/5 text-accent-primary/60">
                <Database size={20} />
              </div>
              <div>
                <span className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white/90">
                    Smart Export
                  </h4>
                  <span className="px-1.5 py-0.5 rounded bg-accent-primary/20 text-[9px] font-bold text-accent-primary uppercase tracking-wide border border-accent-primary/20">
                    Pro
                  </span>
                </span>
                <p className="text-[10px] text-white/40 mt-0.5">
                  Beautiful PDF Book & Organized Excel.
                </p>
              </div>
            </div>
            <button
              disabled
              className="text-white/20 cursor-not-allowed flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </section>

      {/* 3. DANGER ZONE */}
      <section className="space-y-4 pt-10 border-t border-red-500/20">
        <div className="flex items-center gap-2 text-red-500/50 mb-2">
          <ShieldAlert size={14} />
          <h3 className="text-[11px] font-bold uppercase tracking-widest">
            Danger Zone
          </h3>
        </div>

        <div className="p-6 rounded-2xl border border-red-500/10 bg-red-500/2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/90">
                Wipe Journal History
              </p>
              <p className="text-[10px] text-white/30 mt-1">
                A "Soft Reset". Deletes only your entries to give you a clean
                slate.
              </p>
            </div>
            <button
              onClick={() => {
                setDeleteType("history");
                setShowDeleteConfirm(true);
                setConfirmationInput("");
              }}
              className="px-4 py-2 rounded-lg border border-white/5 text-white/40 text-[10px] font-bold uppercase hover:bg-white/5 transition-all"
            >
              Reset Data
            </button>
          </div>

          <div className="pt-6 border-t border-white/5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/90">
                Delete Account
              </p>
              <p className="text-[10px] text-white/30 mt-1">
                Permanently erase everything including your profile.
              </p>
            </div>
            <button
              onClick={() => {
                setDeleteType("account");
                setShowDeleteConfirm(true);
                setConfirmationInput("");
              }}
              className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 text-[10px] font-bold uppercase hover:bg-red-500/20 transition-all border border-red-500/10"
            >
              Delete
            </button>
          </div>
        </div>
      </section>

      {/* MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#030712] border border-white/10 p-8 rounded-3xl max-w-sm w-full text-center space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-white">
                {deleteType === "account" ? "Delete Account?" : "Soft Reset?"}
              </h4>
              <p className="text-xs text-white/40 leading-relaxed">
                {deleteType === "account"
                  ? "This will delete your profile, all journals, and all thought history. This action is final."
                  : "This will remove ALL rows from your journals and thoughts tables. Your profile settings will remain."}
              </p>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider ml-1">
                Type "PURGE" to confirm
              </label>
              <input
                type="text"
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                placeholder="PURGE"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-red-500/50 transition-colors uppercase"
              />
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                className="w-full py-3 bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleDelete}
                disabled={confirmationInput !== "PURGE"}
              >
                {deleteType === "account" ? "Delete Forever" : "Wipe Data"}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteType(null);
                }}
                className="w-full py-3 text-white/40 text-xs font-bold uppercase tracking-widest hover:text-white transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
