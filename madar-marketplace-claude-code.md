# مدار التعليمية - Madar Educational Platform
## Claude Code Instructions - المتجر فقط (Marketplace)

---

## نظرة عامة

متجر الموارد التعليمية الرقمية داخل منصة مدار التعليمية.
يعمل بشكل **مستقل** عن نظام الكورسات.
**طريقة الدفع**: تحويل بنكي على حساب الراجحي + رفع إيصال + تأكيد يدوي من الأدمن.

---

## Stack التقني (نفس المنصة)

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Storage**: Cloudflare R2 (ملفات المنتجات + إيصالات التحويل)
- **Email**: Resend

> لا يوجد Tap Payments في هذا الموديول - الدفع بالتحويل البنكي فقط

---

## الهوية البصرية (نفس المنصة)

```css
--orbit-purple: #505086;
--solar-gold:   #FFBA00;
--nebula-laven: #6B6BA8;
--stellar-gray: #F3F4F6;
--space-black:  #1F2937;
--growth-green: #22C55E;
```

---

## آلية الدفع كاملة

```
العميل يضيف منتجات للسلة
    ↓
صفحة Checkout: يرى بيانات الراجحي + ملخص الطلب
    ↓
يحول المبلغ من تطبيق البنك
    ↓
يضغط "لقد حولت، رفع الإيصال"
    ↓ (ينشأ الطلب بحالة PENDING)
يرفع صورة الإيصال + يكتب المبلغ والتاريخ
    ↓ (الطلب يتحول لـ AWAITING_REVIEW)
إيميل للعميل: "تم استلام إيصالك"
إيميل للأدمن: "طلب جديد ينتظر مراجعتك"
    ↓
الأدمن يراجع الإيصال يدوياً
    ↓
تأكيد → PAID → إيميل + روابط تحميل للعميل
رفض → REJECTED → إيميل + سبب الرفض للعميل
```

---

## هيكل قاعدة البيانات

