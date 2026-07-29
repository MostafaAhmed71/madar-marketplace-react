import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { fetchWishlistIds, toggleWishlist } from '../lib/wishlist'
import { cn } from '../lib/cn'

interface WishlistButtonProps {
  productId: string
  size?: 'sm' | 'md'
  className?: string
}

export function WishlistButton({ productId, size = 'md', className }: WishlistButtonProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [active, setActive] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    fetchWishlistIds().then((ids) => setActive(ids.has(productId)))
  }, [user, productId])

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      navigate('/login')
      return
    }
    setLoading(true)
    try {
      const added = await toggleWishlist(productId)
      setActive(added)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      title={active ? 'إزالة من المفضلة' : 'أضف للمفضلة'}
      className={cn(
        'flex items-center justify-center rounded-lg bg-white shadow-sm border border-zinc-200',
        'hover:border-zinc-300 transition-all disabled:opacity-50',
        size === 'sm' ? 'w-9 h-9' : 'w-10 h-10',
        className
      )}
    >
      <Heart
        className={cn(
          'transition-colors',
          size === 'sm' ? 'w-4 h-4' : 'w-[18px] h-[18px]',
          active ? 'fill-red-500 text-red-500' : 'text-zinc-500'
        )}
        strokeWidth={1.75}
      />
    </button>
  )
}
