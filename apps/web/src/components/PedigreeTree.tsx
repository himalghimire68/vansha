'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  Edge,
  MiniMap,
  Node,
  NodeTypes,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from 'reactflow'
import dagre from '@dagrejs/dagre'
import 'reactflow/dist/style.css'

import { ApiPerson } from '@/lib/api'
import { computeRelation } from '@/lib/relationshipEngine'
import PersonNode, { PersonNodeData } from './PersonNode'
import Link from 'next/link'

// ── Constants ────────────────────────────────────────────────────────────────
const NODE_W = 130
const NODE_H = 180
const NODE_W_COLLAPSED = 110
const NODE_H_COLLAPSED = 130

const GEN_PALETTE = [
  { bg: '#1b4332', border: '#40916c', light: '#d8f3dc' },
  { bg: '#1e3a5f', border: '#2e86c1', light: '#d6eaf8' },
  { bg: '#0f766e', border: '#0d9488', light: '#ccfbf1' },
  { bg: '#92400e', border: '#d97706', light: '#fef3c7' },
  { bg: '#4a1d96', border: '#7c3aed', light: '#ede9fe' },
  { bg: '#065f46', border: '#059669', light: '#d1fae5' },
]

export type ViewMode = 'pedigree' | 'full'

// ── Build generation map (3-phase BFS) ───────────────────────────────────────
function buildGenMap(people: ApiPerson[]): Map<string, number> {
  const map = new Map(people.map(p => [p.id, p]))
  const genMap = new Map<string, number>()

  for (const p of people) {
    if ((!p.fatherId || !map.has(p.fatherId)) && (!p.motherId || !map.has(p.motherId))) {
      genMap.set(p.id, 0)
    }
  }
  let changed = true, guard = 0
  while (changed && guard++ < 50) {
    changed = false
    for (const p of people) {
      let maxP = -1
      if (p.fatherId && map.has(p.fatherId) && genMap.has(p.fatherId)) maxP = Math.max(maxP, genMap.get(p.fatherId)!)
      if (p.motherId && map.has(p.motherId) && genMap.has(p.motherId)) maxP = Math.max(maxP, genMap.get(p.motherId)!)
      if (maxP < 0) continue
      const want = maxP + 1
      if ((genMap.get(p.id) ?? -1) < want) { genMap.set(p.id, want); changed = true }
    }
  }
  // co-parent alignment
  changed = true; guard = 0
  while (changed && guard++ < 30) {
    changed = false
    for (const child of people) {
      const cg = genMap.get(child.id); if (cg == null) continue
      for (const pid of [child.fatherId, child.motherId]) {
        if (!pid || !map.has(pid)) continue
        if ((genMap.get(pid) ?? 0) < cg - 1) { genMap.set(pid, cg - 1); changed = true }
      }
    }
    for (const p of people) {
      let maxP = -1
      if (p.fatherId && map.has(p.fatherId) && genMap.has(p.fatherId)) maxP = Math.max(maxP, genMap.get(p.fatherId)!)
      if (p.motherId && map.has(p.motherId) && genMap.has(p.motherId)) maxP = Math.max(maxP, genMap.get(p.motherId)!)
      if (maxP < 0) continue
      const want = maxP + 1
      if ((genMap.get(p.id) ?? -1) < want) { genMap.set(p.id, want); changed = true }
    }
  }
  for (const p of people) { if (!genMap.has(p.id)) genMap.set(p.id, 0) }
  const minG = Math.min(...Array.from(genMap.values()))
  if (minG !== 0) for (const [id] of genMap) genMap.set(id, genMap.get(id)! - minG)
  return genMap
}