```prisma
// ══════════════════════════════════
// تصنيفات المنتجات
// ══════════════════════════════════

model MarketCategory {
  id       String    @id @default(cuid())
  nameAr   String
  slug     String    @unique
  icon     String?
  order    Int       @default(0)
  isActive Boolean   @default(true)
  products Product[]
}

// ══════════════════════════════════
// المنتجات
// ══════════════════════════════════

model Product {
  id            String        @id @default(cuid())
  titleAr       String
  slug          String        @unique
  description   String
  detailedDesc  String?
  categoryId    String
  price         Float
  discountPrice Float?
  thumbnail     String
  previewImages Json          // ["url1", "url2"]
  videoUrl      String?
  fileTypes     Json          // ["PDF", "DOCX", "PPTX"]
  productType   ProductType   @default(READY)
  status        ProductStatus @default(DRAFT)
  totalSales    Int           @default(0)
  totalViews    Int           @default(0)
  avgRating     Float         @default(0)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  category    MarketCategory  @relation(fields: [categoryId], references: [id])
  files       ProductFile[]
  orderItems  OrderItem[]
  reviews     Review[]
  wishlist    Wishlist[]
  bundleItems BundleItem[]
}

enum ProductType   { EDITABLE READY HYBRID }
enum ProductStatus { DRAFT PUBLISHED ARCHIVED }

// ══════════════════════════════════
// ملفات المنتج (محمية على R2)
// ══════════════════════════════════

model ProductFile {
  id         String  @id @default(cuid())
  productId  String
  fileName   String
  fileType   String  // PDF, DOCX, PPTX, XLSX, CANVA_LINK
  storageUrl String  // R2 key (مش URL مباشر)
  fileSize   Int?    // بالكيلوبايت
  sortOrder  Int     @default(0)
  product    Product @relation(fields: [productId], references: [id])
}

// ══════════════════════════════════
// الحزم
// ══════════════════════════════════

model Bundle {
  id           String        @id @default(cuid())
  titleAr      String
  slug         String        @unique
  description  String
  price        Float
  discountPrice Float?
  thumbnail    String?
  status       ProductStatus @default(DRAFT)
  createdAt    DateTime      @default(now())
  items        BundleItem[]
  orderItems   OrderItem[]
}

model BundleItem {
  id        String  @id @default(cuid())
  bundleId  String
  productId String
  bundle    Bundle  @relation(fields: [bundleId], references: [id])
  product   Product @relation(fields: [productId], references: [id])
  @@unique([bundleId, productId])
}

// ══════════════════════════════════
// الطلبات - مع التحويل البنكي
// ══════════════════════════════════

model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique // ORD-2026-0001
  userId          String
  totalAmount     Float
  subtotal        Float
  discount        Float       @default(0)
  status          OrderStatus @default(PENDING)
  couponCode      String?
  couponId        String?

  // بيانات التحويل البنكي
  receiptUrl        String?
  receiptUploadedAt DateTime?
  transferAmount    Float?
  transferDate      String?
  transferNote      String?

  // تأكيد/رفض الأدمن
  confirmedAt     DateTime?
  confirmedBy     String?
  rejectedAt      DateTime?
  rejectionReason String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user   User        @relation(fields: [userId], references: [id])
  items  OrderItem[]
  coupon Coupon?     @relation(fields: [couponId], references: [id])
}

enum OrderStatus {
  PENDING           // تم إنشاء الطلب، لم يُرفع الإيصال بعد
  AWAITING_REVIEW   // تم رفع الإيصال، في انتظار الأدمن
  PAID              // تم التأكيد، الملفات متاحة
  REJECTED          // تم الرفض
  CANCELLED         // ملغي من العميل
  REFUNDED          // مسترد
}

model OrderItem {
  id        String   @id @default(cuid())
  orderId   String
  productId String?
  bundleId  String?
  price     Float
  order     Order    @relation(fields: [orderId], references: [id])
  product   Product? @relation(fields: [productId], references: [id])
  bundle    Bundle?  @relation(fields: [bundleId], references: [id])
}

// ══════════════════════════════════
// المراجعات
// ══════════════════════════════════

model Review {
  id        String   @id @default(cuid())
  productId String
  userId    String
  rating    Int      // 1-5
  comment   String?
  createdAt DateTime @default(now())
  product   Product  @relation(fields: [productId], references: [id])
  user      User     @relation(fields: [userId], references: [id])
  @@unique([userId, productId])
}

// ══════════════════════════════════
// المفضلة
// ══════════════════════════════════

model Wishlist {
  id        String   @id @default(cuid())
  userId    String
  productId String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  product   Product  @relation(fields: [productId], references: [id])
  @@unique([userId, productId])
}

// ══════════════════════════════════
// الكوبونات
// ══════════════════════════════════

model Coupon {
  id         String     @id @default(cuid())
  code       String     @unique
  type       CouponType
  value      Float
  usageLimit Int?
  usageCount Int        @default(0)
  minAmount  Float?
  expiresAt  DateTime?
  isActive   Boolean    @default(true)
  createdAt  DateTime   @default(now())
  orders     Order[]
}

enum CouponType { PERCENTAGE FIXED }

// ══════════════════════════════════
// بيانات الحساب البنكي
// ══════════════════════════════════

model BankAccount {
  id          String  @id @default(cuid())
  bankName    String  // بنك الراجحي
  accountName String  // اسم صاحب الحساب
  iban        String  // SA...
  accountNo   String?
  isActive    Boolean @default(true)
}
```

---

## صفحات المتجر

### عامة
```
/marketplace                        → الصفحة الرئيسية
/marketplace/[slug]                 → تفاصيل المنتج
/marketplace/category/[slug]        → منتجات تصنيف
/marketplace/bundles                → الحزم
/marketplace/bundles/[slug]         → تفاصيل حزمة
/cart                               → سلة الشراء
/checkout                           → الدفع + بيانات الراجحي
/checkout/upload-receipt/[orderId]  → رفع الإيصال
/checkout/success/[orderId]         → شكراً + انتظار التأكيد
```

### العميل (محمية)
```
/downloads                          → مشترياتي وتنزيلاتي
/downloads/[orderId]                → تفاصيل طلب + روابط
/orders                             → سجل الطلبات
/orders/[id]                        → تفاصيل طلب + حالة
/wishlist                           → المفضلة
```

### الأدمن (محمية)
```
/admin/marketplace                  → إدارة المنتجات
/admin/marketplace/new              → منتج جديد
/admin/marketplace/[id]             → تعديل منتج
/admin/marketplace/categories       → التصنيفات
/admin/bundles                      → الحزم
/admin/orders                       → الطلبات + مراجعة إيصالات
/admin/orders/[id]                  → تفاصيل + تأكيد/رفض
/admin/coupons                      → الكوبونات
/admin/bank-account                 → بيانات الحساب البنكي
```

