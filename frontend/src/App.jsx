import React, { useState, useEffect, useCallback } from "react";
import {
  Monitor, Building2, Users2, Clock, Image as ImageIcon, ListVideo, UtensilsCrossed, Tv, Loader2,
} from "lucide-react";
import { api } from "./api";
import { NAVY, NAVY_DARK, RED } from "./components/ui";

import DevicesView from "./views/DevicesView";
import BranchesView from "./views/BranchesView";
import GroupsView from "./views/GroupsView";
import RulesView from "./views/RulesView";
import MediaView from "./views/MediaView";
import ScenariosView from "./views/ScenariosView";
import FoodMenusView from "./views/FoodMenusView";
import PlayerView from "./views/PlayerView";

const NAV = [
  { key: "devices", label: "Cihazlar", icon: Monitor },
  { key: "branches", label: "Şubeler", icon: Building2 },
  { key: "groups", label: "Gruplar", icon: Users2 },
  { key: "rules", label: "Kurallar", icon: Clock },
  { key: "media", label: "Medyalar", icon: ImageIcon },
  { key: "scenarios", label: "Senaryolar", icon: ListVideo },
  { key: "foodMenus", label: "Yemek Menüleri", icon: UtensilsCrossed },
  { key: "player", label: "TV Önizleme", icon: Tv },
];

const LOADERS = {
  branches: api.branches.list,
  groups: api.groups.list,
  devices: api.devices.list,
  media: api.media.list,
  scenarios: api.scenarios.list,
  rules: api.rules.list,
  foodMenus: api.foodMenus.list,
};

export default function App() {
  const [view, setView] = useState("devices");
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAll = useCallback(async () => {
    try {
      const keys = Object.keys(LOADERS);
      const results = await Promise.all(keys.map((k) => LOADERS[k]()));
      const next = {};
      keys.forEach((k, i) => (next[k] = results[i]));
      setStore(next);
      setError("");
    } catch (e) {
      setError("Sunucuya bağlanılamadı. Backend çalışıyor mu? (npm run dev:backend)");
    }
    setLoading(false);
  }, []);

  const reload = useCallback(async (which) => {
    try {
      const data = await LOADERS[which]();
      setStore((prev) => ({ ...prev, [which]: data }));
    } catch (e) {
      setError("Veri yenilenemedi: " + e.message);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: "#F4F5F9" }}>
        <Loader2 className="animate-spin text-gray-400" size={28} />
      </div>
    );
  }

  if (error && !store) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: "#F4F5F9" }}>
        <div className="text-center text-gray-600 max-w-sm">
          <p className="font-medium mb-1">Bağlantı hatası</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-56 shrink-0 flex flex-col text-gray-300" style={{ backgroundColor: NAVY_DARK }}>
        <div className="px-5 py-5 flex items-center gap-2 border-b border-white/10">
          <div className="w-8 h-8 rounded flex items-center justify-center font-bold text-white text-sm" style={{ backgroundColor: RED }}>
            Ç
          </div>
          <div>
            <div className="text-white font-semibold text-sm leading-tight">Çimko</div>
            <div className="text-[11px] text-gray-400 leading-tight">Ekran Yönetimi</div>
          </div>
        </div>
        <nav className="flex-1 py-3">
          {NAV.map((n) => {
            const active = view === n.key;
            const Icon = n.icon;
            return (
              <button
                key={n.key}
                onClick={() => setView(n.key)}
                className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-left transition-colors"
                style={active ? { backgroundColor: "rgba(255,255,255,0.08)", color: "#fff", borderRight: `3px solid ${RED}` } : {}}
              >
                <Icon size={17} className={active ? "" : "text-gray-400"} />
                {n.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: "#F4F5F9" }}>
        {error && <div className="bg-amber-50 text-amber-700 text-xs px-5 py-2 border-b border-amber-200">{error}</div>}
        <div className="flex-1 overflow-y-auto p-6">
          {view === "devices" && <DevicesView store={store} reload={reload} />}
          {view === "branches" && <BranchesView store={store} reload={reload} />}
          {view === "groups" && <GroupsView store={store} reload={reload} />}
          {view === "rules" && <RulesView store={store} reload={reload} />}
          {view === "media" && <MediaView store={store} reload={reload} />}
          {view === "scenarios" && <ScenariosView store={store} reload={reload} />}
          {view === "foodMenus" && <FoodMenusView store={store} reload={reload} />}
          {view === "player" && <PlayerView store={store} />}
        </div>
      </div>
    </div>
  );
}
