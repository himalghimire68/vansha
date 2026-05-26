'use client'

import React from 'react'
import { Users, ChevronRight, ChevronLeft } from 'lucide-react'

interface TreeNodeProps {
  id: string
  name: string
  birthYear: number
  gender?: 'Male' | 'Female'
  isExpanded?: boolean
  hasChildren?: boolean
  onExpand?: (id: string) => void
  onClick?: (id: string) => void
  relationshipBadge?: string
  avatar?: string
}

export const TreeNode: React.FC<TreeNodeProps> = ({
  id,
  name,
  birthYear,
  gender = 'Male',
  isExpanded = false,
  hasChildren = false,
  onExpand,
  onClick,
  relationshipBadge,
  avatar,
}) => {
  const getGenderColor = () => {
    return gender === 'Male' ? 'from-blue-400 to-blue-600' : 'from-pink-400 to-pink-600'
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Main Node Card */}
      <div
        className="group relative cursor-pointer transition-all"
        onClick={() => onClick?.(id)}
      >
        <div
          className={`
            w-24 h-28 rounded-xl shadow-lg border-2 border-white
            bg-gradient-to-br ${getGenderColor()}
            flex flex-col items-center justify-center text-white
            hover:shadow-xl transition transform hover:scale-105
            group-hover:ring-2 ring-forest-300
          `}
        >
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-20 h-20 rounded-lg object-cover"
            />
          ) : (
            <Users size={32} className="mb-1 opacity-80" />
          )}
        </div>

        {/* Expand/Collapse Button */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onExpand?.(id)
            }}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-7 h-7 bg-forest-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-forest-700 transition border-2 border-white group-hover:ring-2 ring-forest-300"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronLeft size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
        )}
      </div>

      {/* Info */}
      <div className="text-center">
        <h4 className="font-semibold text-primary-950 text-sm whitespace-nowrap overflow-ellipsis">
          {name.split(' ')[0]}
        </h4>
        <p className="text-xs text-primary-600">b. {birthYear}</p>
      </div>

      {/* Relationship Badge */}
      {relationshipBadge && (
        <div className="px-2 py-1 bg-heritage-100 text-heritage-700 rounded-full text-xs font-medium border border-heritage-200">
          {relationshipBadge}
        </div>
      )}
    </div>
  )
}

export default TreeNode
