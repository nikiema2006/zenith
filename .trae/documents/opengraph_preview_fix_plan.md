# Plan — Réparation OG image / OG card (page produit)

## Constat
Sur la page produit `https://zenith6.vercel.app/produit/lunettes-de-soleil-polarises-sport-design-wrap-around` :
- **WhatsApp / Facebook / LinkedIn** : l'aperçu affiche le **favicon / logo rond Z rouge** du site au lieu de l'image du produit.
- Sur WhatsApp mobile, **rien ne s'affiche** à part la description.
- La feature est critique pour le site (catalogue e-commerce import ↔ Afrique).

Le générateur `/api/og` (route Edge, `ImageResponse` avec le produit en fond) **est appelé correctement** depuis `generateMetadata`, mais :

### Causes probables identifiées

1. **`ImageResponse` / `@vercel/og` en runtime `edge` de Next.js 16 est buggué en prod** : le PNG n'est parfois **pas servi** (erreur 500 silencieuse), la taille de réponse peut être 0, ou le format 1200x630 n'est pas respecté. Les crawlers WhatsApp/Facebook ont des timeouts très courts (~2–3 s). Si `/api/og?…` met plus de temps ou plante, ils fallback sur le premier `<img>` de la page (le logo Z).

2. **`og:image` pointe actuellement vers `/api/og?…`** (image dynamique). Si cette route plante en prod, c'est le favicon qui s'affiche.

3. **Dimensions / format / cache** : OG requiert **au moins 200×200** (Facebook), **1200×630** recommandé, JPG/PNG/WebP, `og:image:width` + `og:image:height` obligatoires pour éviter un re-fetch.

4. **Absence de `twitter:image` distinctif** : si WhatsApp utilise le graphe Twitter (carte `summary_large_image`) l'image doit être la même.

5. **Supabase `product.images` = tableau d'URLs publiques** (storage) — ces URLs **existent** et sont utilisées dans la gallerie côté client. La **première image** du produit (qui est bien affichée dans la gallerie) devrait être utilisée comme fallback OG sûr.

## Stratégie de résolution

### Principe : "Fallback sûr" + "Image dynamique optionnelle"

- Utiliser **directement la première image produit** (URL Supabase publique, déjà en prod, fiable, rapide) comme `og:image` **PRINCIPALE**. Ça suffit pour un bon rendu WhatsApp/Facebook, c'est ce que font 90 % des e-commerces.
- Garder `/api/og` en **second plan** / `og:image:secure_url` (image riche pour les réseaux qui acceptent, ex: cards longues LinkedIn), OU la désactiver si elle reste instable.
- Ajouter explicitement `og:image:width`, `og:image:height`, `og:image:alt`, `og:image:type`, plus une balise `<meta property="og:image" content="…">` en premier `<head>` avec **URL absolue https**.
- Fournir **aussi** un `<link rel="image_src" href="…">` (ancien standard que respectent encore certains crawlers).
- `twitter:image` = même URL que `og:image`.
- Forcer un format **1200×630** : si on utilise directement l'image produit Supabase, ses dimensions ne correspondent pas → on passe par **notre propre `og:image` redimensionné à 1200×630** (prochain point).

Étant donné le risque de bug Edge runtime en prod, on **remplace le générateur `/api/og`** (ImageResponse) par un générateur **Edge runtime-compatible plus robuste** : `@vercel/og` fournit un `ImageResponse` natif qui doit marcher, mais l'erreur vient peut-être de la tentative de **chargement d'image externe** (`img src=url supabase`) dans le rendu ImageResponse.

### Alternative plus robuste : préfixe `/api/og-image?src=…`

