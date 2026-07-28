# 🚀 वेबसाइट लाइव कैसे करें (Deployment Guide)

यह प्रोजेक्ट पूरी तरह deploy-ready है — build टेस्ट हो चुका है (58 pages, कोई error नहीं)।
नीचे दिए steps फॉलो करें, 5 मिनट में साइट लाइव हो जाएगी।

---

## ⚠️ पहले ये ज़रूर पढ़ें (सबसे ज़रूरी बात)

आपने कहा कि साइट पर **Anime Hindi Dub** का कंटेंट चलेगा। कोड पूरी तरह उसी हिसाब से सेटअप है,
लेकिन **कंटेंट को लेकर एक कानूनी बात साफ़ कर देना ज़रूरी है:**

- Demon Slayer, Naruto, One Piece जैसी असली anime सीरीज़ के **Hindi dubs कॉपीराइटेड हैं**
  (Crunchyroll, Netflix, Sony/Animax, Toei आदि के पास अधिकार हैं)।
- बिना license उन्हें host या embed करना **कॉपीराइट उल्लंघन** है। नतीजा: DMCA takedown,
  होस्टिंग account ban (Vercel/Netlify तुरंत suspend करते हैं), और कानूनी नोटिस।
- इसलिए मैंने डेमो कैटलॉग में **खुद के लिखे काल्पनिक titles** रखे हैं और वीडियो के लिए
  **open-license sample files** (Blender/Google) इस्तेमाल किए हैं — ताकि साइट आज ही
  सुरक्षित रूप से लाइव हो सके।

**कानूनी तरीके से चलाने के विकल्प:**
1. **खुद का original कंटेंट** — अपनी बनाई या खुद डब की हुई सामग्री (सबसे सुरक्षित)
2. **License लें** — डिस्ट्रीब्यूटर से Hindi distribution rights खरीदें
3. **Official embeds** — YouTube पर मौजूद *आधिकारिक* चैनलों (Muse India, Ani-One आदि)
   के embeds — player पहले से YouTube support करता है
4. **Affiliate/discovery साइट** — कंटेंट host न करें, सिर्फ़ जानकारी + आधिकारिक लिंक दें

कोड इन सबके लिए तैयार है — सिर्फ़ `lib/data.ts` बदलना है।

---

## Step 1 — पुराना वर्ज़न हटाना

आपने कहा था "पुरानी वाली हटा दो"। पुराना single-file prototype **पहले ही हट चुका है** —
कोड, Prisma scaffolding और पुरानी branding सब replace हो गए हैं।

अगर आपकी कोई **पुरानी साइट पहले से कहीं लाइव** है, तो वो मैं यहाँ से नहीं हटा सकता
(उसके लिए आपके Vercel/Netlify account का access चाहिए)। उसे हटाने के लिए:

- **Vercel:** Project → Settings → नीचे **Delete Project**
- **Netlify:** Site configuration → नीचे **Delete this site**
- **डोमेन reuse करना है?** पुराने project से domain हटाकर नए में जोड़ें

---

## Step 2 — Vercel पर लाइव करें (सबसे आसान, recommended)

### तरीका A — डैशबोर्ड से (कोई terminal नहीं)

