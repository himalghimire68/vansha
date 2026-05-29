import { ApiPerson } from './api'

export interface RelationResult {
  label: string      // "Paternal Grandfather", "1st Cousin", etc.
  distance: number   // hop count
}

/**
 * BFS-based relationship calculator.
 * Finds the relationship from `ego` to `target` in the given people map.
 * Returns null if no relationship is found within 8 hops.
 */
export function computeRelation(
  egoId: string,
  targetId: string,
  peopleMap: Map<string, ApiPerson>,
): RelationResult | null {
  if (egoId === targetId) return { label: 'You', distance: 0 }

  const ego = peopleMap.get(egoId)
  const target = peopleMap.get(targetId)
  if (!ego || !target) return null

  // Build child map: parentId → childIds
  const childMap = new Map<string, string[]>()
  for (const p of peopleMap.values()) {
    if (p.fatherId) {
      if (!childMap.has(p.fatherId)) childMap.set(p.fatherId, [])
      childMap.get(p.fatherId)!.push(p.id)
    }
    if (p.motherId) {
      if (!childMap.has(p.motherId)) childMap.set(p.motherId, [])
      childMap.get(p.motherId)!.push(p.id)
    }
  }

  // BFS state: { id, path of (id, direction) }
  type Step = { id: string; path: { id: string; dir: 'up' | 'down' }[] }

  const visited = new Set<string>()
  const queue: Step[] = [{ id: egoId, path: [] }]
  visited.add(egoId)

  while (queue.length > 0) {
    const { id, path } = queue.shift()!
    if (path.length > 8) continue

    const person = peopleMap.get(id)
    if (!person) continue

    // Go up to parents
    for (const parentId of [person.fatherId, person.motherId]) {
      if (!parentId || visited.has(parentId)) continue
      const parent = peopleMap.get(parentId)
      if (!parent) continue
      visited.add(parentId)
      const newPath = [...path, { id: parentId, dir: 'up' as const }]
      if (parentId === targetId) return describeFromPath(egoId, targetId, newPath, peopleMap)
      queue.push({ id: parentId, path: newPath })
    }

    // Go down to children
    const children = childMap.get(id) ?? []
    for (const childId of children) {
      if (visited.has(childId)) continue
      const child = peopleMap.get(childId)
      if (!child) continue
      visited.add(childId)
      const newPath = [...path, { id: childId, dir: 'down' as const }]
      if (childId === targetId) return describeFromPath(egoId, targetId, newPath, peopleMap)
      queue.push({ id: childId, path: newPath })
    }
  }

  return null
}

function describeFromPath(
  egoId: string,
  targetId: string,
  path: { id: string; dir: 'up' | 'down' }[],
  peopleMap: Map<string, ApiPerson>,
): RelationResult {
  const target = peopleMap.get(targetId)!
  const isFemale = target.gender?.toLowerCase() === 'female' || target.gender?.toLowerCase() === 'f'
  const distance = path.length

  const ups = path.filter(s => s.dir === 'up').length
  const downs = path.filter(s => s.dir === 'down').length

  // Pure upward — ancestors
  if (downs === 0) {
    return { label: ancestorLabel(ups, isFemale, egoId, path, peopleMap), distance }
  }

  // Pure downward — descendants
  if (ups === 0) {
    return { label: descendantLabel(downs, isFemale), distance }
  }

  // One up then one down → sibling
  if (ups === 1 && downs === 1) {
    const ego = peopleMap.get(egoId)!
    const commonAncestorId = path[0].id
    const commonAncestor = peopleMap.get(commonAncestorId)!
    const isMaternal = commonAncestorId === ego.motherId
    const sideLabel = isMaternal ? 'Maternal' : 'Paternal'
    // For siblings label we need to figure out if it's actually a sibling or half-sibling
    return { label: siblingLabel(isFemale, sideLabel, egoId, targetId, peopleMap), distance }
  }

  // Up then down — cousin, uncle/aunt, nephew/niece pattern
  // ups=2, downs=1 → uncle/aunt
  if (ups === 2 && downs === 1) {
    return { label: uncleAuntLabel(ups, isFemale, egoId, path, peopleMap), distance }
  }

  // ups=1, downs=2 → nephew/niece
  if (ups === 1 && downs === 2) {
    return { label: isFemale ? 'Niece' : 'Nephew', distance }
  }

  // ups=2, downs=2 → 1st cousin
  if (ups === 2 && downs === 2) {
    const cousinSide = cousinSideLabel(egoId, path, peopleMap)
    return { label: `1st Cousin${cousinSide}`, distance }
  }

  // ups=3, downs=1 → great-uncle/aunt
  if (ups === 3 && downs === 1) {
    return { label: isFemale ? 'Great-Aunt' : 'Great-Uncle', distance }
  }

  // ups=1, downs=3 → great-nephew/niece
  if (ups === 1 && downs === 3) {
    return { label: isFemale ? 'Great-Niece' : 'Great-Nephew', distance }
  }

  // ups=3, downs=2 → 1st cousin once removed
  if (ups === 3 && downs === 2) {
    return { label: `1st Cousin Once Removed`, distance }
  }

  // ups=2, downs=3 → 1st cousin once removed
  if (ups === 2 && downs === 3) {
    return { label: `1st Cousin Once Removed`, distance }
  }

  // ups=3, downs=3 → 2nd cousin
  if (ups === 3 && downs === 3) {
    return { label: `2nd Cousin`, distance }
  }

  // ups=4, downs=4 → 3rd cousin
  if (ups === 4 && downs === 4) {
    return { label: `3rd Cousin`, distance }
  }

  return { label: `Distant Relation (${ups} up, ${downs} down)`, distance }
}

