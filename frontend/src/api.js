const BASE = "/api";

async function req(path, opts = {}) {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "İstek başarısız");
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  branches: {
    list: () => req("/branches"),
    create: (data) => req("/branches", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => req(`/branches/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id) => req(`/branches/${id}`, { method: "DELETE" }),
  },
  groups: {
    list: () => req("/groups"),
    create: (data) => req("/groups", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => req(`/groups/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id) => req(`/groups/${id}`, { method: "DELETE" }),
  },
  devices: {
    list: () => req("/devices"),
    create: (data) => req("/devices", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => req(`/devices/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id) => req(`/devices/${id}`, { method: "DELETE" }),
  },
  media: {
    list: () => req("/media"),
    upload: async (file) => {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(BASE + "/media/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Yükleme başarısız" }));
        throw new Error(err.error || "Yükleme başarısız");
      }
      return res.json();
    },
    addLink: (data) => req("/media/link", { method: "POST", body: JSON.stringify(data) }),
    remove: (id) => req(`/media/${id}`, { method: "DELETE" }),
  },
  scenarios: {
    list: () => req("/scenarios"),
    create: (data) => req("/scenarios", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => req(`/scenarios/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id) => req(`/scenarios/${id}`, { method: "DELETE" }),
  },
  rules: {
    list: () => req("/rules"),
    create: (data) => req("/rules", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => req(`/rules/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id) => req(`/rules/${id}`, { method: "DELETE" }),
  },
  foodMenus: {
    list: () => req("/food-menus"),
    create: (data) => req("/food-menus", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => req(`/food-menus/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id) => req(`/food-menus/${id}`, { method: "DELETE" }),
  },
};
