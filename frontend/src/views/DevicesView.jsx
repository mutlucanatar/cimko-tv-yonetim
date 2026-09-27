import React, { useState } from "react";
import { Monitor, Plus, Pencil, Trash2, Save } from "lucide-react";
import { api } from "../api";
import { Header, SearchBar, Card, Table, EmptyState, Pill, IconBtn, Btn, Modal, Field, inputCls } from "../components/ui";

export default function DevicesView({ store, reload }) {
  const [modal, setModal] = useState(null);
  const [q, setQ] = useState("");

  const branchName = (id) => store.branches.find((b) => b.id === id)?.name || "-";
  const groupName = (id) => store.groups.find((g) => g.id === id)?.title || "-";
  const scenarioName = (id) => store.scenarios.find((s) => s.id === id)?.title || "-";

  const filtered = store.devices.filter((d) => d.title.toLowerCase().includes(q.toLowerCase()));

  const save = async (form) => {
    if (form.id) await api.devices.update(form.id, form);
    else await api.devices.create(form);
    setModal(null);
    reload("devices");
  };
  const remove = async (id) => {
    if (!window.confirm("Bu cihaz silinsin mi?")) return;
    await api.devices.remove(id);
    reload("devices");
  };

  return (
    <div>
      <Header
        title="Cihazlar"
        subtitle="Yemekhane, antre ve resepsiyon ekranları"
        action={<Btn icon={Plus} onClick={() => setModal({})}>Yeni Cihaz</Btn>}
      />
      <SearchBar q={q} setQ={setQ} placeholder="Cihaz ara..." />
      <Card>
        {filtered.length === 0 ? (
          <EmptyState icon={Monitor} text="Henüz cihaz eklenmedi." />
        ) : (
          <Table cols={["Başlık", "Durum", "Şube", "Grup", "Senaryo", "İşletim Sistemi", ""]}>
            {filtered.map((d) => (
              <tr key={d.id} className="border-t border-gray-100">
                <td className="py-3 px-4 font-medium text-gray-800">{d.title}</td>
                <td className="py-3 px-4">
                  <Pill tone={d.status === "Aktif" ? "green" : "red"}>{d.status}</Pill>
                </td>
                <td className="py-3 px-4 text-gray-600">{branchName(d.branch_id)}</td>
                <td className="py-3 px-4 text-gray-600">{groupName(d.group_id)}</td>
                <td className="py-3 px-4 text-gray-600">{d.scenario_id ? scenarioName(d.scenario_id) : "-"}</td>
                <td className="py-3 px-4 text-gray-600">{d.os || "-"}</td>
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <IconBtn icon={Pencil} onClick={() => setModal(d)} title="Düzenle" />
                  <IconBtn icon={Trash2} onClick={() => remove(d.id)} title="Sil" tone="red" />
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
      {modal && (
        <DeviceModal
          initial={modal}
          branches={store.branches}
          groups={store.groups}
          scenarios={store.scenarios}
          onClose={() => setModal(null)}
          onSave={save}
        />
      )}
    </div>
  );
}

function DeviceModal({ initial, branches, groups, scenarios, onClose, onSave }) {
  const [form, setForm] = useState({
    id: initial.id,
    title: initial.title || "",
    branchId: initial.branch_id || (branches[0]?.id ?? ""),
    groupId: initial.group_id || "",
    scenarioId: initial.scenario_id || "",
    os: initial.os || "LG WebOS",
    status: initial.status || "Aktif",
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return (
    <Modal title={initial.id ? "Cihazı Düzenle" : "Yeni Cihaz"} onClose={onClose}>
      <Field label="Başlık" required>
        <input className={inputCls} value={form.title} onChange={set("title")} placeholder="Örn. Yemekhane TV-2" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Şube">
          <select className={inputCls} value={form.branchId} onChange={set("branchId")}>
            <option value="">Seçiniz</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Grup">
          <select className={inputCls} value={form.groupId} onChange={set("groupId")}>
            <option value="">Seçiniz</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Senaryo (Oynatma Listesi)">
          <select className={inputCls} value={form.scenarioId} onChange={set("scenarioId")}>
            <option value="">Atanmadı</option>
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="İşletim Sistemi">
          <input className={inputCls} value={form.os} onChange={set("os")} />
        </Field>
      </div>
      <Field label="Durum">
        <select className={inputCls} value={form.status} onChange={set("status")}>
          <option>Aktif</option>
          <option>Pasif</option>
        </select>
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <Btn variant="ghost" onClick={onClose}>
          Vazgeç
        </Btn>
        <Btn icon={Save} onClick={() => onSave(form)} disabled={!form.title}>
          Kaydet
        </Btn>
      </div>
    </Modal>
  );
}
