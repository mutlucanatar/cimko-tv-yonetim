import React, { useState } from "react";
import { ListVideo, Plus, Pencil, Trash2, Save, ChevronUp, ChevronDown, PlayCircle } from "lucide-react";
import { api } from "../api";
import { Header, Card, Table, EmptyState, IconBtn, Btn, Field, inputCls, today } from "../components/ui";

export default function ScenariosView({ store, reload }) {
  const [editing, setEditing] = useState(null);

  const save = async (scn) => {
    if (scn.id) await api.scenarios.update(scn.id, scn);
    else await api.scenarios.create(scn);
    setEditing(null);
    reload("scenarios");
    reload("devices");
  };
  const remove = async (id) => {
    if (!window.confirm("Bu senaryo silinsin mi?")) return;
    await api.scenarios.remove(id);
    reload("scenarios");
    reload("devices");
  };
  const deviceNames = (ids) =>
    store.devices.filter((d) => ids.includes(d.id)).map((d) => d.title).join(", ") || "-";

  if (editing) {
    return (
      <ScenarioEditor
        initial={editing}
        devices={store.devices}
        media={store.media}
        onCancel={() => setEditing(null)}
        onSave={save}
      />
    );
  }

  return (
    <div>
      <Header
        title="Senaryolar"
        subtitle="Oynatma listeleri — medyaları sıraya koyun ve cihazlara atayın"
        action={<Btn icon={Plus} onClick={() => setEditing({ items: [], deviceIds: [] })}>Yeni Senaryo</Btn>}
      />
      <Card>
        {store.scenarios.length === 0 ? (
          <EmptyState icon={ListVideo} text="Henüz senaryo (oynatma listesi) eklenmedi." />
        ) : (
          <Table cols={["Başlık", "İçerik Sayısı", "Cihazlar", ""]}>
            {store.scenarios.map((s) => (
              <tr key={s.id} className="border-t border-gray-100">
                <td className="py-3 px-4 font-medium text-gray-800">{s.title}</td>
                <td className="py-3 px-4 text-gray-600">{s.items.length} içerik</td>
                <td className="py-3 px-4 text-gray-600">{deviceNames(s.deviceIds || [])}</td>
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <IconBtn icon={Pencil} onClick={() => setEditing(s)} title="Düzenle" />
                  <IconBtn icon={Trash2} onClick={() => remove(s.id)} title="Sil" tone="red" />
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}

function ScenarioEditor({ initial, devices, media, onCancel, onSave }) {
  const [title, setTitle] = useState(initial.title || "");
  const [items, setItems] = useState(initial.items || []);
  const [deviceIds, setDeviceIds] = useState(initial.deviceIds || []);
  const [pick, setPick] = useState("");

  const addItem = () => {
    if (!pick) return;
    setItems([...items, { mediaId: pick, startDate: today(), endDate: "2100-12-31", durationSec: null }]);
    setPick("");
  };
  const moveItem = (i, dir) => {
    const next = [...items];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
  };
  const patchItem = (i, patch) => setItems(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const toggleDevice = (id) => setDeviceIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const mediaById = (id) => media.find((m) => m.id === id);

  return (
    <div>
      <Header title={initial.id ? "Senaryoyu Düzenle" : "Yeni Senaryo"} subtitle="İçerik sırası, tarih aralığı ve cihaz ataması" />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card>
            <Field label="Başlık" required>
              <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Örn. Yemekhane Günlük Yayın" />
            </Field>
            <Field label="Oynatma listesine içerik ekle">
              <div className="flex gap-2">
                <select className={inputCls} value={pick} onChange={(e) => setPick(e.target.value)}>
                  <option value="">Medya seçiniz</option>
                  {media.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <Btn icon={Plus} onClick={addItem} disabled={!pick}>
                  Ekle
                </Btn>
              </div>
            </Field>
            <div className="space-y-3 mt-4">
              {items.length === 0 && <div className="text-sm text-gray-400 py-6 text-center">Playlist boş. Yukarıdan medya ekleyin.</div>}
              {items.map((it, i) => {
                const m = mediaById(it.mediaId);
                return (
                  <div key={i} className="border border-gray-200 rounded-md p-3 flex gap-3 items-start">
                    <div className="w-20 h-12 bg-gray-900 rounded overflow-hidden shrink-0 flex items-center justify-center">
                      {m?.kind === "image" ? (
                        <img src={m.src} className="w-full h-full object-cover" />
                      ) : (
                        <PlayCircle className="text-white/70" size={18} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">{m?.name || "(silinmiş medya)"}</div>
                      <div className="flex flex-wrap gap-2 mt-2 text-xs items-center">
                        <span className="text-gray-500">Başlangıç</span>
                        <input
                          type="date"
                          className="border border-gray-300 rounded px-2 py-1"
                          value={it.startDate}
                          onChange={(e) => patchItem(i, { startDate: e.target.value })}
                        />
                        <span className="text-gray-500">Bitiş</span>
                        <input
                          type="date"
                          className="border border-gray-300 rounded px-2 py-1"
                          value={it.endDate}
                          onChange={(e) => patchItem(i, { endDate: e.target.value })}
                        />
                        {m?.kind === "image" && (
                          <>
                            <span className="text-gray-500">Süre (sn)</span>
                            <input
                              type="number"
                              min="1"
                              className="border border-gray-300 rounded px-2 py-1 w-16"
                              value={it.durationSec ?? m.duration_sec}
                              onChange={(e) => patchItem(i, { durationSec: Number(e.target.value) })}
                            />
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <IconBtn icon={ChevronUp} onClick={() => moveItem(i, -1)} title="Yukarı" />
                      <IconBtn icon={ChevronDown} onClick={() => moveItem(i, 1)} title="Aşağı" />
                      <IconBtn icon={Trash2} onClick={() => removeItem(i)} title="Kaldır" tone="red" />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
        <div>
          <Card>
            <Field label="Bu senaryoyu kullanan cihazlar">
              <div className="border border-gray-200 rounded-md divide-y max-h-64 overflow-y-auto">
                {devices.length === 0 && <div className="p-3 text-sm text-gray-400">Önce cihaz ekleyin.</div>}
                {devices.map((d) => (
                  <label key={d.id} className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50">
                    <input type="checkbox" checked={deviceIds.includes(d.id)} onChange={() => toggleDevice(d.id)} />
                    {d.title}
                  </label>
                ))}
              </div>
            </Field>
          </Card>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Btn variant="ghost" onClick={onCancel}>
          Vazgeç
        </Btn>
        <Btn icon={Save} onClick={() => onSave({ id: initial.id, title, items, deviceIds })} disabled={!title || items.length === 0}>
          Kaydet
        </Btn>
      </div>
    </div>
  );
}
