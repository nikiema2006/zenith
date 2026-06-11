"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Package, Ship, MapPin, HelpCircle, ListOrdered, Loader2,
  Pencil, Trash2, Plus,
} from "lucide-react";
import { adminService } from "@/services/admin";
import { supabase } from "@/lib/supabase";
import CrudTable from "@/components/admin/CrudTable";
import ProductForm from "@/components/admin/ProductForm";
import {
  DollarSign, Truck, Settings, FileText, Tag, Clock, Palette, Percent, Hash, Star,
} from "lucide-react";

/**
 * CONFIGURATION PAR SECTION
 * Chaque section définit :
 *   - label, icone, service Supabase, colonnes affichées, champs éditables, meta-boxes
 */

const SECTIONS = {
  products: {
    key: "products",
    label: "Produits",
    icon: Package,
    service: adminService.products,
    orderBy: "created_at",
    searchFields: ["name", "slug", "category", "description", "badge"],
    hasImages: true,
    tableColumns: [
      { key: "name", label: "Nom" },
      { key: "category", label: "Catégorie" },
      { key: "status", label: "Statut" },
      { key: "retail_price", label: "Prix détail" },
      { key: "trending", label: "Tendance" },
    ],
    fields: [
      { key: "name", label: "Nom du produit", type: "text", placeholder: "Ex: Chaise en bois nordique…", required: true },
      { key: "slug", label: "Slug", type: "text", placeholder: "chaise-bois-nordique" },
      { key: "category", label: "Catégorie", type: "text", placeholder: "Mobilier" },
      { key: "badge", label: "Badge", type: "text", placeholder: "Nouveau / En solde…" },
      { key: "badge_color", label: "Couleur du badge", type: "color" },
      { key: "description", label: "Description", type: "textarea", placeholder: "Décrivez le produit en détail…", rows: 10 },
      { key: "retail_price", label: "Prix de détail (XOF)", type: "number" },
      { key: "wholesale_price", label: "Prix de gros (XOF)", type: "number" },
      { key: "min_retail", label: "Minimum détail", type: "number" },
      { key: "min_wholesale", label: "Minimum gros", type: "number" },
      { key: "suggested_sell_price", label: "Prix de vente suggéré", type: "number" },
      { key: "weight_kg", label: "Poids (kg)", type: "number" },
      { key: "dimensions", label: "Dimensions (L×l×h)", type: "text" },
      { key: "volume_per_lot", label: "Volume par lot (CBM)", type: "number" },
      { key: "lot_size", label: "Taille de lot", type: "number" },
      { key: "shipping_note", label: "Note livraison", type: "textarea", rows: 3 },
      {
        key: "shipping_category",
        label: "Catégorie de livraison",
        type: "select",
        options: [
          { value: "MCO", label: "MCO — Ordinaire" },
          { value: "MCF", label: "MCF — Fragile/Dangereux" },
          { value: "MCI", label: "MCI — Alimentaire" },
        ],
      },
      { key: "rating", label: "Note moyenne (0–5)", type: "number" },
      { key: "reviews", label: "Nombre d'avis", type: "number" },
      { key: "trending", label: "Produit tendance", type: "boolean" },
      {
        key: "status",
        label: "Statut de publication",
        type: "select",
        options: [
          { value: "draft", label: "Brouillon" },
          { value: "published", label: "Publié" },
        ],
      },
      { key: "product_url", label: "URL source", type: "text", placeholder: "https://…" },
      { key: "video_links", label: "Liens vidéos (YouTube, MP4…)", type: "textarea", rows: 3, placeholder: "https://youtube.com/xxx\nhttps://autre-site.com/video.mp4" },
    ],
    metaBoxes: [
      { id: "details", title: "Détails du produit", icon: Package, fieldKeys: ["slug", "category", "badge", "badge_color", "product_url", "video_links"] },
      { id: "pricing", title: "Tarifs & prix", icon: DollarSign, fieldKeys: ["retail_price", "wholesale_price", "suggested_sell_price", "min_retail", "min_wholesale"], side: true },
      { id: "shipping", title: "Livraison", icon: Truck, fieldKeys: ["weight_kg", "dimensions", "shipping_category", "shipping_note", "volume_per_lot", "lot_size"], side: true },
      { id: "status", title: "Visibilité", icon: Settings, fieldKeys: ["rating", "reviews", "trending"], side: true },
    ],
  },

  shipping: {
    key: "shipping",
    label: "Options de livraison",
    icon: Ship,
    service: adminService.shipping,
    orderBy: "id",
    searchFields: ["label", "description", "estimated_days"],
    tableColumns: [
      { key: "label", label: "Libellé" },
      { key: "price_per_kg", label: "Prix/kg" },
      { key: "price_per_cbm", label: "Prix/CBM" },
      { key: "estimated_days", label: "Délai" },
      { key: "color", label: "Couleur" },
    ],
    fields: [
      { key: "label", label: "Libellé", type: "text", required: true, placeholder: "Ex: Aérien Express" },
      { key: "price_per_kg", label: "Prix par kg (XOF)", type: "number" },
      { key: "price_per_cbm", label: "Prix par CBM", type: "number" },
      { key: "estimated_days", label: "Délai estimé (jours)", type: "text", placeholder: "5–8 jours" },
      { key: "color", label: "Couleur d'affichage", type: "color" },
      { key: "description", label: "Description", type: "textarea", placeholder: "Expliquez brièvement cette option…" },
      { key: "status", label: "Statut", type: "select", options: [{ value: "published", label: "Publié" }, { value: "draft", label: "Brouillon" }] },
    ],
    metaBoxes: [
      { id: "details", title: "Caractéristiques", icon: Truck, fieldKeys: ["price_per_kg", "price_per_cbm", "estimated_days", "color", "status"] },
    ],
  },

  trackings: {
    key: "trackings",
    label: "Suivis de colis",
    icon: MapPin,
    service: adminService.trackings,
    orderBy: "created_at",
    searchFields: ["code", "product", "origin", "destination", "shipping_mode"],
    tableColumns: [
      { key: "code", label: "Code" },
      { key: "product", label: "Produit" },
      { key: "origin", label: "Origine" },
      { key: "destination", label: "Destination" },
      { key: "status", label: "Statut" },
    ],
    fields: [
      { key: "code", label: "Code de suivi", type: "text", required: true, placeholder: "CE2026A1" },
      { key: "product", label: "Produit concerné", type: "text", placeholder: "Lot de chaises…" },
      { key: "origin", label: "Origine", type: "text", placeholder: "Guangzhou, CN" },
      { key: "destination", label: "Destination", type: "text", placeholder: "Dakar, SN" },
      {
        key: "status",
        label: "Statut du colis",
        type: "select",
        options: [
          { value: "preparing", label: "En préparation" },
          { value: "in_transit", label: "En transit" },
          { value: "delivered", label: "Livré" },
        ],
      },
      { key: "shipping_mode", label: "Mode d'expédition", type: "text", placeholder: "Aérien / Maritime" },
      { key: "current_step", label: "Étape actuelle", type: "text", placeholder: "Départ de Guangzhou" },
      { key: "eta", label: "Date d'arrivée estimée", type: "text", placeholder: "2026-07-15" },
      { key: "current_status", label: "Statut textuel", type: "text" },
      { key: "notes", label: "Notes internes", type: "textarea", rows: 4 },
    ],
    metaBoxes: [
      { id: "route", title: "Trajet", icon: MapPin, fieldKeys: ["origin", "destination", "shipping_mode", "eta"] },
      { id: "status", title: "Statut", icon: Settings, fieldKeys: ["status", "current_step", "current_status"], side: true },
    ],
  },

  faqs: {
    key: "faqs",
    label: "FAQ",
    icon: HelpCircle,
    service: adminService.faqs,
    orderBy: "order_index",
    searchFields: ["question", "answer"],
    tableColumns: [
      { key: "question", label: "Question" },
      { key: "order_index", label: "Ordre" },
    ],
    fields: [
      { key: "question", label: "Question", type: "text", required: true, placeholder: "Quel est le délai de livraison ?" },
      { key: "answer", label: "Réponse", type: "textarea", rows: 8, placeholder: "Rédigez la réponse…", required: true },
      { key: "order_index", label: "Ordre d'affichage", type: "number" },
      { key: "status", label: "Statut", type: "select", options: [{ value: "published", label: "Publié" }, { value: "draft", label: "Brouillon" }] },
    ],
    metaBoxes: [
      { id: "meta", title: "Paramètres", icon: Settings, fieldKeys: ["order_index", "status"], side: true },
    ],
  },

  howItWorks: {
    key: "howItWorks",
    label: "Comment ça marche",
    icon: ListOrdered,
    service: adminService.howItWorks,
    orderBy: "step",
    searchFields: ["title", "description"],
    tableColumns: [
      { key: "step", label: "Étape" },
      { key: "title", label: "Titre" },
    ],
    fields: [
      { key: "step", label: "Numéro d'étape", type: "number", required: true, placeholder: "1" },
      { key: "title", label: "Titre de l'étape", type: "text", required: true, placeholder: "Choisis ton produit" },
      { key: "description", label: "Description", type: "textarea", rows: 6, placeholder: "Expliquez brièvement cette étape…" },
      { key: "icon", label: "Icône (Lucide)", type: "text", placeholder: "Package / Truck / CheckCircle" },
      { key: "status", label: "Statut", type: "select", options: [{ value: "published", label: "Publié" }, { value: "draft", label: "Brouillon" }] },
    ],
    metaBoxes: [
      { id: "meta", title: "Paramètres", icon: Settings, fieldKeys: ["step", "icon", "status"], side: true },
    ],
  },
};

