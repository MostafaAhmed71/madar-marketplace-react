# madar-marketplace-react

متجر إلكتروني "مدار" (Marketplace) — منصة لبيع المنتجات الرقمية (كورسات، كتب، باقات) مع نظام دفع يدوي (إيصال بنكي)، تحميلات رقمية، كوبونات، ولوحة إدارة كاملة.

> الاسم المقترح: **`madar-marketplace-react`**
> المجلد الحالي: `E:\ahmed Market`
> آخر تعديل: **2026-06-25**

---

## 🎯 الهدف من المشروع

متجر إلكتروني زي "حسوب" أو "إدراك" لكن بشكل مبسط:

- **العملاء**: تصفح marketplace، بحث/فلترة، سلة، دفع (إيصال بنكي)، تحميل المنتجات الرقمية، Wishlist.
- **الأدمن**: إدارة المنتجات، الباقات، التصنيفات، الطلبات، البنك (حساب استقبال الإيصالات)، Analytics.
- **مميزات**: كوبونات (Bundles)، رفع إيصال الدفع (`UploadReceiptPage`)، حالة الطلب، روابط تحميل بعد الموافقة.

---

## 🛠️ التقنيات المستخدمة

### Frontend (`frontend/`)
- **React 19.2** + **TypeScript 6** (مُعد كـ "module")
- **Vite 8** (build tool سريع جداً)
- **Tailwind CSS 4.3** (عبر `@tailwindcss/vite`)
- **React Router 7**
- **Supabase JS Client 2.108** (Backend-as-a-Service)
- **Lucide React** (icons)
- **Oxlint** (linter حديث وسريع)

### Backend-as-a-Service
- **Supabase** — Auth + Database (Postgres) + Storage + Edge Functions
- مجلد `supabase/` فيه migrations + seed.sql + edge function `notify-order`

### Static Hosting
- مجلد `hostinger/` فيه ملفات جاهزة للـ deployment على Hostinger

---

## 📦 هيكل المشروع

```
ahmed Market/
├── frontend/         # React + Vite SPA
│   ├── src/
│   │   ├── pages/    # 17 صفحة (Marketplace, Cart, Checkout, Admin...)
│   │   ├── components/  # Layout, ProtectedRoute, AdminRoute...
│   │   ├── context/  # Auth, Toast, Cart providers
│   │   ├── lib/      # utilities
│   │   └── hooks/
│   └── package.json
├── supabase/         # Backend config
│   ├── migrations/
│   ├── functions/    # notify-order Edge Function
│   └── seed.sql
└── hostinger/        # Static build for hosting
```

### الصفحات الرئيسية
**عام**: `MarketplacePage`, `ProductDetailPage`, `CategoryPage`, `BundlesPage`, `BundleDetailPage`, `CartPage`, `WishlistPage`, `LoginPage`

**دفع**: `CheckoutPage`, `UploadReceiptPage`, `CheckoutSuccessPage`

**حسابي**: `OrdersPage`, `OrderDetailPage`, `DownloadsPage`

**أدمن**: `AdminOrdersPage`, `AdminProductsPage`, `AdminCategoriesPage`, `AdminBundlesPage`, `AdminAnalyticsPage`, `AdminBankPage`

---

## 🚀 طريقة التشغيل

### 1) تجهيز Supabase
1. أنشئ مشروع جديد على [supabase.com](https://supabase.com).
2. شغل الـ migrations من مجلد `supabase/migrations/` على الـ SQL Editor.
3. شغل `supabase/seed.sql` لإضافة بيانات تجريبية (اختياري).

### 2) تجهيز env variables
أنشئ ملف `frontend/.env.local`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3) تشغيل dev server
```bash
cd "E:\ahmed Market\frontend"
npm install
npm run dev      # http://localhost:5173
```

### 4) Production build
```bash
npm run build    # ينتج مجلد dist/
npm run preview  # معاينة الـ build محلياً
```

### 5) Deploy
- **الأسهل**: ارفع محتويات مجلد `dist/` على Hostinger (جاهز في `hostinger/`).
- **بديل**: اربطه بـ Netlify أو Vercel أو أي static host.

---

## 📝 أوامر مفيدة

| الأمر | الوظيفة |
|---|---|
| `npm run dev` | تشغيل Vite dev server (HMR) |
| `npm run build` | TypeScript check + Vite production build |
| `npm run preview` | معاينة الـ build |
| `npm run lint` | Oxlint check |

---

## 📅 آخر تعديل

**2026-06-25** — ثاني أحدث مشروع في الـ drive.

---

## ⚠️ ملاحظات

- الـ Edge Function `notify-order` بتبعت إشعار لما الطلب يتغير (مثلاً للأدمن عند إيصال جديد).
- نظام الدفع **يدوي** (إيصال بنكي) — مفيش Stripe/PayPal مدمج.
- شوف ملف `madar-marketplace-claude-code.md` في نفس المجلد للتوثيق التقني الإضافي.
- الـ frontend يستخدم **React 19** اللي لسه جديد — تأكد إن الـ Supabase JS يدعمه.