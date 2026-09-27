import React, { useState } from "react";
import { UtensilsCrossed, Plus, Pencil, Trash2, Save } from "lucide-react";
import { api } from "../api";
import { Header, Card, Table, EmptyState, IconBtn, Btn, Modal, Field, inputCls, fmtDate, today } from "../components/ui";

export default function FoodMenusView({ store, reload }) {
  const [modal, setModal] = useState(null);

  const save = async (form) => {
    if (form.id) await api.foodMenus.update(form.id, form);
    else await api.foodMenus.create(form);
    setModal(null);
    reload("foodMenus");
  };
  const remove = async (id) => {
    if (!window.confirm("Bu menü silinsin mi?")) return;
    await api.foodMenus.remove(id);
    reload("foodMenus");
  };

  return (
    <div>
      <Header
        title="Yemek Menüleri"
        subtitle="Yemekhane ekranlarında gösterilecek günlük menü"
        action={<Btn icon={Plus} onClick={() => setModal({})}>Yeni Menü</Btn>}
      />
      <Card>
        {store.foodMenus.length === 0 ? (
          <EmptyState icon={UtensilsCrossed} text="Henüz yemek menüsü eklenmedi." />
        ) : (
          <Table cols={["Tarih", "Etiketler", "Yemekler", ""]}>
            {store.foodMenus.map((m) => (
              <tr key={m.id} className="border-t border-gray-100 align-top">
                <td className="py-3 px-4 font-medium text-gray-800 whitespace-nowrap">{fmtDate(m.date)}</td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {(m.tags || []).map((t, i) => (
                      <span key={i} className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-600">
                  {(m.foods || []).map((f, i) => (
                    <div key={i}>
                      {f.name} <span className="text-gray-400">· {f.calorie} kcal</span>
                    </div>
                  ))}
                </td>
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <IconBtn icon={Pencil} onClick={() => setModal(m)} title="Düzenle" />
                  <IconBtn icon={Trash2} onClick={() => remove(m.id)} title="Sil" tone="red" />
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
      {modal && <FoodMenuModal initial={modal} onClose={() => setModal(null)} onSave={save} />}
    </div>
  );
}

function FoodMenuModal({ initial, onClose, onSave }) {
  const [date, setDate] = useState(initial.date || today());
  const [tagsText, setTagsText] = useState((initial.tags || []).join(", "));
  const [foods, setFoods] = useState(initial.foods && initial.foods.length ? initial.foods : [{ name: "", calorie: "" }]);
  const patchFood = (i, patch) => setFoods(foods.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  const addFood = () => setFoods([...foods, { name: "", calorie: "" }]);
  const removeFood = (i) => setFoods(foods.filter((_, idx) => idx !== i));
  const doSave = () => {
    const tags = tagsText.split(",").map((t) => t.trim()).filter(Boolean);
    const cleanFoods = foods.filter((f) => f.name.trim());
    onSave({ id: initial.id, date, tags, foods: cleanFoods });
  };
  return (
    <Modal title={initial.id ? "Menüyü Düzenle" : "Yeni Yemek Menüsü"} onClose={onClose}>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Tarih" required>
          <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Etiketler (virgülle ayırın)">
          <input className={inputCls} value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="Örn. Merkez Fabrika, Şehitkamil" />
        </Field>
      </div>
      <Field label="Yemekler">
        <div className="space-y-2">
          {foods.map((f, i) => (
            <div key={i} className="flex gap-2">
              <input className={inputCls} placeholder="Yemek adı" value={f.name} onChange={(e) => patchFood(i, { name: e.target.value })} />
              <input className={`${inputCls} w-28`} placeholder="Kalori" type="number" value={f.calorie} onChange={(e) => patchFood(i, { calorie: e.target.value })} />
              <IconBtn icon={Trash2} onClick={() => removeFood(i)} title="Kaldır" tone="red" />
            </div>
          ))}
        </div>
        <button onClick={addFood} className="text-sm mt-2 font-medium text-navy">
          + Yemek ekle
        </button>
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <Btn variant="ghost" onClick={onClose}>
          Vazgeç
        </Btn>
        <Btn icon={Save} onClick={doSave} disabled={!date}>
          Kaydet
        </Btn>
      </div>
    </Modal>
  );
}
