'use client'

import React, { useEffect, useRef, useState } from 'react'
import { ChevronUp, ChevronDown, ZoomIn, ZoomOut, Home } from 'lucide-react'

interface TreeNode {
  id: string
  name: string
  birthYear: number
  avatar?: string
  children?: TreeNode[]
  parent?: TreeNode
}

interface TreeVisualizationProps {
  data: TreeNode
  onNodeClick?: (node: TreeNode) => void
  expandedNodes?: Set<string>
  onNodeExpand?: (nodeId: string) => void
}

export const TreeVisualization: React.FC<TreeVisualizationProps> = ({
  data,
  onNodeClick,
  expandedNodes = new Set(),
  onNodeExpand,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const handleZoom = (direction: 'in' | 'out') => {
    setZoom((prev) => {
      const newZoom = direction === 'in' ? prev * 1.2 : prev / 1.2
      return Math.max(0.5, Math.min(newZoom, 3))
    })
  }

  const handlePanStart = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handlePanMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handlePanEnd = () => {
    setIsDragging(false)
  }

  const handleResetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-96 sm:h-screen bg-gradient-to-br from-primary-50 to-forest-50 border border-primary-200 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
      onMouseDown={handlePanStart}
      onMouseMove={handlePanMove}
      onMouseUp={handlePanEnd}
      onMouseLeave={handlePanEnd}
    >
      {/* Canvas with tree */}
      <div
        className="absolute transition-transform"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        <TreeNodeComponent
          node={data}
          level={0}
          expanded={expandedNodes.has(data.id)}
          onExpand={onNodeExpand}
          onNodeClick={onNodeClick}
          expandedNodes={expandedNodes}
        />
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
        <button
          onClick={() => handleZoom('in')}
          className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition text-primary-600 border border-primary-200"
          title="Zoom in"
        >
          <ZoomIn size={20} />
        </button>
        <button
          onClick={() => handleZoom('out')}
          className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition text-primary-600 border border-primary-200"
          title="Zoom out"
        >
          <ZoomOut size={20} />
        </button>
        <button
          onClick={handleResetView}
          className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition text-primary-600 border border-primary-200"
          title="Reset view"
        >
          <Home size={20} />
        </button>
      </div>
    </div>
  )
}

interface TreeNodeComponentProps {
  node: TreeNode
  level: number
  expanded: boolean
  onExpand?: (nodeId: string) => void
  onNodeClick?: (node: TreeNode) => void
  expandedNodes: Set<string>
}

const TreeNodeComponent: React.FC<TreeNodeComponentProps> = ({
  node,
  level,
  expanded,
  onExpand,
  onNodeClick,
  expandedNodes,
}) => {
  const hasChildren = node.children && node.children.length > 0

  return (
    <div
      className="flex flex-col items-center"
      style={{
        marginLeft: `${level > 0 ? 80 : 0}px`,
      }}
    >
      {/* Node */}
      <div
        className="group cursor-pointer mb-4 transition-all"
        onClick={() => onNodeClick?.(node)}
      >
        <div className="relative">
          <div
            className="w-20 h-20 rounded-lg bg-gradient-to-br from-forest-400 to-forest-600 flex flex-col items-center justify-center text-white shadow-lg group-hover:shadow-xl transition transform group-hover:scale-110 border-2 border-white"
            onDoubleClick={(e) => {
              e.stopPropagation()
              onExpand?.(node.id)
            }}
          >
            <div className="text-xs font-bold text-center px-1">{node.name.split(' ')[0]}</div>
            <div className="text-xs opacity-90">{node.birthYear}</div>
          </div>

          {/* Expand button */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onExpand?.(node.id)
              }}
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-forest-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-forest-700 transition border border-white"
              title={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="flex gap-8">
          {node.children!.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              expanded={expandedNodes.has(child.id)}
              onExpand={onExpand}
              onNodeClick={onNodeClick}
              expandedNodes={expandedNodes}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default TreeVisualization
