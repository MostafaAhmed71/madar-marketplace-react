interface LoadingSpinnerProps {
  text?: string
}

export function LoadingSpinner({ text = 'جاري التحميل...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
      <div className="relative w-14 h-14 mb-5">
        <div className="absolute inset-0 rounded-full border-4 border-orbit-purple/20" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orbit-purple border-r-solar-gold animate-spin" />
      </div>
      <p className="text-gray-500 font-medium animate-pulse">{text}</p>
    </div>
  )
}
