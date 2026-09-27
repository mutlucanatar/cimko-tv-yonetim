import React, { useState } from "react";
import { Building2, Plus, Pencil, Trash2, Save } from "lucide-react";
import { api } from "../api";
import { Header, Card, Table, EmptyState, Pill, IconBtn, Btn, Modal, Field, inputCls } from "../components/ui";

export default function BranchesView({ store, reload }) {
  const [modal, setModal] = useState(null);

  const save = async (form) => {
    if (form.id) await api.branches.update(form.id, form);
    else await api.branches.create(form);
    setModal(null);
    reload("branches");
  };
  const remove = async (id) => {
    if (!window.confirm("Bu şube silinsin mi?")) return;
    await api.branches.remove(id);
    reload("branches");
    reload("devices");
  };

  return (
    <div>
      <Header
        title="Şubeler"
        subtitle="Fabrika, tesis ve saha lokasyonları"
        action={<Btn icon={Plus} onClick={() => setModal({})}>Yeni Şube</Btn>}
      />
      <Card>
        {store.branches.length === 0 ? (
          <EmptyState icon={Building2} text="Henüz şube eklenmedi." />
        ) : (
          <Table cols={["Şube Adı", "Kod", "Lokasyon", "Cihaz", "Durum", ""]}>
            {store.branches.map((b) => (
              <tr key={b.id} className="border-t border-gray-100">
                <td className="py-3 px-4 font-medium text-gray-800">{b.name}</td>
                <td className="py-3 px-4 text-gray-600">{b.code || "-"}</td>
                <td className="py-3 px-4 text-gray-600">{b.location || "-"}</td>
                <td className="py-3 px-4 text-gray-600">{b.device_count ?? 0} cihaz</td>
                <td className="py-3 px-4">
                  <Pill tone={b.status === "Aktif" ? "green" : "red"}>{b.status}</Pill>
                </td>
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <IconBtn icon={Pencil} onClick={() => setModal(b)} title="Düzenle" />
                  <IconBtn icon={Trash2} onClick={() => remove(b.id)} title="Sil" tone="red" />
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
      {modal && <BranchModal initial={modal} onClose={() => setModal(null)} onSave={save} />}
    </div>
  );
}

function BranchModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState({
    id: initial.id,
    name: initial.name || "",
    code: initial.code || "",
    location: initial.location || "",
    status: initial.status || "Aktif",
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return (
    <Modal title={initial.id ? "Şubeyi Düzenle" : "Yeni Şube"} onClose={onClose}>
      <Field label="Şube Adı" required>
        <input className={inputCls} value={form.name} onChange={set("name")} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Şube Kodu">
          <input className={inputCls} value={form.code} onChange={set("code")} />
        </Field>
        <Field label="Lokasyon">
          <input className={inputCls} value={form.location} onChange={set("location")} />
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
        <Btn icon={Save} onClick={() => onSave(form)} disabled={!form.name}>
          Kaydet
        </Btn>
      </div>
    </Modal>
  );
}
