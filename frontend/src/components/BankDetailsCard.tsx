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
    <div className="bg-zinc-900 text-white rounded-2xl p-6 sm:p-8">
      <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
        <Building2 className="w-5 h-5 text-solar-gold" strokeWidth={1.75} />
        بيانات التحويل البنكي
      </h2>

      <div className="space-y-4 text-sm">
        <Row label="البنك" value={bank.bank_name} />
        <Row label="اسم الحساب" value={bank.account_name} />
        <Row
          label="الآيبان"
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

      <div className="mt-8 pt-6 border-t border-white/10">
        <p className="text-zinc-400 text-sm mb-1">المبلغ المطلوب تحويله</p>
        <p className="text-3xl font-bold text-solar-gold">{amount.toFixed(2)} <span className="text-lg font-normal text-zinc-400">ر.س</span></p>
      </div>

      <p className="mt-4 text-xs text-zinc-500 leading-relaxed">
        حوّل المبلغ من تطبيق البنك ثم اضغط الزر أدناه لرفع إيصال التحويل
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
      <span className="text-zinc-400 shrink-0">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        <span className={`font-semibold truncate ${mono ? 'font-mono' : ''} ${highlight ? 'text-solar-gold' : ''}`}>
          {value}
        </span>
        {onCopy && (
          <button
            type="button"
            onClick={onCopy}
            className="shrink-0 p-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
            aria-label={`نسخ ${label}`}
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
