"use client";

import { useState, useRef, useEffect } from "react";
import {
  Loader2, ChevronDown, ArrowLeft, Package, DollarSign,
  Truck, Settings, FileText, HelpCircle, ListOrdered, Tag,
  MapPin, Clock, Palette, Percent, Hash, Star,
} from "lucide-react";

/**
 * ProductForm / GenericAdminForm
 * Générique : reçoit une configuration { fields, metaBoxes, title }
 * et affiche un éditeur style WordPress.
 *
 * Props :
 *  - sectionKey   : "products" | "shipping" | "trackings" | "faqs" | "howItWorks"
 *  - sectionLabel : libellé affiché (ex: "Options de livraison")
 *  - fields       : tableau [{ key, label, type, placeholder, required, options }]
 *                   type: text | textarea | number | boolean | select | color
 *  - metaBoxes    : tableau [{ title, icon, fields: [key, key,...] }]
 *  - data         : record en édition (null = création)
 *  - onSubmit(payload)
 *  - onCancel()
 *  - loading
 *  - hasImages    : true/false (active la zone galerie pour les produits)
 */

function parseInitialValues(fields, data) {
  const values = {};
  if (!fields || !Array.isArray(fields)) return values;
  fields.forEach((field) => {
    const raw = data ? data[field.key] : undefined;
    if (field.type === "boolean") {
      values[field.key] = raw ?? false;
    } else {
      values[field.key] = raw ?? "";
    }
  });
  return values;
}

function FieldLabel({ field }) {
  return (
    <label className="block text-[11px] font-semibold text-[#5C5854] uppercase tracking-widest mb-1.5">
      {field.label}
      {field.required && <span className="text-[#C8102E] ml-1 normal-case tracking-normal text-[10px]">requis</span>}
    </label>
  );
}

function FieldInput({ field, value, onChange, error }) {
  const base =
    "w-full px-3 py-2 rounded-md border border-[#1A1515]/15 bg-white text-sm text-[#1A1515] focus:outline-none focus:ring-2 focus:ring-[#B8941E]/30 focus:border-[#B8941E] transition-colors " +
    (error ? "border-[#C8102E] focus:ring-[#C8102E]/30 focus:border-[#C8102E]" : "");

  if (field.type === "textarea") {
    return (
      <textarea
        value={value || ""}
        onChange={(e) => onChange(field.key, e.target.value)}
        placeholder={field.placeholder}
        rows={field.rows || 4}
        className={base + " resize-y min-h-[120px]"}
      />
    );
  }

  if (field.type === "boolean") {
    return (
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => onChange(field.key, !value)}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            value ? "bg-[#B8941E]" : "bg-[#1A1515]/20"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              value ? "translate-x-5" : ""
            }`}
          />
        </button>
        <span className="text-sm text-[#5C5854]">{value ? "Oui" : "Non"}</span>
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <select
        value={value ?? ""}
        onChange={(e) => onChange(field.key, e.target.value)}
        className={base}
      >
        <option value="">— Sélectionner —</option>
        {(field.options || []).map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "color") {
    return (
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || "#B8941E"}
          onChange={(e) => onChange(field.key, e.target.value)}
          className="h-9 w-11 rounded-md border border-[#1A1515]/15 bg-white cursor-pointer"
        />
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(field.key, e.target.value)}
          placeholder="#B8941E"
          className={base}
        />
      </div>
    );
  }

  // text, number
  return (
    <input
      type={field.type === "number" ? "number" : "text"}
      value={value ?? ""}
      onChange={(e) => onChange(field.key, e.target.value)}
      placeholder={field.placeholder}
      className={base}
    />
  );
}

function MetaBox({ title, icon: Icon, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-md border border-[#1A1515]/10 shadow-[0_1px_0_rgba(0,0,0,0.02)] overflow-hidden mb-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-[#F7F5F2] hover:bg-[#F2EFEC] transition-colors border-b border-[#1A1515]/8"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-[#1A1515]">
          {Icon && <Icon size={14} className="text-[#B8941E]" />}
          {title}
        </span>
        <ChevronDown
          size={16}
          className={`text-[#5C5854] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="p-3 space-y-3">{children}</div>}
    </div>
  );
}