1. [vercel.com/new](https://vercel.com/new) खोलें, GitHub से लॉगिन करें
2. `santoshkumarvvv/search-hub-` repo चुनें → **Import**
3. **Branch** में `arena/019fa786-search-hub` चुनें (या पहले इसे `main` में merge कर दें)
4. Framework अपने आप **Next.js** detect होगा — settings को हाथ न लगाएँ
5. **Environment Variables** में जोड़ें:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | `https://आपका-प्रोजेक्ट.vercel.app` |

6. **Deploy** दबाएँ → 2 मिनट में लाइव ✅

> पहले deploy के बाद असली URL मिलेगा। उसे `NEXT_PUBLIC_SITE_URL` में डालकर एक बार
> **Redeploy** करें, ताकि sitemap और OG tags सही URL दिखाएँ।

### तरीका B — CLI से

```bash
npm i -g vercel
cd search-hub-
vercel login
vercel --prod
```

---

## Step 3 — या Netlify पर

`netlify.toml` पहले से मौजूद है, बस plugin install करें:

```bash
npm i -D @netlify/plugin-nextjs
git add -A && git commit -m "chore: add netlify plugin" && git push
```

फिर [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**
→ repo चुनें → Deploy। Environment variable वही `NEXT_PUBLIC_SITE_URL` जोड़ें।

---

## Step 4 — अपना डोमेन जोड़ें (optional)

**Vercel:** Project → Settings → Domains → डोमेन डालें → DNS records अपडेट करें
(`A → 76.76.21.21` या `CNAME → cname.vercel-dns.com`)

डोमेन जुड़ने के बाद `NEXT_PUBLIC_SITE_URL` उसी डोमेन पर सेट करके redeploy करें।

---

## Step 5 — अपना कंटेंट डालें

पूरा कैटलॉग एक ही फ़ाइल में है: **`lib/data.ts`**

```ts
{
  slug: 'meri-series',              // URL: /anime/meri-series
  title: 'My Series',
  titleHindi: 'मेरी सीरीज़',        // हिंदी नाम — साइट पर यही दिखेगा
  synopsis: 'कहानी का विवरण...',
  dubStatus: 'dubbed',              // dubbed | in-progress | announced | subbed-only
  dubStudio: 'आपका डब स्टूडियो',
  languages: ['hindi', 'english'],
  genres: ['action', 'fantasy'],
  poster: 'https://.../poster.jpg', // 2:3 ratio
  banner: 'https://.../banner.jpg', // 16:9 ratio
  rating: 9.0, views: 100000, year: 2025,
  status: 'Airing', ageRating: 'U/A 13+',
  studio: 'Studio Name',
  trending: true, featured: true, newRelease: true,
  episodes: [
    {
      number: 1,
      title: 'Episode One',
      titleHindi: 'पहला एपिसोड',
      synopsis: 'एपिसोड का विवरण',
      durationLabel: '24 मिनट',
      thumbnail: 'https://.../thumb.jpg',
      audio: [
        // सबसे पहले हिंदी रखें — player इसे default चुनेगा
        { lang: 'hindi',    source: { kind: 'youtube', id: 'VIDEO_ID' } },
        { lang: 'english',  source: { kind: 'mp4', url: 'https://.../ep1-en.mp4' } },
        { lang: 'japanese', source: { kind: 'vimeo', id: '123456' } },
      ],
      releasedAt: '2025-01-01',
      dubbedAt: '2025-01-15',       // हिंदी डब कब आई
    },
  ],
}
```

**तीनों video sources चलते हैं:**

| Source | कैसे लिखें |
|---|---|
| YouTube | `{ kind: 'youtube', id: 'dQw4w9WgXcQ' }` |
| Vimeo | `{ kind: 'vimeo', id: '76979871' }` |
| Direct MP4 | `{ kind: 'mp4', url: 'https://cdn.com/ep1.mp4' }` |

> नया image host इस्तेमाल कर रहे हैं? `next.config.ts` में `images.remotePatterns`
> के अंदर उसका hostname जोड़ना न भूलें, वरना images block हो जाएँगी।

बदलाव के बाद:

```bash
npm run build   # ठीक से बना या नहीं, चेक करें
git add -A && git commit -m "content: मेरी सीरीज़ जोड़ी" && git push
```

Vercel/Netlify हर push पर अपने आप redeploy कर देंगे।

---

## Hindi Dub के लिए क्या-क्या सेटअप है

- **डब स्टेटस बैज** — हर कार्ड पर: हिंदी डब / डब जारी / डब जल्द
- **ऑडियो स्विचर** — player के नीचे हिंदी ⇄ English ⇄ Japanese, हिंदी default
- **"हिंदी में देखें" बटन** — सीधे पहले हिंदी एपिसोड पर ले जाता है
- **डब काउंटर** — "3/4 हिंदी में" हर सीरीज़ पर
- **चेतावनी** — जिस एपिसोड की डब नहीं है वहाँ साफ़ मैसेज
- **फ़िल्टर** — browse और search में "सिर्फ़ हिंदी डब"
- **होमपेज rows** — हिंदी डब में उपलब्ध / ताज़ा हिंदी डब / डब जारी है
- **SEO** — `lang="hi-IN"`, हिंदी titles और descriptions, `og:locale=hi_IN`,
  JSON-LD structured data, auto sitemap (53 URLs)

---

## समस्या आए तो

| दिक्कत | हल |
|---|---|
| Build fail | `npm run build` लोकल पर चलाकर error देखें |
| Images नहीं दिख रहीं | `next.config.ts` में hostname जोड़ें |
| Sitemap में गलत URL | `NEXT_PUBLIC_SITE_URL` सेट करके redeploy करें |
| वीडियो नहीं चल रहा | URL सीधे ब्राउज़र में खोलकर देखें; CORS/hotlink ब्लॉक हो सकता है |
| YouTube embed काला | उस वीडियो पर embedding disabled हो सकती है |