// ── Pedigree filter: only show ego's direct lineage ──────────────────────────
// Ancestors (unlimited up), ego's own gen (siblings), direct children + grandchildren
function getPedigreeIds(egoId: string, peopleMap: Map<string, ApiPerson>): Set<string> {
  const result = new Set<string>()
  result.add(egoId)

  const ego = peopleMap.get(egoId)
  if (!ego) return result

  // Walk ancestors (BFS upward)
  const ancestorQueue: string[] = [egoId]
  while (ancestorQueue.length > 0) {
    const id = ancestorQueue.shift()!
    const p = peopleMap.get(id)
    if (!p) continue
    for (const pid of [p.fatherId, p.motherId]) {
      if (pid && peopleMap.has(pid) && !result.has(pid)) {
        result.add(pid)
        ancestorQueue.push(pid)
      }
    }
  }

  // Include siblings (share at least one parent with ego)
  for (const p of peopleMap.values()) {
    if (p.id === egoId) continue
    const sharesFather = ego.fatherId && p.fatherId === ego.fatherId
    const sharesMother = ego.motherId && p.motherId === ego.motherId
    if (sharesFather || sharesMother) result.add(p.id)
  }

  // Include children (people whose fatherId or motherId === egoId)
  // and grandchildren
  const childGen: string[] = []
  for (const p of peopleMap.values()) {
    if (p.fatherId === egoId || p.motherId === egoId) { result.add(p.id); childGen.push(p.id) }
  }
  for (const childId of childGen) {
    for (const p of peopleMap.values()) {
      if (p.fatherId === childId || p.motherId === childId) result.add(p.id)
    }
  }

  return result
}

// ── Dagre layout ─────────────────────────────────────────────────────────────
function layoutWithDagre(people: ApiPerson[], edges: Edge[], collapsedIds: Set<string>): Map<string, { x: number; y: number }> {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'TB', ranksep: 90, nodesep: 25, marginx: 40, marginy: 40 })

  for (const p of people) {
    const w = collapsedIds.has(p.id) ? NODE_W_COLLAPSED : NODE_W
    const h = collapsedIds.has(p.id) ? NODE_H_COLLAPSED : NODE_H
    g.setNode(p.id, { width: w, height: h })
  }
  for (const e of edges) { g.setEdge(e.source, e.target) }

  dagre.layout(g)

  const positions = new Map<string, { x: number; y: number }>()
  for (const p of people) {
    const n = g.node(p.id)
    const w = collapsedIds.has(p.id) ? NODE_W_COLLAPSED : NODE_W
    const h = collapsedIds.has(p.id) ? NODE_H_COLLAPSED : NODE_H
    if (n) positions.set(p.id, { x: n.x - w / 2, y: n.y - h / 2 })
  }
  return positions
}

// ── Node types ───────────────────────────────────────────────────────────────
const nodeTypes: NodeTypes = { person: PersonNode }