---

## API Routes

```
// PRODUCTS (عام)
GET    /api/marketplace/products
GET    /api/marketplace/products/:slug
GET    /api/marketplace/categories
GET    /api/marketplace/bundles
GET    /api/marketplace/bundles/:slug
POST   /api/marketplace/products/:slug/view   → زيادة المشاهدات

// CART
GET    /api/cart
POST   /api/cart/add
DELETE /api/cart/remove/:itemId
POST   /api/cart/coupon

// ORDERS
POST   /api/marketplace/orders                → إنشاء طلب PENDING
POST   /api/marketplace/orders/:id/receipt    → رفع إيصال → AWAITING_REVIEW
GET    /api/marketplace/orders
GET    /api/marketplace/orders/:id

// DOWNLOADS (PAID فقط)
GET    /api/marketplace/downloads/:orderId
GET    /api/marketplace/downloads/file/:fileId   → Signed URL (15 دقيقة)

// WISHLIST
GET    /api/marketplace/wishlist
POST   /api/marketplace/wishlist/:productId

// REVIEWS
GET    /api/marketplace/products/:slug/reviews
POST   /api/marketplace/products/:slug/reviews

// ADMIN - PRODUCTS
GET    /api/admin/marketplace/products
POST   /api/admin/marketplace/products
PUT    /api/admin/marketplace/products/:id
DELETE /api/admin/marketplace/products/:id
POST   /api/admin/marketplace/categories
PUT    /api/admin/marketplace/categories/:id

// ADMIN - BUNDLES
GET    /api/admin/bundles
POST   /api/admin/bundles
PUT    /api/admin/bundles/:id

// ADMIN - ORDERS (مراجعة الإيصالات)
GET    /api/admin/orders
GET    /api/admin/orders?status=AWAITING_REVIEW
GET    /api/admin/orders/:id
POST   /api/admin/orders/:id/confirm          → → PAID + إيميل للعميل
POST   /api/admin/orders/:id/reject           → → REJECTED + إيميل للعميل

// ADMIN - COUPONS
GET    /api/admin/coupons
POST   /api/admin/coupons
PUT    /api/admin/coupons/:id

// ADMIN - BANK
GET    /api/admin/bank-account
PUT    /api/admin/bank-account

// ADMIN - ANALYTICS
GET    /api/admin/marketplace/analytics
```

---

## منطق إنشاء الطلب

```typescript
// POST /api/marketplace/orders
export async function createOrder(userId, cartItems, couponCode?) {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0)

  // تطبيق الكوبون
  let discount = 0
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode, isActive: true } })
    if (coupon && (!coupon.expiresAt || new Date() < coupon.expiresAt)) {
      if (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit) {
        discount = coupon.type === 'PERCENTAGE'
          ? subtotal * (coupon.value / 100)
          : coupon.value
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { usageCount: { increment: 1 } }
        })
      }
    }
  }

  const total = subtotal - discount

  // توليد رقم طلب
  const count = await prisma.order.count()
  const orderNumber = `ORD-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`

  const order = await prisma.order.create({
    data: {
      orderNumber, userId,
      totalAmount: total, subtotal, discount,
      status: 'PENDING',
      couponCode,
      items: {
        create: cartItems.map(item => ({
          productId: item.productId || null,
          bundleId: item.bundleId || null,
          price: item.price,
        }))
      }
    }
  })

  return order
}
```

---

## منطق رفع الإيصال

```typescript
// POST /api/marketplace/orders/:id/receipt
export async function uploadReceipt(orderId, userId, file, data) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId, status: 'PENDING' }
  })
  if (!order) throw new Error('الطلب غير موجود')

  // رفع الإيصال على R2
  const key = `marketplace/receipts/${orderId}/${Date.now()}.jpg`
  await uploadToR2(key, file)

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'AWAITING_REVIEW',
      receiptUrl: key,
      receiptUploadedAt: new Date(),
      transferAmount: data.amount,
      transferDate: data.date,
      transferNote: data.note || null,
    }
  })

  // إشعارات
  await sendReceiptReceivedEmail(userId, order)
  await notifyAdminEmail(order)
}
```

---

## منطق تأكيد/رفض الأدمن

