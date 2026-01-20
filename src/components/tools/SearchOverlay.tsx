"use client";

import { useEffect, useMemo, useRef, useState, ReactNode } from "react";
import { AnimatePresence, motion, Transition } from "framer-motion";
import Link from "next/link";
import { createPortal } from "react-dom";
import { Search } from "lucide-react";

type User = { id: string; name: string; username: string };
type Thought = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: { username: string } | null;
};

// Defining the transition with a specific Type to prevent errors
const CALM_TRANSITION: Transition = {
  type: "tween",
  ease: [0.23, 1, 0.32, 1],
  duration: 0.5,
};

type SearchOverlayProps = {
  renderTrigger?: (open: () => void) => ReactNode;
  isSidebar?: boolean;
  expanded?: boolean;
};

export function SearchOverlay({
  renderTrigger,
  isSidebar,
  expanded,
}: SearchOverlayProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  // Displayed data
  const [users, setUsers] = useState<User[]>([]);
  const [thoughts, setThoughts] = useState<Thought[]>([]);

  // Cache for initial random suggestions to show when query is empty
  const [initialSuggestions, setInitialSuggestions] = useState<{
    users: User[];
    thoughts: Thought[];
  } | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Initial fetch when opening
  useEffect(() => {
    if (open) {
      if (inputRef.current) {
        setTimeout(() => inputRef.current?.focus(), 50);
      }

      // If we don't have initial suggestions yet, fetch them
      if (!initialSuggestions) {
        import("@/app/actions/search").then(({ getRandomSuggestions }) => {
          getRandomSuggestions().then((data) => {
            setInitialSuggestions(data);
            // Only set if query is empty
            if (!query) {
              setUsers(data.users);
              setThoughts(data.thoughts);
            }
          });
        });
      } else if (!query) {
        // Restore initial if opening and no query
        setUsers(initialSuggestions.users);
        setThoughts(initialSuggestions.thoughts);
      }
    } else {
      setQuery("");
    }
  }, [open]);

  // Handle Query Change with Debounce
  useEffect(() => {
    const q = query.trim();

    if (!q) {
      if (initialSuggestions) {
        setUsers(initialSuggestions.users);
        setThoughts(initialSuggestions.thoughts);
      }
      return;
    }

    const handler = setTimeout(() => {
      import("@/app/actions/search").then(({ searchGlobal }) => {
        searchGlobal(q).then((data) => {
          setUsers(data.users);
          setThoughts(data.thoughts);
        });
      });
    }, 300); // 300ms debounce

    return () => clearTimeout(handler);
  }, [query, initialSuggestions]);

  const hasResults = users.length > 0 || thoughts.length > 0;
  const openOverlay = () => setOpen(true);

  return (
    <>
      {renderTrigger ? (
        renderTrigger(openOverlay)
      ) : isSidebar ? (
        <motion.div
          layout
          transition={CALM_TRANSITION}
          onClick={openOverlay}
          className={`
            flex items-center h-12 rounded-xl border border-white/5 bg-white/3 
            hover:bg-white/10 transition-colors cursor-pointer group overflow-hidden
            ${!expanded ? "w-12 justify-center" : "w-full px-0"}
          `}
        >
          <motion.div
            layout="position"
            className="w-12 h-12 flex items-center justify-center shrink-0"
          >
            <Search
              size={18}
              className="text-white/40 group-hover:text-white transition-colors"
            />
          </motion.div>

          <AnimatePresence mode="wait">
            {expanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-1 items-center justify-between pr-4 overflow-hidden whitespace-nowrap"
              >
                <span className="text-[13px] text-white/40 truncate">
                  Search users & thoughts…
                </span>
                <kbd className="hidden xl:inline-flex h-5 items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] text-white/40">
                  ⌘K
                </kbd>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : (
        <button
          type="button"
          onClick={openOverlay}
          className="group inline-flex w-full lg:w-auto items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-sm text-white/70 hover:bg-white/5 transition-colors cursor-pointer"
        >
          <span className="truncate">Search users & thoughts…</span>
          <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-black/20 px-2 py-0.5 text-[11px] text-white/60">
            ⌘ K
          </span>
        </button>
      )}

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                <motion.div
                  className="fixed inset-0 z-100 bg-black/55 backdrop-blur-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />

                <motion.div
                  className="fixed inset-0 z-110 flex items-start justify-center pt-20 px-4 sm:pt-24"
                  initial={{ opacity: 0, y: -10, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.99 }}
                  onClick={() => setOpen(false)}
                >
                  <div
                    className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f19] shadow-[0_20px_80px_rgba(0,0,0,0.6)] ring-1 ring-white/6 backdrop-blur-xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
                      <Search size={20} className="text-white/30" />
                      <input
                        ref={inputRef}
                        type="search"
                        placeholder="Search users or thoughts…"
                        className="w-full bg-transparent text-[15px] text-white/85 outline-none placeholder:text-white/35"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                      <button
                        onClick={() => setOpen(false)}
                        className="shrink-0 rounded-md px-2 py-1 text-[11px] text-white/55 hover:text-white/80 border border-white/10 bg-white/3 cursor-pointer"
                      >
                        Esc
                      </button>
                    </div>

                    <div className="search-scroll max-h-80 overflow-y-auto px-3 py-3 text-sm text-white/80">
                      {!hasResults && (
                        <div className="py-10 text-center text-xs text-white/45">
                          {query
                            ? `No results for “${query}”.`
                            : "No suggestions found."}
                        </div>
                      )}

                      {users.length > 0 && (
                        <div className="mb-4">
                          <div className="px-1 pb-2 text-[11px] font-medium uppercase tracking-wider text-white/40">
                            Users
                          </div>
                          <ul className="space-y-1">
                            {users.map((user) => (
                              <li key={user.id}>
                                <Link
                                  href={`/user/${user.username}`}
                                  onClick={() => setOpen(false)}
                                  className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 hover:bg-white/5 transition-colors cursor-pointer"
                                >
                                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 text-xs font-semibold text-white/75">
                                    {user.name[0]}
                                  </div>
                                  <div className="flex flex-col leading-tight">
                                    <span className="text-[14px] text-white/85">
                                      {user.name}
                                    </span>
                                    <span className="text-[12px] text-white/45">
                                      @{user.username}
                                    </span>
                                  </div>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {thoughts.length > 0 && (
                        <div>
                          <div className="px-1 pb-2 text-[11px] font-medium uppercase tracking-wider text-white/40">
                            Thoughts
                          </div>
                          <ul className="space-y-1">
                            {thoughts.map((thought) => (
                              <li key={thought.id}>
                                <Link
                                  href={`/user/${
                                    thought.profiles?.username || "anonymous"
                                  }`}
                                  onClick={() => setOpen(false)}
                                  className="flex w-full flex-col rounded-xl px-2.5 py-2 hover:bg-white/5 transition-colors cursor-pointer"
                                >
                                  <span className="text-[14px] text-white/85 line-clamp-1">
                                    {thought.content}
                                  </span>
                                  <span className="text-[12px] text-white/45">
                                    @{thought.profiles?.username || "anonymous"}
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