function ImageGallery({ images, setImages }) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const addFiles = (files) => {
    const arr = Array.from(files);
    if (arr.length === 0) return;
    setUploading(true);
    const newImages = arr.map((f, i) => ({
      id: `tmp-${Date.now()}-${i}`,
      preview: URL.createObjectURL(f),
      uploadedUrl: null,
      name: f.name,
      featured: false,
    }));
    setTimeout(() => {
      setImages((prev) => [...prev, ...newImages.map((i) => ({ ...i, uploadedUrl: i.preview }))]);
      setUploading(false);
    }, 400);
  };

  const removeImage = (id) => {
    setImages((prev) => prev.filter((i) => i.id !== id));
  };

  const setFeatured = (id) => {
    setImages((prev) => prev.map((i) => ({ ...i, featured: i.id === id })));
  };

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-all ${
          dragOver ? "border-[#B8941E] bg-[#B8941E]/5" : "border-[#1A1515]/15 hover:border-[#B8941E]/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => addFiles(e.target.files)}
          className="hidden"
        />
        <p className="text-sm text-[#1A1515]">
          Glisse des images ici ou <span className="text-[#B8941E] font-medium">clique pour parcourir</span>
        </p>
        <p className="text-xs text-[#8A857F] mt-1">PNG, JPG, WebP</p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
          {images.map((img, idx) => (
            <div
              key={img.id}
              className={`relative group rounded-md overflow-hidden border-2 bg-white ${
                img.featured ? "border-[#B8941E] ring-2 ring-[#B8941E]/20" : "border-[#1A1515]/10"
              }`}
            >
              <img src={img.preview || img.uploadedUrl} alt="" className="w-full h-20 object-cover" />
              {!img.uploadedUrl && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 size={14} className="animate-spin text-white" />
                </div>
              )}
              {img.featured && (
                <div className="absolute top-1 left-1 text-[9px] px-1.5 py-0.5 bg-[#B8941E] text-white rounded font-semibold uppercase tracking-wide">
                  À la une
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => setFeatured(img.id)}
                  title="Définir comme image à la une"
                  className="p-1.5 rounded bg-white text-[#1A1515] hover:bg-[#B8941E] hover:text-white transition-colors"
                >
                  <Star size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(img.id)}
                  title="Supprimer"
                  className="p-1.5 rounded bg-white text-[#C8102E] hover:bg-[#C8102E] hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <p className="text-xs text-[#B8941E] mt-2 flex items-center gap-1.5">
          <Loader2 size={12} className="animate-spin" /> Traitement en cours…
        </p>
      )}
    </div>
  );
}

