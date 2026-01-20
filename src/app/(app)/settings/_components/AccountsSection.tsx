"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Pencil, Save, X } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useToastStore } from "@/hooks/use-toast-store";

export default function AccountSection() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  // File input ref
  const fileInputRef = useState<HTMLInputElement | null>(null); // We'll use a callback ref or just document.getElementById if needed, or better: useRef
  // Actually, let's use standard useRef
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("********");

  // Validation State
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    async function fetchUser() {
      const supabase = supabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
        setUsername(
          user.user_metadata?.username || user.email?.split("@")[0] || "User"
        );

        // Fetch profile for avatar
        const { data: profile } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", user.id)
          .single();

        if (profile?.avatar_url) {
          setAvatarUrl(profile.avatar_url);
        }
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  // ... (keeping validation effects same) ...

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      // Just log for now as requested
      console.log("File selected:", event.target.files[0]);
      // Ideally we would trigger upload here
    }
  };

  const triggerFileInput = () => {
    hiddenInputRef.current?.click();
  };

  // ... (rest of validation effects)

  // Username validation effect
  useEffect(() => {
    if (!editing) return;

    if (username.length < 3) {
      setUsernameAvailable(null);
      if (username.length > 0) {
        setUsernameError("Username must be at least 3 characters");
      } else {
        setUsernameError(null);
      }
      return;
    }

    const checkAvailability = async () => {
      setIsCheckingUsername(true);
      const supabase = supabaseBrowser();

      try {
        // Check if username is current user's username (no change)
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const currentUsername = user?.user_metadata?.username;

        if (currentUsername === username) {
          setUsernameAvailable(true);
          setUsernameError(null);
          setIsCheckingUsername(false);
          return;
        }

        const { data } = await supabase
          .from("profiles")
          .select("username")
          .eq("username", username.toLowerCase())
          .maybeSingle();

        if (data) {
          setUsernameAvailable(false);
          setUsernameError("Username is already taken");
        } else {
          setUsernameAvailable(true);
          setUsernameError(null);
        }
      } catch (error) {
        console.error("Error checking username:", error);
      } finally {
        setIsCheckingUsername(false);
      }
    };

    const debounce = setTimeout(checkAvailability, 500);
    return () => clearTimeout(debounce);
  }, [username, editing]);

  // Password validation effect
  useEffect(() => {
    if (!editing) {
      setPasswordError(null);
      return;
    }

    // If password is just the placeholder, it's valid (means no change)
    if (password === "********") {
      setPasswordError(null);
      return;
    }

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    // Check complexity: at least one letter and one number
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasLetter || !hasNumber) {
      setPasswordError("Password must contain at least 1 letter and 1 number");
      return;
    }

    setPasswordError(null);
  }, [password, editing]);

  const copyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    addToast("Email copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdate = async () => {
    // Final validation check
    if (usernameError || passwordError) {
      addToast("Please fix the errors before saving", "error");
      return;
    }

    // If checking is still in progress
    if (isCheckingUsername) {
      addToast("Please wait for validation to complete", "error");
      return;
    }

    try {
      const supabase = supabaseBrowser();
      const updates: { password?: string; data?: { username: string } } = {};

      // Update username if changed
      updates.data = { username: username };

      // Update password only if changed from placeholder
      if (password !== "********") {
        updates.password = password;
      }

      // 1. Update Auth User (Metadata + Password)
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.updateUser(updates);
      if (authError) throw authError;

      // 2. Update Public Profile (Sync Username)
      if (user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ username: username })
          .eq("id", user.id);

        if (profileError) throw profileError;
      }

      addToast("Profile updated successfully", "success");
      setEditing(false);
    } catch (error: any) {
      addToast(error.message || "Update failed", "error");
    }
  };

  if (loading)
    return (
      <div className="text-white/20 animate-pulse text-sm">
        Loading profile...
      </div>
    );

  const canSave =
    editing && !isCheckingUsername && !usernameError && !passwordError;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl space-y-8"
    >
      {/* PHOTO SECTION */}
      <section className="flex items-center gap-6">
        <input
          type="file"
          ref={hiddenInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept=".png, .jpeg, .jpg"
        />
        <div className="relative group">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-white/40 group-hover:text-white/80 transition-colors">
                {username.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <button
            onClick={triggerFileInput}
            type="button"
            className="absolute -bottom-2 -right-2 z-10 p-1.5 rounded-lg bg-[#030712] border border-white/10 text-white/40 hover:text-white transition-all shadow-xl cursor-pointer hover:scale-110 active:scale-95"
          >
            <Pencil size={14} />
          </button>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white/90">Your Photo</h3>
          <p className="text-xs text-white/40 mt-1">
            This will be displayed on your profile and thoughts.
          </p>
        </div>
      </section>

      {/* INPUTS SECTION */}
      <div className="space-y-6">
        {/* USERNAME */}
        <div className="space-y-2">
          <div className="flex justify-between items-center ml-1">
            <label className="text-[11px] font-bold uppercase tracking-widest text-white/30">
              Username
            </label>
            {editing && (
              <div className="h-4 flex items-center">
                {isCheckingUsername ? (
                  <span className="text-[10px] text-white/40 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full border border-white/20 border-t-white animate-spin" />{" "}
                    checking...
                  </span>
                ) : usernameError ? (
                  <span className="text-[10px] font-medium text-red-400 animate-in fade-in slide-in-from-right-1">
                    ● {usernameError}
                  </span>
                ) : usernameAvailable ? (
                  <span className="text-[10px] font-medium text-emerald-400 animate-in fade-in slide-in-from-right-1">
                    ● username available
                  </span>
                ) : null}
              </div>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              disabled={!editing}
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")
                )
              }
              className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm transition-all focus:outline-none 
                ${
                  !editing
                    ? "text-white/40 border-white/5 cursor-not-allowed"
                    : usernameError
                    ? "text-white border-red-500/40 focus:border-red-500/60"
                    : usernameAvailable
                    ? "text-white border-emerald-500/40 focus:border-emerald-500/60"
                    : "text-white border-white/5 focus:border-white/10"
                }`}
            />
          </div>
        </div>

        {/* EMAIL */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-widest text-white/30 ml-1">
            Email Address
          </label>
          <div className="relative">
            <input
              type="text"
              disabled
              value={email}
              className="w-full bg-white/1 border border-white/5 rounded-xl px-4 py-3 text-sm text-white/20 cursor-not-allowed"
            />
            <button
              onClick={copyEmail}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white/20 hover:text-white/60 transition-colors"
            >
              {copied ? (
                <Check size={16} className="text-emerald-500" />
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>
        </div>

        {/* PASSWORD */}
        <div className="space-y-2">
          <div className="flex justify-between items-center ml-1">
            <label className="text-[11px] font-bold uppercase tracking-widest text-white/30">
              Password
            </label>
            {editing && password !== "********" && (
              <div className="h-4 flex items-center">
                {passwordError ? (
                  <span className="text-[10px] font-medium text-red-400 animate-in fade-in slide-in-from-right-1">
                    ● {passwordError}
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-emerald-400 animate-in fade-in slide-in-from-right-1">
                    ● secure password
                  </span>
                )}
              </div>
            )}
          </div>
          <input
            type="password"
            disabled={!editing}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm transition-all focus:outline-none
              ${
                !editing
                  ? "text-white/20 cursor-not-allowed"
                  : passwordError
                  ? "text-white border-red-500/40 focus:border-red-500/60"
                  : "text-white focus:border-white/10"
              }`}
          />
        </div>
      </div>

      {/* BUTTONS */}
      <div className="flex justify-end gap-3 pt-4">
        {!editing ? (
          <button
            onClick={() => {
              setEditing(true);
              // Reset errors when entering edit mode
              setUsernameError(null);
              setPasswordError(null);
            }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-white/70 hover:bg-white/10 hover:text-white transition-all shadow-lg"
          >
            Edit Profile
          </button>
        ) : (
          <>
            <button
              onClick={() => {
                setEditing(false);
                setPassword("********"); // Reset password field
                // Could also reset username if we tracked initial value separately
              }}
              // Navbar 'Log In' Style: Transparent bg, border text-secondary, hover effects
              className="cursor-pointer inline-flex items-center justify-center
                px-5 py-2.5
                text-[11px] font-semibold uppercase tracking-wider
                bg-transparent
                text-white/60
                border border-transparent
                hover:text-white
                hover:border-white/20
                hover:bg-white/5
                hover:-translate-y-0.5
                transition-all duration-200 ease-out
                rounded-xl"
            >
              Cancel
            </button>

            <button
              onClick={handleUpdate}
              disabled={!canSave}
              // Hero 'Get Started' Style: Radial gradient, glow shadow
              className={`cursor-pointer relative inline-flex items-center justify-center gap-2
                       px-8 py-3 text-[11px] font-semibold uppercase tracking-wider
                       text-white border border-borderc-accent
                       bg-[radial-gradient(circle_at_top,var(--accent-primary),#0284C7)]
                       shadow-[0_0_0_0_rgba(56,189,248,0)]
                       hover:shadow-[0_0_30px_2px_rgba(56,189,248,0.35)]
                       hover:brightness-110
                       transition-all duration-200 ease-out rounded-md
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none
                       ${!canSave ? "grayscale" : ""}`}
            >
              <Save size={14} />
              Save Changes
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
