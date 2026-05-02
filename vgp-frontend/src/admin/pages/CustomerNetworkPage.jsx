import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  Handle,
  Position,
  EdgeLabelRenderer,
  BaseEdge,
  getBezierPath,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  useCustomerNetwork,
  useCreateNode, useUpdateNode, useDeleteNode, useUpdateNodePosition,
  useCreateRelation, useUpdateRelation, useDeleteRelation,
  useCreateGroup, useUpdateGroup, useDeleteGroup,
} from '../hooks/useCustomerNetwork';

// ── Custom node ───────────────────────────────────────────────────────────────
const CustomerNode = ({ data, selected }) => {
  const bg = data.groupColor || '#3b82f6';
  return (
    <div
      style={{
        background: '#fff',
        border: `2px solid ${selected ? '#f59e0b' : bg}`,
        borderRadius: 10,
        padding: '8px 14px',
        minWidth: 140,
        boxShadow: selected ? `0 0 0 3px ${bg}44` : '0 2px 8px rgba(0,0,0,0.12)',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      <Handle type="target" position={Position.Top}    style={{ background: bg }} />
      <Handle type="source" position={Position.Bottom} style={{ background: bg }} />
      <Handle type="target" position={Position.Left}   style={{ background: bg }} />
      <Handle type="source" position={Position.Right}  style={{ background: bg }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0,
        }}>
          {data.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 100 }}>
            {data.name}
          </div>
          {data.phone && (
            <div style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap' }}>{data.phone}</div>
          )}
        </div>
      </div>
      {data.groupName && (
        <div style={{
          marginTop: 4, fontSize: 10, color: '#fff', background: bg,
          borderRadius: 9999, padding: '1px 7px', display: 'inline-block',
        }}>
          {data.groupName}
        </div>
      )}
    </div>
  );
};

// ── Custom edge with label ────────────────────────────────────────────────────
const LabeledEdge = ({ id, sourceX, sourceY, targetX, targetY, label, data, markerEnd, style }) => {
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, targetX, targetY });
  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: '#fff',
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              padding: '2px 8px',
              fontSize: 11,
              fontWeight: 600,
              color: '#475569',
              pointerEvents: 'all',
              cursor: 'pointer',
              zIndex: 10,
            }}
            className="nodrag nopan"
            onDoubleClick={() => data?.onLabelDblClick?.(id)}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

const NODE_TYPES = { customerNode: CustomerNode };
const EDGE_TYPES = { labeled: LabeledEdge };

// ── Helpers ───────────────────────────────────────────────────────────────────
const EMPTY_NODE_FORM = { name: '', phone: '', email: '', address: '', description: '', notes: '', tags: '', groupIds: [] };
const EMPTY_GROUP_FORM = { name: '', color: '#3b82f6', description: '' };

const NODE_W = 180;
const NODE_H = 90;

