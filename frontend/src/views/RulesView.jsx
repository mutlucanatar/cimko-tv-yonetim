import React, { useState } from "react";
import { Clock, Plus, Pencil, Trash2, Save } from "lucide-react";
import { api } from "../api";
import { Header, Card, Table, EmptyState, Pill, IconBtn, Btn, Modal, Field, inputCls } from "../components/ui";

const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

export default function RulesView({ store, reload }) {
  const [modal, setModal] = useState(null);
  const deviceNames = (ids) =>
    store.devices.filter((d) => ids.includes(d.id)).map((d) => d.title).join(", ") || "-";

  const save = async (form) => {
    if (form.id) await api.rules.update(form.id, form);
    else await api.rules.create(form);
    setModal(null);
    reload("rules");
  };
  const remove = async (id) => {
    if (!window.confirm("Bu kural silinsin mi?")) return;
    await api.rules.remove(id);
    reload("rules");
  };

  return (
    <div>
      <Header
        title="Kurallar"
        subtitle="Cihazlar için haftalık açık/kapalı zaman kuralları"
        action={<Btn icon={Plus} onClick={() => setModal({})}>Yeni Kural</Btn>}
      />
      <Card>
        {store.rules.length === 0 ? (
          <EmptyState icon={Clock} text="Henüz kural eklenmedi." />
        ) : (
          <Table cols={["Kural", "Günler", "Cihazlar", "Durum", ""]}>
            {store.rules.map((r) => (
              <tr key={r.id} className="border-t border-gray-100 align-top">
                <td className="py-3 px-4 font-medium text-gray-800">{r.title}</td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {DAYS.filter((d) => r.days[d]?.active).map((d) => (
                      <span key={d} className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                        {d} {r.days[d].start}–{r.days[d].end}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-600">{deviceNames(r.deviceIds || [])}</td>
                <td className="py-3 px-4">
                  <Pill tone={r.status === "Aktif" ? "green" : "red"}>{r.status}</Pill>
                </td>
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <IconBtn icon={Pencil} onClick={() => setModal(r)} title="Düzenle" />
                  <IconBtn icon={Trash2} onClick={() => remove(r.id)} title="Sil" tone="red" />
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
      {modal && <RuleModal initial={modal} devices={store.devices} onClose={() => setModal(null)} onSave={save} />}
    </div>
  );
}

function RuleModal({ initial, devices, onClose, onSave }) {
  const [title, setTitle] = useState(initial.title || "");
  const [status, setStatus] = useState(initial.status || "Aktif");
  const [deviceIds, setDeviceIds] = useState(initial.deviceIds || []);
  const [days, setDays] = useState(
    initial.days || Object.fromEntries(DAYS.map((d) => [d, { active: false, start: "08:00", end: "18:00" }]))
  );
  const toggleDevice = (id) => setDeviceIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const setDay = (d, patch) => setDays((prev) => ({ ...prev, [d]: { ...prev[d], ...patch } }));
  return (
    <Modal title={initial.id ? "Kuralı Düzenle" : "Yeni Kural"} onClose={onClose} wide>
      <Field label="Kural Adı" required>
        <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Örn. Hafta sonu kapanma" />
      </Field>
      <Field label="Günler ve Saatler">
        <div className="space-y-2">
          {DAYS.map((d) => (
            <div key={d} className="flex items-center gap-3 text-sm">
              <label className="flex items-center gap-2 w-32 shrink-0">
                <input type="checkbox" checked={days[d].active} onChange={(e) => setDay(d, { active: e.target.checked })} />
                {d}
              </label>
              <input
                type="time"
                disabled={!days[d].active}
                className={`${inputCls} w-32`}
                value={days[d].start}
                onChange={(e) => setDay(d, { start: e.target.value })}
              />
              <span className="text-gray-400">–</span>
              <input
                type="time"
                disabled={!days[d].active}
                className={`${inputCls} w-32`}
                value={days[d].end}
                onChange={(e) => setDay(d, { end: e.target.value })}
              />
            </div>
          ))}
        </div>
      </Field>
      <Field label="Uygulanacak Cihazlar">
        <div className="border border-gray-200 rounded-md divide-y max-h-40 overflow-y-auto">
          {devices.map((d) => (
            <label key={d.id} className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50">
              <input type="checkbox" checked={deviceIds.includes(d.id)} onChange={() => toggleDevice(d.id)} />
              {d.title}
            </label>
          ))}
        </div>
      </Field>
      <Field label="Durum">
        <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>Aktif</option>
          <option>Pasif</option>
        </select>
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <Btn variant="ghost" onClick={onClose}>
          Vazgeç
        </Btn>
        <Btn icon={Save} onClick={() => onSave({ id: initial.id, title, status, deviceIds, days })} disabled={!title}>
          Kaydet
        </Btn>
      </div>
    </Modal>
  );
}
