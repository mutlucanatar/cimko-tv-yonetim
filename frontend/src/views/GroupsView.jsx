import React, { useState } from "react";
import { Users2, Plus, Pencil, Trash2, Save } from "lucide-react";
import { api } from "../api";
import { Header, Card, Table, EmptyState, IconBtn, Btn, Modal, Field, inputCls } from "../components/ui";

export default function GroupsView({ store, reload }) {
  const [modal, setModal] = useState(null);

  const save = async (form) => {
    if (form.id) await api.groups.update(form.id, form);
    else await api.groups.create(form);
    setModal(null);
    reload("groups");
    reload("devices");
  };
  const remove = async (id) => {
    if (!window.confirm("Bu grup silinsin mi?")) return;
    await api.groups.remove(id);
    reload("groups");
    reload("devices");
  };
  const deviceNames = (ids) =>
    store.devices.filter((d) => ids.includes(d.id)).map((d) => d.title).join(", ") || "-";

  return (
    <div>
      <Header
        title="Gruplar"
        subtitle="Cihazları toplu yönetmek için gruplayın"
        action={<Btn icon={Plus} onClick={() => setModal({})}>Yeni Grup</Btn>}
      />
      <Card>
        {store.groups.length === 0 ? (
          <EmptyState icon={Users2} text="Henüz grup eklenmedi." />
        ) : (
          <Table cols={["Başlık", "Cihazlar", ""]}>
            {store.groups.map((g) => (
              <tr key={g.id} className="border-t border-gray-100">
                <td className="py-3 px-4 font-medium text-gray-800">{g.title}</td>
                <td className="py-3 px-4 text-gray-600">{deviceNames(g.deviceIds || [])}</td>
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <IconBtn icon={Pencil} onClick={() => setModal(g)} title="Düzenle" />
                  <IconBtn icon={Trash2} onClick={() => remove(g.id)} title="Sil" tone="red" />
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
      {modal && <GroupModal initial={modal} devices={store.devices} onClose={() => setModal(null)} onSave={save} />}
    </div>
  );
}

function GroupModal({ initial, devices, onClose, onSave }) {
  const [title, setTitle] = useState(initial.title || "");
  const [deviceIds, setDeviceIds] = useState(initial.deviceIds || []);
  const toggle = (id) => setDeviceIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  return (
    <Modal title={initial.id ? "Grubu Düzenle" : "Yeni Grup"} onClose={onClose}>
      <Field label="Başlık" required>
        <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field label="Cihazlar">
        <div className="border border-gray-200 rounded-md divide-y max-h-48 overflow-y-auto">
          {devices.length === 0 && <div className="p-3 text-sm text-gray-400">Önce cihaz ekleyin.</div>}
          {devices.map((d) => (
            <label key={d.id} className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50">
              <input type="checkbox" checked={deviceIds.includes(d.id)} onChange={() => toggle(d.id)} />
              {d.title}
            </label>
          ))}
        </div>
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <Btn variant="ghost" onClick={onClose}>
          Vazgeç
        </Btn>
        <Btn icon={Save} onClick={() => onSave({ id: initial.id, title, deviceIds })} disabled={!title}>
          Kaydet
        </Btn>
      </div>
    </Modal>
  );
}
