export default function Topbar() {
  return (
    <header className="sticky top-0 z-40 bg-white/60 backdrop-blur-xl flex justify-between items-center px-8 h-16 w-full shadow-sm">

      {/* Search */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
            search
          </span>
          <input
            className="w-full bg-surface-container-low border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 placeholder:text-outline-variant"
            placeholder="Global search cases, documents, or agents..."
            type="text"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-tertiary-fixed-dim transition-colors">
            <span className="material-symbols-outlined icon-fill">colors_spark</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
            <span className="material-symbols-outlined">help</span>
          </button>
        </div>

        <div className="h-8 w-[1px] bg-outline-variant/30" />

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold text-blue-950">Marcus Chen</p>
            <p className="text-[10px] text-slate-500 font-medium">Head of Operations</p>
          </div>
          <img
            alt="Consultant Profile"
            className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlD5kfAAIkHYHxm0FhR_1cFNy5WPSVRcmVhcQXMKlLlxLvPdBxNfwt1w4Zw2fI2TY96VHkuYDUchWp-rmIVilhWXMz9D2AxvA8JCZJcUZz22-AQQW2xp_ERfyQL5Qz3kN5voHVhzCAJFBJfKUKDxg9g3ZByDJ41AuqLJNOzvxAgr3a0J5gZK7a8QJPjrSOtNnfhhN79X8sgVDqdKgsZ1yosOhRpAwNczfbdc_FRCGsjmnsRWA28xgVld7A-nBJHbY0AfL44HHXIdw"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextSibling.style.display = "flex";
            }}
          />
          <div className="w-10 h-10 rounded-full bg-primary items-center justify-center text-white font-bold text-sm border-2 border-white shadow-sm select-none" style={{ display: "none" }}>
            MC
          </div>
        </div>
      </div>
    </header>
  );
}