export default function AdminDashboard() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/admin/login";
      } else {
        setIsAuthenticated(true);
      }
      setAuthChecked(true);
    }
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        window.location.href = "/admin/login";
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5F2]">
        <Loader2 size={32} className="animate-spin text-[#B8941E]" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <AdminDashboardContent />;
}

function AdminDashboardContent() {
  const [activeSection, setActiveSection] = useState("products");
  const [view, setView] = useState("list"); // "list" | "edit"
  const [editingRecord, setEditingRecord] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const section = SECTIONS[activeSection];

  const fetchData = useCallback(async () => {
    setLoading(true);
    setSearchQuery("");
    setStatusFilter("all");
    try {
      const result = await section.service.getAll(section.orderBy);
      setData(result || []);
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [section]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = (() => {
    let result = data;
    if (activeSection === "products" && statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const fields = section.searchFields;
      result = result.filter((record) =>
        fields.some((key) => {
          const val = record[key];
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(q);
        })
      );
    }
    return result;
  })();

  const handleAdd = () => {
    setEditingRecord(null);
    setView("edit");
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setView("edit");
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cet enregistrement ?")) return;
    try {
      await section.service.delete(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePublish = async (id) => {
    try {
      if (activeSection === "products") {
        await adminService.products.publish(id);
      } else {
        await section.service.update(id, { status: "published" });
      }
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnpublish = async (id) => {
    try {
      if (activeSection === "products") {
        await adminService.products.unpublish(id);
      } else {
        await section.service.update(id, { status: "draft" });
      }
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (formData) => {
    setSubmitLoading(true);
    try {
      if (editingRecord) {
        await section.service.update(editingRecord.id, formData);
      } else {
        const payload = { ...formData, status: formData.status || "draft" };
        await section.service.create(payload);
      }
      setView("list");
      setEditingRecord(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement : " + err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  // --- Écran d'édition ---
  if (view === "edit") {
    return (
      <ProductForm
        sectionKey={section.key}
        sectionLabel={section.label}
        fields={section.fields}
        metaBoxes={section.metaBoxes}
        data={editingRecord}
        onSubmit={handleSubmit}
        onCancel={() => {
          setView("list");
          setEditingRecord(null);
        }}
        loading={submitLoading}
        hasImages={!!section.hasImages}
        hasTitleField={true}
      />
    );
  }

  // --- Écran de liste ---
  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-64 bg-white border-r border-[#1A1515]/10 flex-col fixed h-full top-0 left-0">
        <div className="px-5 py-5 border-b border-[#1A1515]/8">
          <div className="text-[10px] uppercase tracking-widest text-[#8A857F] mb-1">Administration</div>
          <div className="font-display text-xl text-[#1A1515]">China Express</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {Object.values(SECTIONS).map(({ key, label, icon: Icon }) => {
            const active = activeSection === key;
            return (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                  active
                    ? "bg-[#B8941E]/10 text-[#B8941E] border border-[#B8941E]/30"
                    : "text-[#5C5854] hover:bg-[#1A1515]/5 hover:text-[#1A1515]"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Tabs mobile */}
      <div className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[#1A1515]/8">
        <div className="flex overflow-x-auto scrollbar-hide px-2 py-2 gap-1.5">
          {Object.values(SECTIONS).map(({ key, label, icon: Icon }) => {
            const active = activeSection === key;
            return (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all ${
                  active
                    ? "bg-[#B8941E] text-white"
                    : "text-[#5C5854] bg-[#1A1515]/3 hover:text-[#1A1515]"
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenu principal */}
      <main className="md:ml-64 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-[#8A857F] mb-1">
              {Object.keys(SECTIONS).length} sections
            </div>
            <h2 className="font-display text-2xl md:text-3xl text-[#1A1515]">{section.label}</h2>
            <p className="text-sm text-[#5C5854] mt-1">
              {filteredData.length} enregistrement{filteredData.length !== 1 ? "s" : ""}
              {searchQuery && ` correspondant à « ${searchQuery} »`}
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#B8941E] hover:bg-[#B8941E]/90 text-white text-sm font-semibold transition-all shadow-sm"
          >
            <Plus size={16} />
            Ajouter
          </button>
        </div>

        {/* Filtres Produits */}
        {activeSection === "products" && (
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { value: "all", label: "Tous" },
              { value: "draft", label: "Brouillons" },
              { value: "published", label: "Publiés" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  statusFilter === f.value
                    ? "bg-[#B8941E] text-white"
                    : "bg-white border border-[#1A1515]/10 text-[#5C5854] hover:border-[#B8941E]/40"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Rechercher dans ${section.label.toLowerCase()}…`}
              className="w-full bg-white border border-[#1A1515]/10 rounded-lg pl-11 pr-4 py-3 text-sm text-[#1A1515] placeholder:text-[#8A857F] focus:border-[#B8941E] focus:outline-none focus:ring-2 focus:ring-[#B8941E]/20 transition-colors"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A857F]">🔍</span>
          </div>
        </div>

        {/* Tableau CRUD */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-[#B8941E]" />
          </div>
        ) : (
          <CrudTable
            columns={section.tableColumns}
            data={filteredData}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            extraActions={(record) => (
              <button
                onClick={() => {
                  if (record.status === "published") handleUnpublish(record.id);
                  else handlePublish(record.id);
                }}
                className="p-2 rounded-md border border-[#1A1515]/10 text-[#5C5854] hover:text-[#B8941E] hover:bg-[#B8941E]/10 transition-colors text-xs font-semibold"
                title={record.status === "published" ? "Dépublier" : "Publier"}
              >
                {record.status === "published" ? "Dépublier" : "Publier"}
              </button>
            )}
          >
            {null /* no custom cell render — keep default */}
          </CrudTable>
        )}
      </main>
    </div>
  );
}
