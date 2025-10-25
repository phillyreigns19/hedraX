// src/screens/sections/NavigationSection.tsx
import React from "react";
import { SearchIcon } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { useHederaWallet } from "../../../../hedera/useHederaWallet";
import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Marketplace", to: "/marketplace" }, // ← route path
  { label: "Launchpad",   to: "/launchpad"   },
  { label: "Create",      to: "/create"      },
  { label: "Swap",        to: "/swap"        },
];

function shortId(id?: string | null) {
  if (!id) return "";
  return id.length > 14 ? `${id.slice(0, 6)}…${id.slice(-6)}` : id;
}

export const NavigationSection = (): JSX.Element => {
  const { status, accountId, connect, disconnect } = useHederaWallet() as any;
  const [menuOpen, setMenuOpen] = React.useState(false);
  const rowRef = React.useRef<HTMLDivElement | null>(null);
  const connectingRef = React.useRef(false);

  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rowRef.current) return;
      if (!rowRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  async function handleLoginClick() {
    if (accountId) { setMenuOpen(v => !v); return; }
    if (connectingRef.current || status === "initializing" || status === "connecting") return;
    connectingRef.current = true;
    try { await connect(); } finally { setTimeout(() => (connectingRef.current = false), 300); }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-20 h-20 bg-[#0d0d0d30] backdrop-blur-[10px] [-webkit-backdrop-filter:blur(10px)_brightness(100%)] translate-y-[-1rem] animate-fade-in opacity-0">
      <img
        className="w-[90px] h-[22px] object-cover"
        alt="Hedraxlogo"
        src="https://c.animaapp.com/mh588waf3IvYis/img/hedraxlogo-2-1.png"
      />

      <nav className="flex items-center gap-5 opacity-0 animate-fade-in [--animation-delay:200ms]">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `[font-family:'Gilroy-SemiBold-SemiBold',Helvetica] font-semibold text-base tracking-[-0.32px] leading-[normal] cursor-pointer transition-colors ${
                isActive ? "text-[#d5d7e3]" : "text-[#d5d7e38c] hover:text-[#d5d7e3]"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="relative w-[526px] opacity-0 animate-fade-in [--animation-delay:400ms]">
        <Input
          type="text"
          placeholder="Search collections, tokens and creators"
          className="w-full h-[50px] px-4 py-[13px] rounded-[18px] border border-[#d4d8e36e] bg-transparent text-white placeholder:text-white/50 pr-12"
        />
        <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/50" />
      </div>

      <div className="relative opacity-0 animate-fade-in [--animation-delay:600ms]" ref={rowRef}>
        <Button
          onClick={handleLoginClick}
          className="w-[140px] h-[43px] bg-[#d5d7e3] hover:bg-[#e5e7f3] rounded-[18px] [font-family:'Gilroy-Medium-Medium',Helvetica] font-medium text-[#0d0d0d] text-base"
          title={status === "initializing" ? "Initializing wallet…" : status === "connecting" ? "Check HashPack…" : undefined}
          disabled={status === "initializing" || status === "connecting"}
        >
          {accountId ? shortId(accountId) : "Log in"}
        </Button>

        {accountId && menuOpen && (
          <div role="menu" className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-[#111]/90 backdrop-blur p-3 text-sm text-white shadow-xl z-[120]">
            <div className="mb-2 opacity-70">Connected</div>
            <div className="mb-3 break-all rounded-lg bg-white/5 p-2 font-mono text-xs">{accountId}</div>
            <button
              className="w-full rounded-lg bg-white/10 hover:bg-white/15 py-2"
              onClick={async () => { try { await disconnect?.(); } finally { setMenuOpen(false); } }}
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
