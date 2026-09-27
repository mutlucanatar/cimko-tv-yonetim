import React, { useState, useRef } from "react";
import { Image as ImageIcon, Trash2, PlayCircle, Link as LinkIcon, Loader2 } from "lucide-react";
import { api } from "../api";
import { Header, Card, EmptyState, Btn, inputCls } from "../components/ui";

export default function MediaView({ store, reload }) {
  const [videoUrl, setVideoUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef();

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr("");
    setBusy(true);
    try {
      await api.media.upload(file);
      reload("media");
    } catch (e2) {
      setErr("Yükleme sırasında hata oluştu: " + e2.message);
    }
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const addVideoUrl = async () => {
    if (!videoUrl.trim()) return;
    await api.media.addLink({ url: videoUrl.trim() });
    setVideoUrl("");
    reload("media");
  };

  const remove = async (id) => {
    if (!window.confirm("Bu medya silinsin mi? Senaryolarda kullanılıyorsa oradan da kaldırın.")) return;
    await api.media.remove(id);
    reload("media");
  };

  return (
    <div>
      <Header title="Medyalar" subtitle="TV'lerde gösterilecek görsel ve videolar" />
      <Card>
        <div className="flex flex-wrap items-end gap-3 mb-5 pb-5 border-b border-gray-100">
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1.5">Görsel veya video dosyası yükle</div>
            <input ref={fileRef} type="file" accept="image/*,video/*" onChange={onFile} className="text-sm" />
          </div>
          <div className="flex-1 min-w-[240px]">
            <div className="text-sm font-medium text-gray-700 mb-1.5">veya video bağlantısı (URL) ekle</div>
            <div className="flex gap-2">
              <input
                className={inputCls}
                placeholder="https://.../video.mp4"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
              <Btn icon={LinkIcon} onClick={addVideoUrl} disabled={!videoUrl.trim()}>
                Ekle
              </Btn>
            </div>
          </div>
          {busy && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Loader2 size={13} className="animate-spin" /> yükleniyor...
            </span>
          )}
        </div>
        {err && <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mb-4">{err}</div>}
        {store.media.length === 0 ? (
          <EmptyState icon={ImageIcon} text="Henüz medya eklenmedi." />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {store.media.map((m) => (
              <div key={m.id} className="border border-gray-200 rounded-lg overflow-hidden group relative">
                <div className="aspect-video bg-gray-900 flex items-center justify-center">
                  {m.kind === "image" ? (
                    <img src={m.src} alt={m.name} className="w-full h-full object-cover" />
                  ) : (
                    <PlayCircle className="text-white/70" size={28} />
                  )}
                </div>
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-700 truncate" title={m.name}>
                    {m.name}
                  </div>
                  <div className="text-[11px] text-gray-400">
                    {m.kind === "image" ? `Görsel · ${m.duration_sec}sn` : "Video"}
                  </div>
                </div>
                <button
                  onClick={() => remove(m.id)}
                  className="absolute top-1.5 right-1.5 bg-black/50 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