```typescript
// POST /api/admin/orders/:id/confirm
export async function confirmOrder(orderId, adminId) {
  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'PAID', confirmedAt: new Date(), confirmedBy: adminId }
  })
  await sendDownloadLinksEmail(orderId)
}

// POST /api/admin/orders/:id/reject
export async function rejectOrder(orderId, adminId, reason) {
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'REJECTED',
      rejectedAt: new Date(),
      confirmedBy: adminId,
      rejectionReason: reason,
    }
  })
  await sendRejectionEmail(orderId, reason)
}
```

---

## أمان الملفات - Signed URLs

```typescript
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.STORAGE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY,
    secretAccessKey: process.env.STORAGE_SECRET_KEY,
  }
})

// توليد رابط مؤقت (15 دقيقة)
export async function generateDownloadUrl(storageKey: string) {
  const command = new GetObjectCommand({
    Bucket: process.env.STORAGE_BUCKET,
    Key: storageKey,
  })
  return await getSignedUrl(r2, command, { expiresIn: 900 })
}

// GET /api/marketplace/downloads/file/:fileId
export async function getFileDownloadLink(fileId, userId) {
  const file = await prisma.productFile.findUnique({ where: { id: fileId } })

  // التحقق إن الطلب مدفوع ومؤكد
  const paid = await prisma.order.findFirst({
    where: {
      userId,
      status: 'PAID',
      items: { some: { productId: file.productId } }
    }
  })
  if (!paid) throw new Error('غير مصرح')

  return await generateDownloadUrl(file.storageUrl)
}
```

---

## رفع الملفات للأدمن

```typescript
import { PutObjectCommand } from '@aws-sdk/client-s3'

// رفع ملف منتج (محمي - بدون وصول عام)
export async function uploadProductFile(buffer, fileName, productId) {
  const key = `marketplace/products/${productId}/${Date.now()}-${fileName}`
  await r2.send(new PutObjectCommand({
    Bucket: process.env.STORAGE_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: getContentType(fileName),
  }))
  return key // نحفظ الـ key مش الـ URL
}

// رفع صور المعاينة (عامة)
export async function uploadPreviewImage(buffer, fileName) {
  const key = `marketplace/previews/${Date.now()}-${fileName}`
  await r2.send(new PutObjectCommand({
    Bucket: process.env.STORAGE_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'image/jpeg',
  }))
  return `${process.env.STORAGE_PUBLIC_URL}/${key}`
}
```

---

## Resend Emails للمتجر

```typescript
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'مدار <noreply@madar.edu.sa>'

// 1. بعد رفع الإيصال → للعميل
export async function sendReceiptReceivedEmail(userId, order) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  await resend.emails.send({
    from: FROM, to: user.email,
    subject: `تم استلام إيصالك - طلب #${order.orderNumber} ⏳`,
    html: `<div dir="rtl">
      <h2>شكراً ${user.name}!</h2>
      <p>تم استلام إيصال التحويل للطلب رقم <strong>${order.orderNumber}</strong></p>
      <p>سيتم المراجعة خلال <strong>24 ساعة</strong></p>
    </div>`
  })
}

// 2. بعد رفع الإيصال → للأدمن
export async function notifyAdminEmail(order) {
  await resend.emails.send({
    from: FROM, to: process.env.ADMIN_EMAIL,
    subject: `🔔 طلب جديد ينتظر مراجعتك - ${order.orderNumber}`,
    html: `<div dir="rtl">
      <h2>طلب جديد</h2>
      <p>رقم الطلب: <strong>${order.orderNumber}</strong></p>
      <p>المبلغ: ${order.totalAmount} ريال</p>
      <a href="${process.env.NEXT_PUBLIC_URL}/admin/orders/${order.id}">مراجعة الطلب</a>
    </div>`
  })
}

// 3. بعد تأكيد الأدمن → للعميل مع روابط التحميل
export async function sendDownloadLinksEmail(orderId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true }
  })
  await resend.emails.send({
    from: FROM, to: order.user.email,
    subject: `✅ تم تأكيد طلبك - ${order.orderNumber}`,
    html: `<div dir="rtl">
      <h2>تم تأكيد دفعك! 🎉</h2>
      <a href="${process.env.NEXT_PUBLIC_URL}/downloads/${orderId}">تحميل الملفات</a>
    </div>`
  })
}

