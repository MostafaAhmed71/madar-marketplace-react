import { Building2, Copy } from 'lucide-react'
import type { BankAccount } from '../types/database'
import { useToast } from '../context/ToastContext'

interface BankDetailsCardProps {
  bank: BankAccount
  amount: number
}

export function BankDetailsCard({ bank, amount }: BankDetailsCardProps) {
  const { toast } = useToast()

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast(`تم نسخ ${label}`)
  }

  return (
    <div
      className="bg-white rounded-3xl p-6 sm:p-8 border-r-4 shadow-xl shadow-[#39396d]/5"
      style={{
        borderRightColor: '#f9b500',
        borderWidth: '1px',
        borderRightWidth: '5px',
        borderColor: 'rgba(200,197,208,0.30)',
      }}
    >
      <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#39396d]" style={{ fontFamily: 'IBM Plex Sans Arabic' }}>
        <Building2 className="w-5 h-5 text-[#f9b500]" strokeWidth={1.75} />
        بيانات التحويل البنكي
      </h2>

      <div className="space-y-5 text-sm">
        <Row label="مصرف" value={bank.bank_name} />
        <Row label="اسم الحساب" value={bank.account_name} />
        <Row
          label="رقم الآيبان (IBAN)"
          value={bank.iban}
          mono
          highlight
          onCopy={() => copy(bank.iban, 'الآيبان')}
        />
        {bank.account_no && (
          <Row
            label="رقم الحساب"
            value={bank.account_no}
            mono
            onCopy={() => copy(bank.account_no!, 'رقم الحساب')}
          />
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-[#edeef0]">
        <p className="text-[#777680] text-xs mb-1">المبلغ المطلوب تحويله</p>
        <p className="text-2xl font-black text-[#39396d]">
          {amount.toFixed(2)} <span className="text-sm font-semibold text-[#777680]">ر.س</span>
        </p>
      </div>

      <p className="mt-4 text-xs text-[#777680] leading-relaxed">
        يرجى تحويل المبلغ بدقة إلى الحساب المذكور أعلاه من تطبيق البنك الخاص بك، ثم الضغط على الزر أدناه لتأكيد عملية التحويل ورفع الإيصال.
      </p>
    </div>
  )
}

function Row({
  label,
  value,
  mono,
  highlight,
  onCopy,
}: {
  label: string
  value: string
  mono?: boolean
  highlight?: boolean
  onCopy?: () => void
}) {
  return (
    <div className="flex justify-between items-center gap-3">
      <span className="text-[#777680] text-xs shrink-0">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={`font-semibold text-sm truncate ${mono ? 'font-mono tracking-wider' : ''}`}
          style={{ color: highlight ? '#39396d' : '#191c1e' }}
        >
          {value}
        </span>
        {onCopy && (
          <button
            type="button"
            onClick={onCopy}
            className="shrink-0 p-1.5 rounded-lg bg-[#f3f4f6] hover:bg-[#edeef0] text-[#39396d] transition-colors"
            aria-label={`نسخ ${label}`}
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
