import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') ?? 'admin@madar.edu.sa'
const APP_URL = Deno.env.get('APP_URL') ?? 'http://localhost:5173'
const FROM = 'مدار <noreply@madar.edu.sa>'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders() })
  }

  try {
    if (!RESEND_API_KEY) {
      return json({ success: false, message: 'RESEND_API_KEY not configured' }, 200)
    }

    const { orderId, type, reason } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: order } = await supabase
      .from('orders')
      .select('*, profiles!user_id(name, email)')
      .eq('id', orderId)
      .single()

    if (!order) {
      return json({ error: 'Order not found' }, 404)
    }

    const user = order.profiles as { name: string; email: string }
    let subject = ''
    let html = ''

    switch (type) {
      case 'receipt_uploaded':
        subject = `تم استلام إيصالك - طلب #${order.order_number}`
        html = rtl(`
          <h2>شكراً ${user.name}!</h2>
          <p>تم استلام إيصال التحويل للطلب رقم <strong>${order.order_number}</strong></p>
          <p>سيتم المراجعة خلال <strong>24 ساعة</strong></p>
        `)
        await sendEmail(user.email, subject, html)
        await sendEmail(ADMIN_EMAIL, `طلب جديد ينتظر مراجعتك - ${order.order_number}`, rtl(`
          <h2>طلب جديد</h2>
          <p>رقم الطلب: <strong>${order.order_number}</strong></p>
          <p>المبلغ: ${order.total_amount} ريال</p>
          <a href="${APP_URL}/admin/orders/${orderId}">مراجعة الطلب</a>
        `))
        break

      case 'confirmed':
        subject = `تم تأكيد طلبك - ${order.order_number}`
        html = rtl(`
          <h2>تم تأكيد دفعك!</h2>
          <p>طلبك رقم <strong>${order.order_number}</strong> جاهز للتحميل.</p>
          <a href="${APP_URL}/downloads/${orderId}">تحميل الملفات</a>
        `)
        await sendEmail(user.email, subject, html)
        break

      case 'rejected':
        subject = `بخصوص طلبك - ${order.order_number}`
        html = rtl(`
          <h2>بخصوص طلبك</h2>
          <p>للأسف لم نتمكن من تأكيد طلبك رقم <strong>${order.order_number}</strong></p>
          <p>السبب: ${reason ?? 'غير محدد'}</p>
        `)
        await sendEmail(user.email, subject, html)
        break

      default:
        return json({ error: 'Unknown type' }, 400)
    }

    return json({ success: true })
  } catch (err) {
    return json({ error: String(err) }, 500)
  }
})

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  })
  if (!res.ok) throw new Error(await res.text())
}

function rtl(content: string) {
  return `<div dir="rtl" style="font-family:Arial,sans-serif">${content}</div>`
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  })
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
}