// Spiral outward from `preferred` until a non-overlapping spot is found.
const findFreePosition = (existingNodes, preferred) => {
  const gap = 24;
  const stepX = NODE_W + gap;
  const stepY = NODE_H + gap;

  const overlaps = (pos) =>
    existingNodes.some(
      (n) =>
        Math.abs((n.position?.x ?? 0) - pos.x) < stepX &&
        Math.abs((n.position?.y ?? 0) - pos.y) < stepY,
    );

  if (!overlaps(preferred)) return preferred;

  // Clockwise spiral: right → down → left → up, expanding radius each full ring
  let x = preferred.x;
  let y = preferred.y;
  let step = 1;
  while (step <= 30) {
    // move right
    for (let i = 0; i < step; i++) {
      x += stepX;
      const pos = { x: Math.round(x), y: Math.round(y) };
      if (!overlaps(pos)) return pos;
    }
    // move down
    for (let i = 0; i < step; i++) {
      y += stepY;
      const pos = { x: Math.round(x), y: Math.round(y) };
      if (!overlaps(pos)) return pos;
    }
    step++;
    // move left
    for (let i = 0; i < step; i++) {
      x -= stepX;
      const pos = { x: Math.round(x), y: Math.round(y) };
      if (!overlaps(pos)) return pos;
    }
    // move up
    for (let i = 0; i < step; i++) {
      y -= stepY;
      const pos = { x: Math.round(x), y: Math.round(y) };
      if (!overlaps(pos)) return pos;
    }
    step++;
  }

  // Absolute fallback
  return { x: preferred.x + Math.round(Math.random() * 400), y: preferred.y + Math.round(Math.random() * 400) };
};

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CustomerNetworkPage() {
  const { data: networkData, isLoading } = useCustomerNetwork();

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState([]);

  // Modals
  const [nodeModal, setNodeModal]   = useState(null); // null | { mode: 'create'|'edit', data }
  const [groupModal, setGroupModal] = useState(null); // null | { mode: 'create'|'edit', data }
  const [edgeLabelModal, setEdgeLabelModal] = useState(null); // null | { id, label }
  const [detailNode, setDetailNode] = useState(null);
  const [search, setSearch]         = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null); // { type, id, name }

  // Form state
  const [nodeForm, setNodeForm]   = useState(EMPTY_NODE_FORM);
  const [groupForm, setGroupForm] = useState(EMPTY_GROUP_FORM);
  const [edgeLabelInput, setEdgeLabelInput] = useState('');

  const createNode    = useCreateNode();
  const updateNode    = useUpdateNode();
  const deleteNode    = useDeleteNode();
  const updatePos     = useUpdateNodePosition();
  const createRel     = useCreateRelation();
  const updateRel     = useUpdateRelation();
  const deleteRel     = useDeleteRelation();
  const createGroup   = useCreateGroup();
  const updateGroup   = useUpdateGroup();
  const deleteGroup   = useDeleteGroup();

  const groups = useMemo(() => networkData?.data?.groups || [], [networkData]);
  const groupMap = useMemo(() => Object.fromEntries(groups.map(g => [String(g._id), g])), [groups]);

  // Build React Flow nodes from API data
  useEffect(() => {
    if (!networkData?.data) return;
    const { nodes, relations, groups: grps } = networkData.data;
    const gmap = Object.fromEntries(grps.map(g => [String(g._id), g]));

    const rfN = nodes.map(n => {
      const primaryGroup = n.groupIds?.[0] ? gmap[String(n.groupIds[0])] : null;
      return {
        id: String(n._id),
        type: 'customerNode',
        position: n.position || { x: 100, y: 100 },
        data: {
          ...n,
          groupColor: primaryGroup?.color || '#3b82f6',
          groupName: primaryGroup?.name || null,
        },
      };
    });

    const rfE = relations.map(r => ({
      id: String(r._id),
      source: String(r.from),
      target: String(r.to),
      type: 'labeled',
      label: r.label || '',
      data: { onLabelDblClick: (eid) => openEdgeLabelModal(eid, r.label) },
      markerEnd: { type: 'arrowclosed', color: '#94a3b8' },
      style: { stroke: '#94a3b8' },
    }));

    setRfNodes(rfN);
    setRfEdges(rfE);
  }, [networkData]);

  // Highlight search
  useEffect(() => {
    if (!search) {
      setRfNodes(nds => nds.map(n => ({ ...n, style: undefined })));
      return;
    }
    const q = search.toLowerCase();
    setRfNodes(nds => nds.map(n => {
      const hit = n.data.name?.toLowerCase().includes(q) ||
        n.data.phone?.includes(q) ||
        n.data.email?.toLowerCase().includes(q);
      return { ...n, style: hit ? { opacity: 1 } : { opacity: 0.25 } };
    }));
  }, [search]);

  // Drag end → save position
  const onNodeDragStop = useCallback((_, node) => {
    updatePos.mutate({ id: node.id, x: node.position.x, y: node.position.y });
  }, [updatePos]);

  // Connect two nodes → create relation
  const onConnect = useCallback((params) => {
    createRel.mutate({ from: params.source, to: params.target, label: '' }, {
      onSuccess: (res) => {
        const r = res.data;
        setRfEdges(eds => addEdge({
          id: String(r._id),
          source: String(r.from),
          target: String(r.to),
          type: 'labeled',
          label: '',
          data: { onLabelDblClick: (eid) => openEdgeLabelModal(eid, '') },
          markerEnd: { type: 'arrowclosed', color: '#94a3b8' },
          style: { stroke: '#94a3b8' },
        }, eds));
      },
    });
  }, [createRel]);

  const onNodesDelete = useCallback((deletedNodes) => {
    deletedNodes.forEach(n => deleteNode.mutate(n.id));
  }, [deleteNode]);

  const onEdgesDelete = useCallback((deletedEdges) => {
    deletedEdges.forEach(e => deleteRel.mutate(e.id));
  }, [deleteRel]);

  // ── Edge label modal ────────────────────────────────────────────────────────
  const openEdgeLabelModal = (id, label) => {
    setEdgeLabelModal({ id, label: label || '' });
    setEdgeLabelInput(label || '');
  };

  const saveEdgeLabel = () => {
    if (!edgeLabelModal) return;
    updateRel.mutate({ id: edgeLabelModal.id, label: edgeLabelInput }, {
      onSuccess: () => {
        setRfEdges(eds => eds.map(e => e.id === edgeLabelModal.id
          ? { ...e, label: edgeLabelInput, data: { ...e.data, onLabelDblClick: (eid) => openEdgeLabelModal(eid, edgeLabelInput) } }
          : e
        ));
        setEdgeLabelModal(null);
      },
    });
  };

  // ── Node modal ──────────────────────────────────────────────────────────────
  const openCreateNode = () => {
    setNodeForm(EMPTY_NODE_FORM);
    setNodeModal({ mode: 'create' });
  };

  const openEditNode = (node) => {
    setNodeForm({
      name: node.name || '',
      phone: node.phone || '',
      email: node.email || '',
      address: node.address || '',
      description: node.description || '',
      notes: node.notes || '',
      tags: (node.tags || []).join(', '),
      groupIds: node.groupIds?.map(String) || [],
    });
    setNodeModal({ mode: 'edit', id: node._id || node.id });
  };

  const saveNode = () => {
    const payload = {
      ...nodeForm,
      tags: nodeForm.tags.split(',').map(t => t.trim()).filter(Boolean),
    };
    if (nodeModal.mode === 'create') {
      // Preferred position: centroid of nodes in the chosen groups, else centroid of all nodes, else default.
      let preferred = { x: 200, y: 200 };
      const groupSet = new Set(nodeForm.groupIds);
      const peers = groupSet.size > 0
        ? rfNodes.filter(n => n.data.groupIds?.some(gid => groupSet.has(String(gid))))
        : rfNodes;
      if (peers.length > 0) {
        preferred = {
          x: Math.round(peers.reduce((s, n) => s + n.position.x, 0) / peers.length),
          y: Math.round(peers.reduce((s, n) => s + n.position.y, 0) / peers.length),
        };
      }
      payload.position = findFreePosition(rfNodes, preferred);
      createNode.mutate(payload, { onSuccess: () => setNodeModal(null) });
    } else {
      updateNode.mutate({ id: nodeModal.id, ...payload }, { onSuccess: () => { setNodeModal(null); setDetailNode(null); } });
    }
  };

  // ── Group modal ─────────────────────────────────────────────────────────────
  const openCreateGroup = () => {
    setGroupForm(EMPTY_GROUP_FORM);
    setGroupModal({ mode: 'create' });
  };

  const openEditGroup = (g) => {
    setGroupForm({ name: g.name, color: g.color, description: g.description || '' });
    setGroupModal({ mode: 'edit', id: g._id });
  };

  const saveGroup = () => {
    if (groupModal.mode === 'create') {
      createGroup.mutate(groupForm, { onSuccess: () => setGroupModal(null) });
    } else {
      updateGroup.mutate({ id: groupModal.id, ...groupForm }, { onSuccess: () => setGroupModal(null) });
    }
  };

  // ── Node detail panel ───────────────────────────────────────────────────────
  const onNodeClick = useCallback((_, node) => {
    setDetailNode(node.data);
  }, []);

  if (isLoading) {
    return <div className="p-4 text-center text-muted">Đang tải mạng lưới khách hàng...</div>;
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', flexDirection: 'column' }}>
      {/* Toolbar */}
      <div className="d-flex align-items-center gap-2 px-3 py-2 border-bottom bg-white" style={{ flexShrink: 0, flexWrap: 'wrap' }}>
        <h5 className="mb-0 mr-3 font-weight-bold">Mạng Lưới Khách Hàng</h5>

        <input
          className="form-control form-control-sm mr-2"
          style={{ width: 200 }}
          placeholder="Tìm khách hàng..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <button className="btn btn-sm btn-primary mr-1" onClick={openCreateNode}>
          + Thêm khách hàng
        </button>
        <button className="btn btn-sm btn-outline-secondary" onClick={openCreateGroup}>
          + Nhóm
        </button>

        {groups.length > 0 && (
          <div className="d-flex align-items-center gap-1 ml-2" style={{ flexWrap: 'wrap' }}>
            {groups.map(g => (
              <span
                key={g._id}
                style={{ background: g.color, color: '#fff', borderRadius: 9999, padding: '2px 10px', fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                onDoubleClick={() => openEditGroup(g)}
                title="Double-click để sửa"
              >
                {g.name}
                <button
                  style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, lineHeight: 1, fontSize: 13, marginLeft: 2 }}
                  onClick={(e) => { e.stopPropagation(); setConfirmDelete({ type: 'group', id: g._id, name: g.name }); }}
                >×</button>
              </span>
            ))}
          </div>
        )}

        <div className="ml-auto text-muted small">
          Kéo nút để kết nối · Double-click nhãn để sửa · Nhấn Delete để xóa
        </div>
      </div>

      {/* Canvas + Detail panel */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ flex: 1 }}>
          <ReactFlow
            nodes={rfNodes}
            edges={rfEdges}
            nodeTypes={NODE_TYPES}
            edgeTypes={EDGE_TYPES}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDragStop={onNodeDragStop}
            onNodeClick={onNodeClick}
            onNodesDelete={onNodesDelete}
            onEdgesDelete={onEdgesDelete}
            deleteKeyCode="Delete"
            fitView
            fitViewOptions={{ padding: 0.2 }}
          >
            <Background color="#e2e8f0" gap={20} />
            <Controls />
            <MiniMap
              nodeColor={n => n.data?.groupColor || '#3b82f6'}
              style={{ background: '#f8fafc' }}
            />
          </ReactFlow>
        </div>

        {/* Detail panel */}
        {detailNode && (
          <div style={{ width: 290, borderLeft: '1px solid #e2e8f0', background: '#fff', overflowY: 'auto', flexShrink: 0 }}>
            <div className="p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0 font-weight-bold">Chi tiết</h6>
                <button className="btn btn-link btn-sm p-0 text-muted" onClick={() => setDetailNode(null)}>×</button>
              </div>

              {/* Avatar + name */}
              <div className="text-center mb-3">
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: detailNode.groupColor || '#3b82f6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 22, margin: '0 auto 8px',
                }}>
                  {detailNode.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="font-weight-bold">{detailNode.name}</div>
              </div>

              {/* Info fields */}
              {[
                ['Điện thoại', detailNode.phone],
                ['Email', detailNode.email],
                ['Địa chỉ', detailNode.address],
                ['Mô tả', detailNode.description],
                ['Ghi chú', detailNode.notes],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label} className="mb-2">
                  <div className="text-muted small">{label}</div>
                  <div style={{ fontSize: 14, wordBreak: 'break-word' }}>{value}</div>
                </div>
              ))}

              {detailNode.tags?.length > 0 && (
                <div className="mb-2">
                  <div className="text-muted small mb-1">Tags</div>
                  <div className="d-flex flex-wrap gap-1">
                    {detailNode.tags.map(t => (
                      <span key={t} className="badge badge-secondary">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Group membership */}
              {groups.length > 0 && (
                <div className="mt-3">
                  <div className="text-muted small mb-2">Nhóm</div>
                  <div className="d-flex flex-wrap" style={{ gap: 6 }}>
                    {groups.map(g => {
                      const nodeGroupIds = (detailNode.groupIds || []).map(String);
                      const inGroup = nodeGroupIds.includes(String(g._id));
                      return (
                        <button
                          key={g._id}
                          onClick={() => {
                            const currentIds = (detailNode.groupIds || []).map(String);
                            const newIds = inGroup
                              ? currentIds.filter(id => id !== String(g._id))
                              : [...currentIds, String(g._id)];
                            updateNode.mutate(
                              { id: detailNode._id, groupIds: newIds },
                              {
                                onSuccess: () => {
                                  setDetailNode(prev => ({ ...prev, groupIds: newIds }));
                                },
                              },
                            );
                          }}
                          disabled={updateNode.isPending}
                          style={{
                            border: `2px solid ${g.color}`,
                            borderRadius: 9999,
                            padding: '2px 12px',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            background: inGroup ? g.color : '#fff',
                            color: inGroup ? '#fff' : g.color,
                            transition: 'all 0.15s',
                          }}
                        >
                          {inGroup && <span style={{ marginRight: 4 }}>✓</span>}
                          {g.name}
                        </button>
                      );
                    })}
                  </div>
                  {groups.length === 0 && (
                    <div className="text-muted small">Chưa có nhóm nào. Tạo nhóm từ toolbar.</div>
                  )}
                </div>
              )}

              <div className="d-flex gap-2 mt-3">
                <button className="btn btn-sm btn-primary flex-fill" onClick={() => openEditNode(detailNode)}>
                  Sửa
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => setConfirmDelete({ type: 'node', id: detailNode._id || detailNode.id, name: detailNode.name })}
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Node Modal ─────────────────────────────────────────────────────── */}
      {nodeModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{nodeModal.mode === 'create' ? 'Thêm khách hàng' : 'Sửa khách hàng'}</h5>
                <button className="close" onClick={() => setNodeModal(null)}><span>×</span></button>
              </div>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label>Tên *</label>
                    <input className="form-control" value={nodeForm.name} onChange={e => setNodeForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="form-group col-md-6">
                    <label>Điện thoại</label>
                    <input className="form-control" value={nodeForm.phone} onChange={e => setNodeForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label>Email</label>
                    <input className="form-control" value={nodeForm.email} onChange={e => setNodeForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div className="form-group col-md-6">
                    <label>Nhóm</label>
                    <select
                      className="form-control"
                      multiple
                      value={nodeForm.groupIds}
                      onChange={e => setNodeForm(f => ({ ...f, groupIds: Array.from(e.target.selectedOptions, o => o.value) }))}
                      style={{ height: 80 }}
                    >
                      {groups.map(g => (
                        <option key={g._id} value={String(g._id)}>{g.name}</option>
                      ))}
                    </select>
                    <small className="text-muted">Ctrl+click để chọn nhiều nhóm</small>
                  </div>
                </div>
                <div className="form-group">
                  <label>Địa chỉ</label>
                  <input className="form-control" value={nodeForm.address} onChange={e => setNodeForm(f => ({ ...f, address: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea className="form-control" rows={2} value={nodeForm.description} onChange={e => setNodeForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Ghi chú</label>
                  <textarea className="form-control" rows={2} value={nodeForm.notes} onChange={e => setNodeForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Tags (phân cách bằng dấu phẩy)</label>
                  <input className="form-control" value={nodeForm.tags} onChange={e => setNodeForm(f => ({ ...f, tags: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setNodeModal(null)}>Hủy</button>
                <button
                  className="btn btn-primary"
                  onClick={saveNode}
                  disabled={!nodeForm.name.trim() || createNode.isPending || updateNode.isPending}
                >
                  {createNode.isPending || updateNode.isPending ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Group Modal ─────────────────────────────────────────────────────── */}
      {groupModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{groupModal.mode === 'create' ? 'Tạo nhóm' : 'Sửa nhóm'}</h5>
                <button className="close" onClick={() => setGroupModal(null)}><span>×</span></button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Tên nhóm *</label>
                  <input className="form-control" value={groupForm.name} onChange={e => setGroupForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Màu sắc</label>
                  <div className="d-flex align-items-center gap-2">
                    <input type="color" className="form-control" style={{ width: 50, height: 38, padding: 2 }} value={groupForm.color} onChange={e => setGroupForm(f => ({ ...f, color: e.target.value }))} />
                    <input className="form-control" value={groupForm.color} onChange={e => setGroupForm(f => ({ ...f, color: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea className="form-control" rows={2} value={groupForm.description} onChange={e => setGroupForm(f => ({ ...f, description: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setGroupModal(null)}>Hủy</button>
                <button
                  className="btn btn-primary"
                  onClick={saveGroup}
                  disabled={!groupForm.name.trim() || createGroup.isPending || updateGroup.isPending}
                >
                  {createGroup.isPending || updateGroup.isPending ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edge label Modal ────────────────────────────────────────────────── */}
      {edgeLabelModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Tên quan hệ</h5>
                <button className="close" onClick={() => setEdgeLabelModal(null)}><span>×</span></button>
              </div>
              <div className="modal-body">
                <input
                  className="form-control"
                  placeholder="VD: Bạn bè, Đồng nghiệp, Gia đình..."
                  value={edgeLabelInput}
                  onChange={e => setEdgeLabelInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveEdgeLabel()}
                  autoFocus
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary btn-sm" onClick={() => setEdgeLabelModal(null)}>Hủy</button>
                <button className="btn btn-primary btn-sm" onClick={saveEdgeLabel} disabled={updateRel.isPending}>
                  {updateRel.isPending ? '...' : 'Lưu'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm delete ──────────────────────────────────────────────────── */}
      {confirmDelete && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">Xác nhận xóa</h5>
                <button className="close" onClick={() => setConfirmDelete(null)}><span>×</span></button>
              </div>
              <div className="modal-body">
                Xóa <strong>{confirmDelete.name}</strong>?
                {confirmDelete.type === 'node' && (
                  <div className="text-muted small mt-1">Tất cả quan hệ liên quan cũng sẽ bị xóa.</div>
                )}
                {confirmDelete.type === 'group' && (
                  <div className="text-muted small mt-1">Nhóm sẽ được gỡ khỏi tất cả khách hàng.</div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary btn-sm" onClick={() => setConfirmDelete(null)}>Hủy</button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    if (confirmDelete.type === 'node') {
                      deleteNode.mutate(confirmDelete.id, { onSuccess: () => { setConfirmDelete(null); setDetailNode(null); } });
                    } else if (confirmDelete.type === 'group') {
                      deleteGroup.mutate(confirmDelete.id, { onSuccess: () => setConfirmDelete(null) });
                    }
                  }}
                  disabled={deleteNode.isPending || deleteGroup.isPending}
                >
                  {deleteNode.isPending || deleteGroup.isPending ? 'Đang xóa...' : 'Xóa'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
