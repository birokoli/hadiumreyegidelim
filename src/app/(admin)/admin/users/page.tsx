"use client";

import React, { useEffect, useMemo, useState } from "react";

type AdminUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
};

type UserForm = {
  id?: string;
  name: string;
  username: string;
  email: string;
  password: string;
  role: string;
  status: string;
  permissions: string[];
};

const EMPTY_FORM: UserForm = {
  name: "",
  username: "",
  email: "",
  password: "",
  role: "editor",
  status: "active",
  permissions: ["dashboard"],
};

const ROLES = [
  { value: "super_admin", label: "Süper Admin", icon: "admin_panel_settings" },
  { value: "admin", label: "Admin", icon: "verified_user" },
  { value: "editor", label: "Editör", icon: "edit_square" },
  { value: "viewer", label: "Görüntüleyici", icon: "visibility" },
];

const PERMISSIONS = [
  { value: "dashboard", label: "Dashboard", icon: "dashboard" },
  { value: "orders", label: "Satış & CRM", icon: "receipt_long" },
  { value: "content", label: "İçerik", icon: "article" },
  { value: "operations", label: "Operasyon", icon: "mosque" },
  { value: "marketing", label: "Marketing", icon: "campaign" },
  { value: "settings", label: "Ayarlar", icon: "settings" },
  { value: "users", label: "Kullanıcılar", icon: "manage_accounts" },
];

