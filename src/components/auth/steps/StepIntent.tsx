"use client";

import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

type Props = {
  username: string;
  setUsername: (v: string) => void;
  displayName: string;
  setDisplayName: (v: string) => void;
  intent: string;
  setIntent: (v: string) => void;
  onPrev: () => void;
  onNext: () => void;
};

const fieldClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[14px] text-white/85 " +
  "outline-none placeholder:text-white/35 " +
  "focus:border-white/20 focus:ring-1 focus:ring-white/10 transition";

const secondaryBtnClass =
  "flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[14px] text-white/85 " +
  "hover:bg-white/[0.06] transition-colors";

const primaryBtnClass =
  "flex-1 rounded-xl bg-white/10 px-4 py-3 text-[14px] text-white/85 " +
  "hover:bg-white/15 transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

export default function StepIntent({ 
  username, setUsername, 
  displayName, setDisplayName, 
  intent, setIntent, 
  onPrev, onNext 
}: Props) {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    // Only check if username is 3+ characters
    if (username.length < 3) {
      setIsAvailable(null);
      return;
    }

    const checkAvailability = async () => {
      setIsChecking(true);
      const supabase = supabaseBrowser();
      
      // Look for the username in the profiles table
      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username.toLowerCase())
        .maybeSingle();

      // If no data is found, the username is available
      setIsAvailable(!data);
      setIsChecking(false);
    };

    const debounce = setTimeout(checkAvailability, 500);
    return () => clearTimeout(debounce);
  }, [username]);

  const canContinue = 
    displayName.trim().length > 0 && 
    username.trim().length >= 3 && 
    isAvailable === true && 
    !isChecking;

  return (
    <div className="space-y-5">
      <div>
        <div className="text-[14px] font-medium text-white/85">
          Step 2 — Set up your identity
        </div>
        <div className="mt-1 text-xs text-white/45">
          Choose how you'll appear on Ventura.
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Display Name Input */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-widest text-white/30 ml-1">Display Name</label>
          <input
            className={fieldClass}
            placeholder="e.g. Shpend"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        {/* Username Input with @ Prefix and Availability Status */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center ml-1">
            <label className="text-[10px] uppercase tracking-widest text-white/30">Username</label>
            {/* Real-time Availability Message */}
            {username.length >= 3 && !isChecking && (
              <span className={`text-[10px] font-medium animate-in fade-in slide-in-from-right-1 duration-300 ${isAvailable ? 'text-emerald-400' : 'text-red-400'}`}>
                {isAvailable ? '● username available' : '● username taken'}
              </span>
            )}
          </div>
          
          <div className="relative group">
            {/* Visual @ Prefix */}
            <span className={`absolute left-4 top-3.5 text-[14px] transition-colors ${username ? 'text-white/60' : 'text-white/20'}`}>
              @
            </span>
            <input
              className={`${fieldClass} pl-8 
                ${isAvailable === false ? 'border-red-500/40 focus:border-red-500/60' : ''} 
                ${isAvailable === true ? 'border-emerald-500/40 focus:border-emerald-500/60' : ''}
              `}
              placeholder="username"
              value={username}
              // Prevent spaces and special characters, force lowercase
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
            />
            
            {/* Loading Spinner during Supabase check */}
            {isChecking && (
              <div className="absolute right-3 top-3.5 h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-white/60" />
            )}
          </div>
        </div>
      </div>

      {/* Intent Input */}
      <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-widest text-white/30 ml-1">What brought you here?</label>
        <textarea
          className={`${fieldClass} min-h-[100px] resize-none`}
          placeholder="e.g. Overthinking at night..."
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <button type="button" onClick={onPrev} className={secondaryBtnClass}>
          Prev
        </button>
        <button 
          type="button" 
          onClick={onNext} 
          disabled={!canContinue}
          className={primaryBtnClass}
        >
          {isChecking ? "Checking..." : "Next"}
        </button>
      </div>
    </div>
  );
}