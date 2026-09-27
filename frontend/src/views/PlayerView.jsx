import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Header, Card, IconBtn, inputCls, RED, today } from "../components/ui";

export default function PlayerView({ store }) {
  const [deviceId, setDeviceId] = useState(store.devices[0]?.id || "");
  const [idx, setIdx] = useState(0);
  const device = store.devices.find((d) => d.id === deviceId);
  const scenario = device && store.scenarios.find((s) => s.id === device.scenario_id);

  const activeItems = (scenario?.items || []).filter((it) => {
    const t = today();
    return (!it.startDate || it.startDate <= t) && (!it.endDate || it.endDate >= t);
  });
  const current = activeItems[idx % (activeItems.length || 1)];
  const currentMedia = current && store.media.find((m) => m.id === current.mediaId);

  useEffect(() => setIdx(0), [deviceId]);

  useEffect(() => {
    if (!currentMedia || currentMedia.kind !== "image" || activeItems.length < 2) return;
    const secs = current.durationSec ?? currentMedia.duration_sec ?? 8;
    const t = setTimeout(() => setIdx((i) => i + 1), secs * 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, currentMedia, activeItems.length]);

  const branch = device && store.branches.find((b) => b.id === device.branch_id);
  const menuToday = store.foodMenus.find(
    (m) =>
      m.date === today() &&
      (!m.tags?.length ||
        !branch ||
        m.tags.some((t) => branch.name.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(branch.name.toLowerCase())))
  );

  return (
    <div>
      <Header title="TV Önizleme" subtitle="Bir cihaz seçin ve o ekranda şu an ne oynatıldığını görün" />
      <Card>
        <div className="mb-4 max-w-xs">
          <select className={inputCls} value={deviceId} onChange={(e) => setDeviceId(e.target.value)}>
            {store.devices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title}
              </option>
            ))}
          </select>
        </div>
        <div className="aspect-video w-full max-w-3xl rounded-lg overflow-hidden relative" style={{ backgroundColor: "#000" }}>
          {!device && <CenterMsg text="Cihaz seçin" />}
          {device && !scenario && <CenterMsg text="Bu cihaza atanmış bir senaryo yok" />}
          {device && scenario && activeItems.length === 0 && <CenterMsg text="Bu senaryoda bugün için aktif içerik yok" />}
          {currentMedia &&
            (currentMedia.kind === "image" ? (
              <img src={currentMedia.src} className="w-full h-full object-contain" />
            ) : (
              <video src={currentMedia.src} className="w-full h-full object-contain" controls autoPlay muted loop />
            ))}
          {menuToday && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-4 py-2 flex flex-wrap gap-3">
              <span className="font-semibold" style={{ color: RED }}>
                Bugünün Menüsü:
              </span>
              {menuToday.foods.map((f, i) => (
                <span key={i}>{f.name}</span>
              ))}
            </div>
          )}
        </div>
        {activeItems.length > 1 && (
          <div className="flex items-center gap-2 mt-3">
            <IconBtn icon={ChevronLeft} onClick={() => setIdx((i) => i - 1)} title="Önceki" />
            <span className="text-xs text-gray-500">
              {(idx % activeItems.length) + 1} / {activeItems.length}
            </span>
            <IconBtn icon={ChevronRight} onClick={() => setIdx((i) => i + 1)} title="Sonraki" />
          </div>
        )}
      </Card>
    </div>
  );
}

function CenterMsg({ text }) {
  return <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">{text}</div>;
}