const roleLabel = (role: string) => ROLES.find(item => item.value === role)?.label || role;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);
  const [form, setForm] = useState<UserForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [query, setQuery] = useState("");

  const editing = Boolean(form.id);

  const filteredUsers = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return users;
    return users.filter(user =>
      [user.name, user.username, user.email, roleLabel(user.role)]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [query, users]);

  const activeCount = users.filter(user => user.status === "active").length;

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kullanıcılar alınamadı.");
      setUsers(data.users || []);
      setCurrentAdminId(data.currentAdminId || null);
    } catch (error) {
      setMessage({ type: "err", text: error instanceof Error ? error.message : "Kullanıcılar alınamadı." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const setField = <K extends keyof UserForm>(key: K, value: UserForm[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const togglePermission = (permission: string) => {
    setForm(prev => {
      const exists = prev.permissions.includes(permission);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter(item => item !== permission)
          : [...prev.permissions, permission],
      };
    });
  };

  const startEdit = (user: AdminUser) => {
    setForm({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      password: "",
      role: user.role,
      status: user.status,
      permissions: user.permissions,
    });
    setMessage(null);
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setMessage(null);
  };

  const submitForm = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!form.name.trim() || !form.username.trim() || !form.email.trim()) {
        throw new Error("Ad soyad, kullanıcı adı ve e-posta alanları zorunlu.");
      }
      if (!emailPattern.test(form.email.trim())) {
        throw new Error("Geçerli bir e-posta adresi girin.");
      }
      if (!editing && form.password.length < 8) {
        throw new Error("Şifre en az 8 karakter olmalı.");
      }
      if (editing && form.password && form.password.length < 8) {
        throw new Error("Yeni şifre en az 8 karakter olmalı.");
      }

      const endpoint = editing ? `/api/admin/users/${form.id}` : "/api/admin/users";
      const res = await fetch(endpoint, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "İşlem tamamlanamadı.");

      setMessage({ type: "ok", text: editing ? "Kullanıcı güncellendi." : "Kullanıcı oluşturuldu." });
      resetForm();
      await loadUsers();
    } catch (error) {
      setMessage({ type: "err", text: error instanceof Error ? error.message : "İşlem tamamlanamadı." });
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (user: AdminUser) => {
    if (!confirm(`${user.name} kullanıcısı silinsin mi?`)) return;

    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kullanıcı silinemedi.");
      setMessage({ type: "ok", text: "Kullanıcı silindi." });
      await loadUsers();
    } catch (error) {
      setMessage({ type: "err", text: error instanceof Error ? error.message : "Kullanıcı silinemedi." });
    }
  };

  return (
    <div className="pt-20 p-6 lg:p-10 min-h-screen bg-surface">
      <header className="mb-8 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-5">
        <div>
          <span className="text-tertiary font-label text-xs tracking-[0.2em] uppercase mb-2 block">
            Yetki Merkezi
          </span>
          <h2 className="text-4xl font-serif text-primary">Kullanıcı Yönetimi</h2>
          <p className="text-on-surface-variant mt-2 max-w-xl text-sm leading-relaxed">
            Admin paneline erişen ekip üyelerini, rollerini ve izinlerini yönetin.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex gap-3 w-full xl:w-auto">
          <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-2xl px-5 py-3 shadow-sm">
            <p className="text-[10px] uppercase tracking-widest text-outline font-bold">Toplam</p>
            <p className="text-2xl font-bold text-primary leading-tight">{users.length}</p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-2xl px-5 py-3 shadow-sm">
            <p className="text-[10px] uppercase tracking-widest text-outline font-bold">Aktif</p>
            <p className="text-2xl font-bold text-secondary leading-tight">{activeCount}</p>
          </div>
        </div>
      </header>

      {message && (
        <div className={`mb-6 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold ${
          message.type === "ok" ? "bg-secondary/10 text-secondary" : "bg-error/10 text-error"
        }`}>
          <span className="material-symbols-outlined text-[18px]">{message.type === "ok" ? "check_circle" : "error"}</span>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-8 items-start">
        <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-outline-variant/10 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-serif text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">group</span>
                Panel Kullanıcıları
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">Aktif hesaplar panele giriş yapabilir.</p>
            </div>
            <div className="relative w-full md:w-72">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                search
              </span>
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Kullanıcı ara..."
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-sm text-on-surface-variant">Yükleniyor...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-10 flex flex-col items-center text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl mb-3 opacity-40">manage_accounts</span>
              <p className="text-sm font-bold">Kullanıcı bulunamadı.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-surface-container-low text-[10px] uppercase tracking-widest text-outline font-bold">
                  <tr>
                    <th className="px-5 py-3">Kullanıcı</th>
                    <th className="px-5 py-3">Rol</th>
                    <th className="px-5 py-3">İzinler</th>
                    <th className="px-5 py-3">Durum</th>
                    <th className="px-5 py-3">Son Giriş</th>
                    <th className="px-5 py-3 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold">
                            {user.name.slice(0, 1).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-primary truncate">{user.name}</p>
                            <p className="text-xs text-on-surface-variant truncate">@{user.username} · {user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/8 text-primary text-xs font-bold">
                          <span className="material-symbols-outlined text-[16px]">
                            {ROLES.find(role => role.value === user.role)?.icon || "person"}
                          </span>
                          {roleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {(user.role === "super_admin" ? ["Tüm Yetkiler"] : user.permissions).slice(0, 4).map(permission => (
                            <span key={permission} className="px-2 py-1 rounded-lg bg-surface-container text-on-surface-variant text-[11px] font-bold">
                              {PERMISSIONS.find(item => item.value === permission)?.label || permission}
                            </span>
                          ))}
                          {user.role !== "super_admin" && user.permissions.length > 4 && (
                            <span className="px-2 py-1 rounded-lg bg-surface-container text-on-surface-variant text-[11px] font-bold">
                              +{user.permissions.length - 4}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          user.status === "active" ? "bg-secondary/10 text-secondary" : "bg-surface-container text-on-surface-variant"
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {user.status === "active" ? "Aktif" : "Pasif"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-on-surface-variant">
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString("tr-TR") : "Henüz yok"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(user)}
                            className="p-2 rounded-xl text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors"
                            title="Düzenle"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteUser(user)}
                            disabled={currentAdminId === user.id}
                            className="p-2 rounded-xl text-on-surface-variant hover:bg-error/10 hover:text-error transition-colors disabled:opacity-30 disabled:pointer-events-none"
                            title="Sil"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/15 shadow-sm xl:sticky xl:top-24">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-serif text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">{editing ? "edit" : "person_add"}</span>
                {editing ? "Kullanıcı Düzenle" : "Yeni Kullanıcı"}
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">
                {editing ? "Boş şifre alanı mevcut şifreyi korur." : "Yeni kullanıcı ilk girişte bu şifreyi kullanır."}
              </p>
            </div>
            {editing && (
              <button type="button" onClick={resetForm} className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors" title="Yeni kullanıcı">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            )}
          </div>

          <form onSubmit={submitForm} noValidate className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Ad Soyad</label>
              <input value={form.name} onChange={event => setField("name", event.target.value)} className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none text-primary" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Kullanıcı Adı</label>
                <input value={form.username} onChange={event => setField("username", event.target.value)} className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none text-primary" />
              </div>
              <div>
                <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Durum</label>
                <select value={form.status} onChange={event => setField("status", event.target.value)} className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none text-primary">
                  <option value="active">Aktif</option>
                  <option value="passive">Pasif</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">E-posta</label>
              <input type="text" inputMode="email" value={form.email} onChange={event => setField("email", event.target.value)} className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none text-primary" />
            </div>
            <div>
              <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">
                Şifre {editing && <span className="normal-case tracking-normal text-outline">(opsiyonel)</span>}
              </label>
              <input
                type="password"
                value={form.password}
                onChange={event => setField("password", event.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none text-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Rol</label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map(role => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setForm(prev => ({
                      ...prev,
                      role: role.value,
                      permissions: role.value === "super_admin" ? PERMISSIONS.map(item => item.value) : prev.permissions,
                    }))}
                    className={`flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-bold transition-all ${
                      form.role === role.value ? "bg-primary text-white shadow-md" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{role.icon}</span>
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">İzinler</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PERMISSIONS.map(permission => {
                  const checked = form.role === "super_admin" || form.permissions.includes(permission.value);
                  return (
                    <button
                      key={permission.value}
                      type="button"
                      disabled={form.role === "super_admin"}
                      onClick={() => togglePermission(permission.value)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left ${
                        checked ? "bg-tertiary/10 text-tertiary ring-1 ring-tertiary/20" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                      } disabled:opacity-80`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{checked ? "check_circle" : permission.icon}</span>
                      {permission.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button disabled={saving} type="submit" className="w-full bg-primary hover:bg-[#002f6c] text-white px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50">
              <span className="material-symbols-outlined text-[20px]">{editing ? "save" : "person_add"}</span>
              {saving ? "Kaydediliyor..." : editing ? "Güncelle" : "Kullanıcı Oluştur"}
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
