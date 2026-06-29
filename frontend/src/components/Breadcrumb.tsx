import { Link } from 'react-router-dom'
import type { MarketCategory } from '../types/database'

interface BreadcrumbProps {
  items: { label: string; to?: string }[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="text-sm text-gray-500 mb-6 flex flex-wrap items-center gap-1">
      <Link to="/marketplace" className="hover:text-orbit-purple">
        المتجر
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <span>/</span>
          {item.to ? (
            <Link to={item.to} className="hover:text-orbit-purple">
              {item.label}
            </Link>
          ) : (
            <span className="text-space-black">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

interface CategoryBadgeProps {
  category: MarketCategory
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <Link
      to={`/marketplace/category/${category.slug}`}
      className="inline-flex items-center gap-1 text-sm bg-nebula-laven/10 text-nebula-laven px-3 py-1 rounded-full hover:bg-nebula-laven/20 transition-colors"
    >
      {category.icon && <span>{category.icon}</span>}
      {category.name_ar}
    </Link>
  )
}