function ancestorLabel(
  ups: number,
  isFemale: boolean,
  egoId: string,
  path: { id: string; dir: 'up' | 'down' }[],
  peopleMap: Map<string, ApiPerson>,
): string {
  const ego = peopleMap.get(egoId)!
  // Check if target is directly the father or mother
  if (ups === 1) {
    const targetId = path[0].id
    if (targetId === ego.fatherId) return 'Father'
    if (targetId === ego.motherId) return 'Mother'
    return isFemale ? 'Mother' : 'Father'
  }

  // Determine maternal/paternal side
  const firstAncestorId = path[0].id
  const isMaternal = firstAncestorId === ego.motherId
  const side = isMaternal ? 'Maternal' : 'Paternal'

  if (ups === 2) return `${side} Grandfather${isFemale ? '' : ''}`.replace('Grandfather', isFemale ? 'Grandmother' : 'Grandfather')
  if (ups === 3) return `${side} Great-Grand${isFemale ? 'mother' : 'father'}`
  if (ups >= 4) return `${side} ${ordinal(ups - 2)} Great-Grand${isFemale ? 'mother' : 'father'}`
  return isFemale ? 'Ancestor' : 'Ancestor'
}

function descendantLabel(downs: number, isFemale: boolean): string {
  if (downs === 1) return isFemale ? 'Daughter' : 'Son'
  if (downs === 2) return isFemale ? 'Granddaughter' : 'Grandson'
  if (downs === 3) return `Great-Grand${isFemale ? 'daughter' : 'son'}`
  return `${ordinal(downs - 2)} Great-Grand${isFemale ? 'daughter' : 'son'}`
}

function siblingLabel(
  isFemale: boolean,
  _sideLabel: string,
  egoId: string,
  targetId: string,
  peopleMap: Map<string, ApiPerson>,
): string {
  const ego = peopleMap.get(egoId)!
  const target = peopleMap.get(targetId)!

  const sameFather = ego.fatherId && ego.fatherId === target.fatherId
  const sameMother = ego.motherId && ego.motherId === target.motherId
  const fullSibling = sameFather && sameMother
  const half = fullSibling ? '' : 'Half-'

  // Elder/Younger based on birth date or birth order
  let elder: boolean | null = null
  const egoOrder = (ego as ApiPerson & { birthOrder?: number }).birthOrder
  const targetOrder = (target as ApiPerson & { birthOrder?: number }).birthOrder
  if (egoOrder != null && targetOrder != null) {
    elder = targetOrder < egoOrder  // target is older if lower birth order
  } else if (ego.birthDate && target.birthDate) {
    elder = new Date(target.birthDate) < new Date(ego.birthDate)
  }

  const agePrefix = elder === true ? 'Elder ' : elder === false ? 'Younger ' : ''
  const base = isFemale ? 'Sister' : 'Brother'
  return `${half}${agePrefix}${base}`
}

function uncleAuntLabel(
  _ups: number,
  isFemale: boolean,
  egoId: string,
  path: { id: string; dir: 'up' | 'down' }[],
  peopleMap: Map<string, ApiPerson>,
): string {
  const ego = peopleMap.get(egoId)!
  const firstAncestorId = path[0].id
  const isMaternal = firstAncestorId === ego.motherId
  const side = isMaternal ? 'Maternal' : 'Paternal'
  return `${side} ${isFemale ? 'Aunt' : 'Uncle'}`
}

function cousinSideLabel(
  egoId: string,
  path: { id: string; dir: 'up' | 'down' }[],
  peopleMap: Map<string, ApiPerson>,
): string {
  const ego = peopleMap.get(egoId)!
  const firstAncestorId = path[0].id
  const isMaternal = firstAncestorId === ego.motherId
  return isMaternal ? ' (Maternal)' : ' (Paternal)'
}

function ordinal(n: number): string {
  if (n === 1) return '1st'
  if (n === 2) return '2nd'
  if (n === 3) return '3rd'
  return `${n}th`
}