// ── Node popup ───────────────────────────────────────────────────────────────
function NodePopup({
  person,
  treeId,
  position,
  isMe,
  onClose,
  onAssignRelations,
  onSetMe,
}: {
  person: ApiPerson
  treeId: string
  position: { x: number; y: number }
  isMe: boolean
  onClose: () => void
  onAssignRelations: (p: ApiPerson) => void
  onSetMe: (id: string) => void
}) {
  const isCrossFamily = !!person._crossFamily

  return (
    <div
      style={{
        position: 'fixed',
        left: Math.min(position.x, window.innerWidth - 210),
        top: Math.min(Math.max(position.y, 80), window.innerHeight - 320),
        zIndex: 1000,
        minWidth: 190,
        fontFamily: 'inherit',
      }}
    >
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0',
        borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid #f1f5f9', position: 'relative' }}>
          <button onClick={onClose} style={{
            position: 'absolute', top: 8, right: 8, background: 'none', border: 'none',
            cursor: 'pointer', color: '#94a3b8', fontSize: 14, lineHeight: 1, padding: 2,
          }}>✕</button>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', margin: 0, paddingRight: 20 }}>
            {[person.firstName, person.middleName, person.lastName].filter(Boolean).join(' ')}
          </p>
          {isMe && <span style={{ fontSize: 9, fontWeight: 800, color: '#f59e0b', letterSpacing: 1 }}>👑 ME</span>}
          {isCrossFamily && person._familyName && (
            <p style={{ fontSize: 10, color: '#92400e', margin: '2px 0 0' }}>
              From: {person._familyName}
            </p>
          )}
          {person.gotra && (
            <p style={{ fontSize: 10, color: '#64748b', margin: '2px 0 0' }}>Gotra: {person.gotra}</p>
          )}
        </div>

        {/* Actions */}
        <div style={{ padding: '4px 0' }}>
          {!isMe && (
            <button onClick={() => { onSetMe(person.id); onClose() }}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 14px', fontSize: 12, color: '#b45309', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              className="hover:bg-amber-50 transition-colors">
              👑 Set as Me (perspective anchor)
            </button>
          )}
          <Link href={`/person-profile/${person.id}?familyId=${person.familyId}`} onClick={onClose}
            style={{ display: 'block', padding: '7px 14px', fontSize: 12, color: '#1e3a5f', textDecoration: 'none' }}
            className="hover:bg-slate-50 transition-colors">
            👤 View Profile
          </Link>
          <Link href={`/trees/${treeId}/edit-person/${person.id}`} onClick={onClose}
            style={{ display: 'block', padding: '7px 14px', fontSize: 12, color: '#1e3a5f', textDecoration: 'none' }}
            className="hover:bg-slate-50 transition-colors">
            ✏️ Edit Member
          </Link>
          <button onClick={() => { onAssignRelations(person); onClose() }}
            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 14px', fontSize: 12, color: '#1e3a5f', background: 'none', border: 'none', cursor: 'pointer' }}
            className="hover:bg-slate-50 transition-colors">
            🔗 Link Parents / Offspring
          </button>
          {!isCrossFamily && (
            <>
              <Link href={`/trees/${treeId}/add-person?parentId=${person.id}&parentRole=father`} onClick={onClose}
                style={{ display: 'block', padding: '7px 14px', fontSize: 12, color: '#1e3a5f', textDecoration: 'none' }}
                className="hover:bg-slate-50 transition-colors">
                👶 Add Child
              </Link>
              <Link href={`/trees/${treeId}/add-person?spouseId=${person.id}`} onClick={onClose}
                style={{ display: 'block', padding: '7px 14px', fontSize: 12, color: '#1e3a5f', textDecoration: 'none' }}
                className="hover:bg-slate-50 transition-colors">
                💍 Add Spouse
              </Link>
            </>
          )}
          {isCrossFamily && (
            <Link href={`/trees/${person.familyId}`} onClick={onClose}
              style={{ display: 'block', padding: '7px 14px', fontSize: 12, color: '#92400e', textDecoration: 'none', fontWeight: 600 }}
              className="hover:bg-amber-50 transition-colors">
              🌳 Open {person._familyName} tree ↗
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main tree inner ───────────────────────────────────────────────────────────
interface PedigreeTreeProps {
  people: ApiPerson[]
  treeId: string
  mePersonId?: string | null
  viewMode?: ViewMode
  onAssignRelations: (person: ApiPerson) => void
  onSetMe: (id: string) => void
}

function PedigreeTreeInner({ people, treeId, mePersonId, viewMode = 'pedigree', onAssignRelations, onSetMe }: PedigreeTreeProps) {
  const { fitView } = useReactFlow()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [popup, setPopup] = useState<{ person: ApiPerson; x: number; y: number } | null>(null)

  const peopleMap = useMemo(() => new Map(people.map(p => [p.id, p])), [people])
  const genMap = useMemo(() => buildGenMap(people), [people])

  // External (cross-family) nodes that should render collapsed unless expanded
  const [expandedExternal, setExpandedExternal] = useState<Set<string>>(new Set())

  const collapsedIds = useMemo(() => {
    const s = new Set<string>()
    for (const p of people) {
      if (p._crossFamily && !expandedExternal.has(p.id)) s.add(p.id)
    }
    return s
  }, [people, expandedExternal])

  const handleNodeClick = useCallback((person: ApiPerson) => {
    if (person._crossFamily && !expandedExternal.has(person.id)) {
      // First click on collapsed external node: expand it
      setExpandedExternal(prev => { const s = new Set(prev); s.add(person.id); return s })
      return
    }
    const el = document.querySelector(`[data-id="${person.id}"]`)
    if (el) {
      const rect = el.getBoundingClientRect()
      setPopup({ person, x: rect.right + 10, y: rect.top })
    } else {
      setPopup(prev => prev?.person.id === person.id ? null : { person, x: 200, y: 200 })
    }
  }, [expandedExternal])

  // Pedigree filter
  const visiblePeople = useMemo(() => {
    if (viewMode === 'full') return people
    if (!mePersonId || !peopleMap.has(mePersonId)) return people
    const ids = getPedigreeIds(mePersonId, peopleMap)
    return people.filter(p => ids.has(p.id))
  }, [people, peopleMap, mePersonId, viewMode])

  useEffect(() => {
    if (visiblePeople.length === 0) { setNodes([]); setEdges([]); return }

    // Build edges
    const edgeList: Edge[] = []
    const visibleIds = new Set(visiblePeople.map(p => p.id))
    for (const p of visiblePeople) {
      for (const [parentId, role] of [[p.fatherId, 'father'], [p.motherId, 'mother']] as const) {
        if (!parentId || !visibleIds.has(parentId)) continue
        const genIdx = genMap.get(parentId) ?? 0
        const c = GEN_PALETTE[genIdx % GEN_PALETTE.length]
        edgeList.push({
          id: `${parentId}->${p.id}`,
          source: parentId, target: p.id,
          type: 'smoothstep',
          style: { stroke: c.border, strokeWidth: 1.5, strokeDasharray: role === 'mother' ? '6,3' : '4,2', opacity: 0.75 },
        })
      }
    }

    const positions = layoutWithDagre(visiblePeople, edgeList, collapsedIds)

    const nodeList: Node<PersonNodeData>[] = visiblePeople.map(person => {
      const genIdx = genMap.get(person.id) ?? 0
      const rel = mePersonId ? computeRelation(mePersonId, person.id, peopleMap) : null
      const pos = positions.get(person.id) ?? { x: 0, y: 0 }
      const isEgo = person.id === mePersonId
      const isCollapsed = collapsedIds.has(person.id)

      return {
        id: person.id,
        type: 'person',
        position: pos,
        data: {
          person,
          genIndex: genIdx,
          relationLabel: isEgo ? undefined : rel?.label,
          isEgo,
          isCrossFamily: !!person._crossFamily,
          isCollapsed,
          onClick: handleNodeClick,
        },
        style: { width: isCollapsed ? NODE_W_COLLAPSED : NODE_W },
      }
    })

    setNodes(nodeList)
    setEdges(edgeList)
    setTimeout(() => fitView({ padding: 0.15, duration: 400 }), 100)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visiblePeople, mePersonId, collapsedIds, genMap])

  // Close popup on outside click
  useEffect(() => {
    if (!popup) return
    const handler = (e: MouseEvent) => {
      const el = e.target as HTMLElement
      if (!el.closest('[data-popup="tree"]')) setPopup(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [popup])

  return (
    <>
      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView fitViewOptions={{ padding: 0.15 }}
        minZoom={0.15} maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
        style={{ background: '#f8fafc' }}
      >
        <Background color="#cbd5e1" gap={24} size={1} />
        <Controls style={{
          background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }} />
        <MiniMap
          nodeColor={n => GEN_PALETTE[((n.data as PersonNodeData)?.genIndex ?? 0) % GEN_PALETTE.length].border}
          maskColor="rgba(240,244,248,0.7)"
          style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10 }}
        />
      </ReactFlow>

      {popup && (
        <div data-popup="tree">
          <NodePopup
            person={popup.person}
            treeId={treeId}
            position={{ x: popup.x, y: popup.y }}
            isMe={popup.person.id === mePersonId}
            onClose={() => setPopup(null)}
            onAssignRelations={onAssignRelations}
            onSetMe={(id) => { onSetMe(id); setPopup(null) }}
          />
        </div>
      )}
    </>
  )
}

// ── Public export with provider ───────────────────────────────────────────────
import { ReactFlowProvider } from 'reactflow'

export default function PedigreeTree(props: PedigreeTreeProps) {
  return (
    <ReactFlowProvider>
      <PedigreeTreeInner {...props} />
    </ReactFlowProvider>
  )
}
