# Plan : Refonte admin — ajout de produit style WordPress

## Objectif
Transformer la page admin pour que l'ajout/édition de produit ressemble à l'interface d'ajout d'article de WordPress (WP Admin) :
- Titre / nom du produit en haut (grand champ)
- Éditeur de description type "block editor" simplifié (TinyMCE-like)
- Colonne de droite avec des **meta-boxes** pliables : Image à la une, Catégorie, Prix (détail/gros/minimum), Statut, Infos livraison, etc.
- Barre d'action en haut avec "Enregistrer le brouillon", "Publier", "Prévisualiser"
- Supprimer **tout ce qui concerne l'IA** (5 `div` sélectionnées : Import AI, File d'attente, Dropzone IA, Preview IA, URLs d'images pour IA).

## Recherche repo
- Layout admin actuel : `app/admin/page.js` (liste + modale d'ajout)
- Composants existants :
  - `components/admin/AIProductImport.jsx` → bloc IA à supprimer de l'affichage
  - `components/admin/ProductForm.jsx` → modale actuelle, à réécrire
  - `components/admin/CrudTable.jsx` → liste des produits
- Services : `services/admin.js` (méthodes products)
- Le layout racine `app/layout.js` affiche un header + `<Header/>` global. La page admin utilise aussi son propre aside/sous-menu.

## Fichiers à modifier / créer
1. `app/admin/page.js` — refonte complète de la vue admin
   - Nouveau state `view` : `'list' | 'edit'`
   - En mode `'edit'` : affichage plein écran style WP editor (pas de modale)
   - En mode `'list'` : table actuelle + bouton "Ajouter" qui bascule en mode edit
   - Suppression de `AIProductImport` et de la file d'attente
2. `components/admin/ProductForm.jsx` — **réécriture complète** :
   - Devient le composant "WP editor" (titre, contenu, meta-boxes latérales)
   - Plus de `motion` / `AnimatePresence` pour ce composant (on garde un look classique admin)
   - Suppression de toute la logique IA : `selectedForAI`, `Sparkles`, `analyzeWithAI`, `onAnalyzeWithAI`, `base64`
   - Zone d'upload simple : image à la une + galerie
   - Meta-boxes : `Détails du produit`, `Prix`, `Images`, `Livraison`, `Statut`
   - Chaque meta-box est pliable (toggle)
   - Sauvegarde auto-style : bouton Enregistrer / Publier / Mettre à jour
3. `components/admin/AIProductImport.jsx` — on peut **supprimer ce fichier** (ou le conserver vide, mais mieux de le supprimer et de supprimer son import dans `app/admin/page.js`)
4. `app/admin/page.js` — nettoyage des imports : retirer `AIProductImport`, `Sparkles`, `ArrowLeft`, `Eye`, `EyeOff`, `Check`, `EyeOff`, `Copy` utilisés par l'IA; garder seulement ceux nécessaires

## Étapes détaillées

### Étape 1 — Suppression totale de l'IA dans la page admin
- Dans `app/admin/page.js`, retirer `<AIProductImport />` ainsi que le `mb-8` qui l'entourait
- Retirer `handleAnalyzeWithAI` dans la page
- Retirer `extraActions={…}` IA sur la `CrudTable`
- Retirer `handleCopyProduct` (copie texte via IA)
- Retirer les imports : `import AIProductImport from '@/components/admin/AIProductImport';`, ainsi que `Sparkles`, `Check`, `Eye`, `EyeOff`

### Étape 2 — Nouveau layout admin (style WP)
Dans `app/admin/page.js` :
```
┌──────────┬─────────────────────────────────┐
│  Aside   │  ← Retour · Products           │
│ (menu)   │  ┌──────────────────────────┐  │
│ - Produits│ │  [+] Ajouter un produit  │  │
│ - Shipping│ │  [Tableau des produits]  │  │
│ - Trackings│ │                          │  │
│ - FAQs    │ │                          │  │
│ - How it  │ └──────────────────────────┘  │
│  Works    │                                 │
└──────────┴─────────────────────────────────┘

Clic sur "Ajouter" → vue éditeur plein écran :

┌────────────────────────────────────────────┐
│← Tous les produits    [Enregistrer][Publier]│
├────────────────────────────────────────────┤
│ ▢ Nom du produit (grand champ)              │
│ ▭ Contenu / Description (textarea ou éditeur)│
│ ┌─────────────────────────┬───────────────┐ │
│ │  Blocs de champs        │  Meta-boxes    │ │
│ │  - Catégorie           │  - Image à la  │ │
│ │  - Badge               │    une         │ │
│ │  - Description courte  │  - Prix        │ │
│ │  - …                   │  - Statut      │ │
│ │                         │  - Livraison   │ │
│ └─────────────────────────┴───────────────┘ │
│ [Enregistrer le brouillon]  [Publier]       │
└────────────────────────────────────────────┘
```

### Étape 3 — Réécriture de `ProductForm.jsx`
Nouvelle signature :
```jsx
export default function ProductForm({
  fields,
  data,                // produit existant (mode edit)
  onSubmit,            // callback save
  onCancel,            // callback retour liste
  loading,
})
```

Structure interne :
- Un `<header>` sticky avec : "← Produits" · titre "Ajouter un produit" · boutons `Annuler` | `Enregistrer` | `Publier`
- `main` avec 2 colonnes (md:flex) :
  - Colonne principale (2/3) :
    - `<input name="name">` grand pour le titre
    - `<textarea>` pour la description
    - Bloc "Détails" avec champs textuels (slug, catégorie, badge, badge_color, product_url)
    - Bloc "Images" (image à la une + galerie — upload direct vers Supabase pendant la saisie)
  - Colonne latérale (1/3) :
    - Meta-box "Statut" → Publication (brouillon/publié), toggle `trending`, `rating`, `reviews`
    - Meta-box "Prix" → `retail_price`, `wholesale_price`, `min_retail`, `min_wholesale`, `suggested_sell_price`
    - Meta-box "Livraison" → `weight_kg`, `dimensions`, `shipping_note`, `shipping_category` (select)
    - Chaque meta-box a un `<summary>` cliquable pour plier/déplier

### Étape 4 — Upload d'images simplifié
- Bouton parcourir + drag-and-drop (garder le drop-zone sans les boutons IA)
- Upload direct vers Supabase dès l'ajout fichier
- Affichage grille miniatures avec bouton supprimer
- Un bouton "Définir comme image à la une" (premier par défaut)

### Étape 5 — Suppression / nettoyage IA
- Supprimer `components/admin/AIProductImport.jsx`
- Dans `ProductForm.jsx`, retirer :
  - `Sparkles`, `EyeOff`, `selectedForAI`, `base64`, `analyzeWithAI`, `CopyToast`, `copyProductInfo`
  - Les boutons IA sur chaque miniature
  - Les compteurs "Pour IA / Pour upload"
  - Le champ URLs d'images pour IA

## Dépendances
- `supabase/storage` bucket `product-images` (existe déjà)
- `services/admin.js` — API create/update existante, aucun changement nécessaire
- Lucide icons (X, Save, Image, Trash2, ChevronDown, Package, DollarSign, Truck, Star)

## Gestion des risques
- **Risque** : Le formulaire grand-change pourrait casser l'édition existante. → **Mesure** : on conserve la même signature `{fields, data, onSubmit, onCancel, loading}` côté appelant.
- **Risque** : Les images uploadées en cours d'édition ne sont pas finalisées. → **Mesure** : on upload pendant la saisie vers Supabase; au submit, on ne retient que les `uploadedUrl`.
- **Risque** : La vue "éditeur plein écran" vs modale. → **Mesure** : on conditionne avec `view === 'edit'` dans `page.js` et on affiche `ProductForm` en plein écran.

## Résultat attendu
- Une page admin "Products" avec une liste de produits, un bouton "Ajouter un produit"
- Clic sur Ajouter → vue éditeur style WordPress (2 colonnes, meta-boxes, titre grand en haut)
- Plus aucune référence à l'IA dans l'UI admin
- Code propre, composants réutilisables, styles cohérents (couleurs `#1A1515`, `#B8941E`, `#F7F5F2`)
