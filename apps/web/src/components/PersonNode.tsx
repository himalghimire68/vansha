'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { ApiPerson } from '@/lib/api'

export interface PersonNodeData {
  person: ApiPerson
  relationLabel?: string
  isEgo?: boolean       // "Me" node — gold ring + crown
  isMe?: boolean        // same as isEgo, alias
  isCrossFamily?: boolean
  isCollapsed?: boolean // external family node — show ghost style + expand hint
  genIndex: number
  onClick: (person: ApiPerson) => void
}

const GEN_PALETTE = [
  { bg: '#1b4332', text: '#ffffff', light: '#d8f3dc', border: '#40916c' },
  { bg: '#1e3a5f', text: '#ffffff', light: '#d6eaf8', border: '#2e86c1' },
  { bg: '#0f766e', text: '#ffffff', light: '#ccfbf1', border: '#0d9488' },
  { bg: '#92400e', text: '#ffffff', light: '#fef3c7', border: '#d97706' },
  { bg: '#4a1d96', text: '#ffffff', light: '#ede9fe', border: '#7c3aed' },
  { bg: '#065f46', text: '#ffffff', light: '#d1fae5', border: '#059669' },
]

function PersonNode({ data }: NodeProps<PersonNodeData>) {
  const { person, relationLabel, isEgo, isCrossFamily, isCollapsed, genIndex, onClick } = data
  const c = GEN_PALETTE[genIndex % GEN_PALETTE.length]

  const initials = `${person.firstName?.[0] ?? ''}${person.lastName?.[0] ?? ''}`
  const fullName = [person.firstName, person.middleName, person.lastName].filter(Boolean).join(' ')
  const years = [
    person.birthDate ? new Date(person.birthDate).getFullYear() : null,
    person.deathDate ? new Date(person.deathDate).getFullYear() : null,
  ]
  const yearLabel = years[0] || years[1]
    ? `${years[0] ?? '?'}${years[1] ? ` – ${years[1]}` : ''}`
    : null

  // Collapsed external node — ghost style
  if (isCollapsed) {
    return (
      <div onClick={() => onClick(person)} className="cursor-pointer select-none" style={{ width: 110 }}>
        <Handle type="target" position={Position.Top}
          style={{ background: '#d97706', width: 6, height: 6, border: '2px solid white' }} />
        <div style={{
          background: 'rgba(254,243,199,0.6)',
          border: '1.5px dashed #d97706',
          borderRadius: 14,
          padding: '8px 6px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          opacity: 0.85,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: '#fef3c7', border: '1.5px dashed #d97706',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: '#92400e', fontFamily: 'serif',
          }}>
            {initials}
          </div>
          <p style={{ fontSize: 10, fontWeight: 600, textAlign: 'center', color: '#92400e', maxWidth: 90, lineHeight: '13px' }}>
            {fullName}
          </p>
          <span style={{ fontSize: 8, color: '#92400e', opacity: 0.8 }}>
            {person._familyName ?? 'External family'}
          </span>
          <span style={{
            fontSize: 8, padding: '1px 5px', borderRadius: 6,
            background: '#fde68a', color: '#92400e', fontWeight: 600,
          }}>
            tap to expand ↗
          </span>
        </div>
        <Handle type="source" position={Position.Bottom}
          style={{ background: '#d97706', width: 6, height: 6, border: '2px solid white' }} />
      </div>
    )
  }

  return (
    <div onClick={() => onClick(person)} className="cursor-pointer select-none" style={{ width: 120 }}>
      <Handle type="target" position={Position.Top}
        style={{ background: c.border, width: 8, height: 8, border: '2px solid white' }} />

      <div style={{
        background: isEgo ? c.bg : '#fff',
        border: isEgo ? `3px solid #f59e0b` : `2px solid ${c.border}`,
        borderRadius: 16,
        padding: '10px 8px 8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        boxShadow: isEgo
          ? `0 0 0 4px rgba(245,158,11,0.25), 0 4px 20px rgba(0,0,0,0.2)`
          : isCrossFamily
          ? '0 2px 8px rgba(0,0,0,0.1)'
          : '0 1px 4px rgba(0,0,0,0.08)',
        position: 'relative',
        transition: 'box-shadow 0.15s, transform 0.15s',
      }}
        className="hover:shadow-lg hover:scale-105"
      >
        {/* Crown badge for "Me" */}
        {isEgo && (
          <div style={{
            position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
            fontSize: 16, lineHeight: 1,
          }} title="This is you">👑</div>
        )}

        {/* Avatar */}
        <div style={{
          width: 52, height: 52, borderRadius: '50%', overflow: 'hidden',
          border: isEgo ? `2px solid #f59e0b` : `2px solid ${c.border}`,
          background: c.light, position: 'relative', flexShrink: 0,
        }}>
          {person.photoUrl ? (
            <img src={person.photoUrl} alt={person.firstName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 700, color: isEgo ? '#fff' : c.bg,
              background: isEgo ? c.bg : c.light, fontFamily: 'serif',
            }}>
              {initials}
            </div>
          )}
          <span style={{
            position: 'absolute', bottom: 2, right: 2, width: 10, height: 10,
            borderRadius: '50%', background: person.isLiving ? '#40916c' : '#9ca3af',
            border: '2px solid white',
          }} />
        </div>

        {/* Name */}
        <p style={{
          fontSize: 11, fontWeight: 600, textAlign: 'center', lineHeight: '14px',
          color: isEgo ? '#fff' : '#1a1a1a', maxWidth: 100, wordBreak: 'break-word',
        }}>
          {fullName}
        </p>

        {yearLabel && (
          <p style={{ fontSize: 9, color: isEgo ? 'rgba(255,255,255,0.7)' : '#6b7280', textAlign: 'center' }}>
            {yearLabel}
          </p>
        )}

        {/* ME badge */}
        {isEgo && (
          <span style={{
            fontSize: 9, fontWeight: 800, padding: '1px 6px', borderRadius: 8,
            background: '#f59e0b', color: '#fff', letterSpacing: 1,
          }}>ME</span>
        )}

        {/* Relation badge */}
        {relationLabel && !isEgo && (
          <span style={{
            fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 8,
            background: c.bg, color: '#fff', textAlign: 'center',
            maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }} title={relationLabel}>
            {relationLabel}
          </span>
        )}

        {/* Cross-family badge */}
        {isCrossFamily && !isEgo && person._familyName && (
          <span style={{
            fontSize: 8, padding: '1px 5px', borderRadius: 6,
            background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a',
            maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap', textAlign: 'center',
          }} title={person._familyName}>
            {person._familyName}
          </span>
        )}
      </div>

      <Handle type="source" position={Position.Bottom}
        style={{ background: c.border, width: 8, height: 8, border: '2px solid white' }} />
    </div>
  )
}

export default memo(PersonNode)