// 4. عند رفض الأدمن → للعميل مع السبب
export async function sendRejectionEmail(orderId, reason) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true }
  })
  await resend.emails.send({
    from: FROM, to: order.user.email,
    subject: `❌ بخصوص طلبك - ${order.orderNumber}`,
    html: `<div dir="rtl">
      <h2>بخصوص طلبك</h2>
      <p>للأسف لم نتمكن من تأكيد طلبك رقم <strong>${order.orderNumber}</strong></p>
      <p>السبب: ${reason}</p>
    </div>`
  })
}

// 5. تحديث المنتج → لكل المشترين السابقين
export async function sendProductUpdateEmail(productId) {
  const product = await prisma.product.findUnique({ where: { id: productId } })
  const buyers = await getProductBuyers(productId)
  for (const buyer of buyers) {
    await resend.emails.send({
      from: FROM, to: buyer.email,
      subject: `تم تحديث "${product.titleAr}" 🔄`,
      html: `<div dir="rtl">
        <h2>تحديث جديد!</h2>
        <p>تم تحديث المنتج الذي اشتريته: <strong>${product.titleAr}</strong></p>
        <a href="${process.env.NEXT_PUBLIC_URL}/downloads">تحميل النسخة الجديدة</a>
      </div>`
    })
  }
}
```

---

## لوحة الأدمن - مراجعة الإيصالات

```typescript
// ما يظهر في /admin/orders/[id]

interface OrderReviewPage {
  orderNumber: string          // ORD-2026-0001
  customer: {
    name: string
    email: string
    phone: string
  }
  items: OrderItem[]           // المنتجات
  subtotal: number
  discount: number
  total: number
  receipt: {
    imageUrl: string           // Signed URL لصورة الإيصال
    transferAmount: number
    transferDate: string
    note: string
  }
  actions: {
    confirm: () => void        // → PAID
    reject: (reason) => void   // → REJECTED
  }
}
```

---

## ترتيب البناء

### المرحلة الأولى - العرض (أسبوع 1-2)
```
1. جداول قاعدة البيانات (Prisma)
2. صفحة المتجر الرئيسية (عرض + بحث + فلترة)
3. صفحة تفاصيل المنتج
4. صفحة التصنيفات
5. سلة الشراء + كوبونات
6. لوحة الأدمن: إضافة وتعديل المنتجات والتصنيفات
```

### المرحلة الثانية - الدفع (أسبوع 3-4)
```
7. صفحة Checkout مع بيانات الراجحي
8. إنشاء الطلب في قاعدة البيانات
9. صفحة رفع الإيصال
10. صفحة الشكر (في انتظار التأكيد)
11. إيميلات Resend (للعميل + للأدمن)
12. لوحة الأدمن: مراجعة الطلبات + تأكيد/رفض
13. إدارة بيانات الحساب البنكي من الأدمن
```

### المرحلة الثالثة - التحميل والإضافات (أسبوع 5-6)
```
14. صفحة مشترياتي وتنزيلاتي (Signed URLs)
15. سجل الطلبات + تفاصيل كل طلب
16. المفضلة (Wishlist)
17. التقييمات والمراجعات
18. الحزم (Bundles)
```

### المرحلة الرابعة - التحسين (أسبوع 7-8)
```
19. نظام تحديث المنتج + إشعار المشترين
20. Analytics ولوحة الإحصائيات
21. اختبارات شاملة
22. إصلاح الأخطاء
```

---

## متغيرات البيئة (إضافية للمتجر)

```env
# (باقي المتغيرات موجودة في ملف المنصة)

# Admin Email (للإشعارات)
ADMIN_EMAIL="admin@madar.edu.sa"

# بيانات البنك تُخزن في جدول BankAccount في الـ DB
# تُدار من /admin/bank-account
# لا توجد متغيرات بيئة للبنك
```

---

## حالات الطلب

```
PENDING          → تم إنشاء الطلب، لم يُرفع الإيصال بعد
AWAITING_REVIEW  → تم رفع الإيصال، في انتظار الأدمن
PAID             → تم التأكيد ✅ الملفات متاحة للتحميل
REJECTED         → تم الرفض ❌ العميل يُبلَّغ بالسبب
CANCELLED        → ملغي من العميل
REFUNDED         → تم الاسترداد
```

---

*مدار التعليمية - مدارك تبدأ هنا*
