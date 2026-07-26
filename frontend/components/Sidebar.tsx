import Link from "next/link";

const NAV_ITEMS = [
  { label: "Home", icon: "⌂" },
  { label: "Notetaker", icon: "◈" },
  { label: "Analytics", icon: "▤" },
  { label: "Integrations", icon: "⬡" },
  { label: "Settings", icon: "⚙" },
];

export default function Sidebar() {
  return (
    <aside className="w-60 shrink-0 bg-navy-950 text-white/80 h-screen sticky top-0 flex flex-col">
      <div className="px-5 py-6 flex items-center gap-2">
        <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center text-sm font-bold text-white">
          F
        </div>
        <span className="font-semibold text-white tracking-tight">Fireflies</span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item, i) => (
          <Link
            key={item.label}
            href={item.label === "Home" ? "/" : "#"}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              i === 0
                ? "bg-navy-800 text-white font-medium"
                : "hover:bg-navy-800/60 text-white/60 hover:text-white/90"
            }`}
          >
            <span className="w-4 text-center">{item.icon}</span>
            {item.label}
            {i > 0 && (
              <span className="ml-auto text-[10px] uppercase tracking-wide text-white/30">soon</span>
            )}
          </Link>
        ))}
      </nav>

      <div className="px-3 pb-5 pt-3 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-navy-800/60 cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-accent-light flex items-center justify-center text-xs font-semibold text-navy-950">
            RS
          </div>
          <div className="leading-tight">
            <p className="text-sm text-white/90">Ritika Sharma</p>
            <p className="text-xs text-white/40">Default user</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