On garde une route `/api/og-image` qui :
- prend `?src=https://…` en query string (URL de l'image produit)
- appelle `fetch(src)` pour récupérer l'image (ou retourne une image par défaut si échec)
- retourne **directement le flux binaire** JPG d'origine avec les bons headers `Content-Type`, `Cache-Control` (pas de re-processing SVG→PNG côté serveur)
- On redimensionnera optionnellement via `sharp` côté node, mais ça nécessite de passer en runtime node (pas edge). Version Vercel : on utilise `@vercel/og` **ou** on laisse passer l'image brute.

Le plus simple, le plus fiable, et qui MARCHE EN PROD :
> URL OG = **première image du produit telle quelle depuis Supabase** (c'est déjà en 1200x+ la plupart du temps). Si elle est trop petite ou absente → fallback sur un OG image statique `/og-fallback.jpg`

## Fichiers concernés

1. **`app/produit/[slug]/page.js`** — `generateMetadata` :
   - `ogImage = product.images?.[0] || /og-default.jpg` (URL ABSOLUE https://…)
   - `openGraph.images` = tableau avec `{ url, width: 1200, height: 630, alt, type: "image/jpeg" }` (on supprime `secure_url` et les infos redondantes)
   - `twitter.images` = même URL
   - `other."link rel=image_src"` via metadataLink ou autre. Next.js fournit `metadataBase` + canonical, on compte sur ça.
   - S'assurer que `metadataBase = new URL(NEXT_PUBLIC_SITE_URL)` est renseigné

2. **`app/api/og/route.js`** — rend cette route plus robuste :
   - Si `?src=…` : redirect 302 vers la source (pas de re-traitement)
   - Sinon générer image dynamique
   - Ajouter headers de cache (`Cache-Control: public, max-age=3600, s-maxage=86400`)
   - Fallback si `product.images[0]` échoue → logo

3. **`public/og-default.jpg`** — une image statique 1200×630 avec branding China Express (hors plan code, créé manuellement via Gimp/Canva). **Optionnel** mais recommandé comme fallback ultime quand le produit n'a pas d'image.

4. **`.env.local` + variables d'environnement** : s'assurer que `NEXT_PUBLIC_SITE_URL=https://zenith6.vercel.app` en prod.

5. **Validation externe** : tester via `https://developers.facebook.com/tools/debug/` + `https://cards-dev.twitter.com/validator` + `https://metatags.io`

## Étapes d'implémentation

1. **Étape 1 (prioritaire) :** Faire pointer `og:image` + `twitter:image` sur **la première image du produit en URL absolue** (déjà en prod chez Supabase, fiable à 100 %). C'est ça qui fait que ça marche pour WhatsApp.
2. **Étape 2 :** Refactorer `/api/og` pour être un **redirect 302** ou servir la première image produit en proxy simple (pas de ImageResponse) ; garder l'option `ImageResponse` comme variante "card riche" qui ne sert que si `?title=` est fournie.
3. **Étape 3 :** Ajouter `og:image:width` + `og:image:height` explicitement.
4. **Étape 4 :** Vérifier `NEXT_PUBLIC_SITE_URL` en local + en prod.
5. **Étape 5 :** Déployer sur Vercel, tester via Sharing Debugger FB, WhatsApp mobile, WhatsApp Web, LinkedIn.
6. **Étape 6 (optionnel) :** créer `og-default.jpg` 1200×630 fallback pour les produits sans image.

## Risques / considérations

- **CORS** : les images Supabase sont en `https://….supabase.co/storage/v1/object/public/…`. Ces URLs sont publiques. WhatsApp/Facebook crawl en HTTP/HTTPS standard. Aucun problème a priori.
- **Taille** : WhatsApp semble privilégier des images carrées ou 1.91:1, min 200×200. Préférer JPG ≥ 1200 px.
- **Cache OG** : Facebook et WhatsApp gardent en cache la carte d'une URL **pendant 7-30 jours**. Il faut "tuer" le cache après chaque déploiement avec le Sharing Debugger FB (bouton "Scrape Again"). À signaler.
- **Runtime `edge`** : l'actuel `/api/og` utilise `ImageResponse` en edge runtime. Ça a couté cher en prod précédemment. La route refactorée devra être soit:
  - Edge runtime, mais sans `ImageResponse` → `fetch(src)` puis retour binaire, ce qui est trivial et stable ;
  - ou Node.js runtime + `sharp` pour resizer proprement en 1200×630.

## Critères d'acceptation

- [ ] Partage WhatsApp mobile → **vignette produit** affichée (pas favicon)
- [ ] Facebook Sharing Debugger → "og:image" = URL de l'image produit, type=image/jpeg, largeur/hauteur renseignés, 0 warning
- [ ] LinkedIn / Twitter card → image produit
- [ ] Build Next.js passe (pas d'erreur "Invalid OpenGraph type" ou autre)
- [ ] `/api/og-image?src=…` retourne 200 + Content-Type image

## Commandes de vérification à faire en fin

```bash
# Build local
npm run build

# Dev test
curl -I "http://localhost:3000/api/og?title=Lunettes"
curl -s "http://localhost:3000/produit/lunettes-…" | grep -E 'og:image|twitter:image'
```