export default function ProductForm({
  sectionKey,
  sectionLabel,
  fields,
  metaBoxes,
  mainFields,
  data,
  onSubmit,
  onCancel,
  loading,
  hasImages = false,
  hasTitleField = true,
}) {
  const [values, setValues] = useState(() => parseInitialValues(fields, data));
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState(() => {
    if (!hasImages) return [];
    if (data && data.images && Array.isArray(data.images) && data.images.length > 0) {
      return data.images.map((url, i) => ({
        id: `existing-${i}`,
        preview: url,
        uploadedUrl: url,
        featured: i === 0,
      }));
    }
    return [];
  });

  const isEditing = !!data;

  const handleChange = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!fields) return true;
    fields.forEach((field) => {
      if (field.required) {
        const v = values[field.key];
        if (v === "" || v === null || v === undefined) {
          newErrors[field.key] = `« ${field.label} » est requis`;
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    const processed = {};
    (fields || []).forEach((field) => {
      const v = values[field.key];
      if (field.type === "number") {
        processed[field.key] = v === "" ? null : Number(v);
      } else {
        processed[field.key] = v;
      }
    });

    if (hasImages) {
      processed.images = images
        .filter((i) => i.uploadedUrl)
        .map((i) => i.uploadedUrl);
    }

    onSubmit(processed);
  };

  // Champs principaux (hors meta-boxes)
  const mainKeys = mainFields || [
    (fields.find((f) => f.key === "name" || f.key === "label" || f.key === "title" || f.key === "question") || {}).key,
    (fields.find((f) => f.key === "description" || f.key === "answer") || {}).key,
  ].filter(Boolean);

  const titleField = fields.find(
    (f) => f.key === "name" || f.key === "label" || f.key === "title" || f.key === "question"
  );

  const mainContentField = fields.find(
    (f) => f.key === "description" || f.key === "answer"
  );

  return (
    <div className="min-h-screen bg-[#F7F5F2] text-[#1A1515] font-sans">
      {/* Top admin bar */}
      <header className="sticky top-0 z-30 bg-[#1A1515] text-white shadow">
        <div className="flex items-center justify-between px-4 h-11">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Retour à {sectionLabel}
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={submit}
              disabled={loading}
              className="px-3 py-1 text-xs rounded bg-white/10 hover:bg-white/20 text-white/90 transition-colors disabled:opacity-50"
            >
              Brouillon
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={loading}
              className="px-3 py-1 text-xs rounded bg-[#B8941E] hover:bg-[#B8941E]/90 text-white font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading && <Loader2 size={12} className="animate-spin" />}
              {isEditing ? "Mettre à jour" : "Publier"}
            </button>
          </div>
        </div>
      </header>

      {/* Sub-title bar */}
      <div className="bg-white border-b border-[#1A1515]/10 px-4 md:px-8 py-3">
        <h1 className="text-lg font-display text-[#1A1515]">
          {isEditing ? "Modifier" : "Ajouter"} — {sectionLabel}
        </h1>
      </div>

      <form onSubmit={submit} className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* COLONNE PRINCIPALE */}
          <div className="space-y-4">
            {/* Champ titre principal */}
            {hasTitleField && titleField && (
              <div className="bg-white rounded-md border border-[#1A1515]/10 p-4">
                <FieldLabel field={titleField} />
                <input
                  type="text"
                  value={values[titleField.key] || ""}
                  onChange={(e) => handleChange(titleField.key, e.target.value)}
                  placeholder={titleField.placeholder || `Saisir le ${titleField.label.toLowerCase()}…`}
                  className={`w-full text-2xl font-display bg-transparent border-0 border-b ${
                    errors[titleField.key] ? "border-[#C8102E]" : "border-[#1A1515]/10"
                  } pb-2 focus:outline-none focus:border-[#B8941E] transition-colors placeholder:text-[#8A857F]`}
                />
                {errors[titleField.key] && (
                  <p className="text-[11px] text-[#C8102E] mt-1.5">{errors[titleField.key]}</p>
                )}
              </div>
            )}

            {/* Champ description principal (s'il y en a un) */}
            {mainContentField && (
              <div className="bg-white rounded-md border border-[#1A1515]/10 overflow-hidden">
                <div className="bg-[#F7F5F2] px-3 py-2 border-b border-[#1A1515]/8 flex items-center gap-2">
                  <FileText size={14} className="text-[#B8941E]" />
                  <span className="text-sm font-semibold">{mainContentField.label}</span>
                </div>
                <textarea
                  value={values[mainContentField.key] || ""}
                  onChange={(e) => handleChange(mainContentField.key, e.target.value)}
                  rows={8}
                  placeholder={mainContentField.placeholder || "Contenu détaillé…"}
                  className="w-full p-4 bg-white text-[#1A1515] text-sm leading-relaxed focus:outline-none resize-y min-h-[180px]"
                />
                {errors[mainContentField.key] && (
                  <p className="text-[11px] text-[#C8102E] px-4 pb-3">{errors[mainContentField.key]}</p>
                )}
              </div>
            )}

            {/* Images (pour products uniquement) */}
            {hasImages && (
              <MetaBox title="Images du produit" icon={FileText}>
                <ImageGallery images={images} setImages={setImages} />
                <p className="text-[11px] text-[#8A857F] mt-2">
                  Clique sur ★ pour définir l'image à la une.
                </p>
              </MetaBox>
            )}

            {/* Meta-boxes : champs divers */}
            {(metaBoxes || []).map((box) => (
              <MetaBox key={box.id} title={box.title} icon={box.icon} defaultOpen={box.defaultOpen !== false}>
                {(box.fieldKeys || [])
                  .map((key) => fields.find((f) => f.key === key))
                  .filter(Boolean)
                  .map((field) => (
                    <div key={field.key}>
                      <FieldLabel field={field} />
                      <FieldInput
                        field={field}
                        value={values[field.key]}
                        onChange={handleChange}
                        error={errors[field.key]}
                      />
                      {errors[field.key] && (
                        <p className="text-[11px] text-[#C8102E] mt-1.5">{errors[field.key]}</p>
                      )}
                    </div>
                  ))}
              </MetaBox>
            ))}
          </div>

          {/* COLONNE DE DROITE — meta-boxes latérales */}
          <aside className="space-y-0">
            {/* Publication */}
            <MetaBox title="Publication" icon={Settings}>
              <div className="text-[11px] text-[#5C5854] uppercase tracking-widest font-semibold mb-1.5">
                Statut
              </div>
              {fields.find((f) => f.key === "status") ? (
                <>
                  <FieldInput
                    field={fields.find((f) => f.key === "status")}
                    value={values.status}
                    onChange={handleChange}
                  />
                </>
              ) : (
                <p className="text-sm text-[#8A857F]">— Nouvel enregistrement —</p>
              )}

              <div className="flex flex-col gap-2 pt-4 mt-3 border-t border-[#1A1515]/8">
                <button
                  type="button"
                  onClick={submit}
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded bg-[#B8941E] hover:bg-[#B8941E]/90 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {isEditing ? "Mettre à jour" : "Publier"}
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full px-3 py-2 rounded border border-[#1A1515]/15 text-[#5C5854] hover:bg-[#F7F5F2] text-sm font-medium transition-colors"
                >
                  Annuler
                </button>
              </div>
            </MetaBox>

            {/* Side meta-boxes (infos rapides) */}
            {(metaBoxes || [])
              .filter((b) => b.side)
              .map((box) => (
                <MetaBox key={box.id} title={box.title} icon={box.icon}>
                  {(box.fieldKeys || [])
                    .map((key) => fields.find((f) => f.key === key))
                    .filter(Boolean)
                    .map((field) => (
                      <div key={field.key}>
                        <FieldLabel field={field} />
                        <FieldInput
                          field={field}
                          value={values[field.key]}
                          onChange={handleChange}
                          error={errors[field.key]}
                        />
                        {errors[field.key] && (
                          <p className="text-[11px] text-[#C8102E] mt-1.5">{errors[field.key]}</p>
                        )}
                      </div>
                    ))}
                </MetaBox>
              ))}
          </aside>
        </div>
      </form>
    </div>
  );
}

export { Package, DollarSign, Truck, Settings, FileText, HelpCircle, ListOrdered, Tag, MapPin, Clock, Palette, Percent, Hash, Star };
