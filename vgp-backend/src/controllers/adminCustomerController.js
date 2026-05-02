const asyncWrapper    = require('../middleware/asyncWrapper');
const CustomerNode    = require('../models/CustomerNode');
const CustomerRelation = require('../models/CustomerRelation');
const CustomerGroup   = require('../models/CustomerGroup');

// GET /admin/customers/network
exports.getNetwork = asyncWrapper(async (req, res) => {
  const [nodes, relations, groups] = await Promise.all([
    CustomerNode.find({}).lean(),
    CustomerRelation.find({}).lean(),
    CustomerGroup.find({}).lean(),
  ]);
  res.json({ success: true, data: { nodes, relations, groups } });
});

// ── Nodes ─────────────────────────────────────────────────────────────────────
exports.createNode = asyncWrapper(async (req, res) => {
  const node = await CustomerNode.create(req.body);
  res.status(201).json({ success: true, data: node });
});

exports.updateNode = asyncWrapper(async (req, res) => {
  const node = await CustomerNode.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true }).lean();
  if (!node) return res.status(404).json({ success: false, error: 'Không tìm thấy khách hàng' });
  res.json({ success: true, data: node });
});

exports.deleteNode = asyncWrapper(async (req, res) => {
  const node = await CustomerNode.findByIdAndDelete(req.params.id).lean();
  if (!node) return res.status(404).json({ success: false, error: 'Không tìm thấy khách hàng' });
  // Remove all relations involving this node
  await CustomerRelation.deleteMany({ $or: [{ from: req.params.id }, { to: req.params.id }] });
  res.json({ success: true, message: 'Đã xóa khách hàng' });
});

exports.updateNodePosition = asyncWrapper(async (req, res) => {
  const { x, y } = req.body;
  const node = await CustomerNode.findByIdAndUpdate(
    req.params.id,
    { $set: { position: { x, y } } },
    { new: true }
  ).lean();
  if (!node) return res.status(404).json({ success: false, error: 'Không tìm thấy khách hàng' });
  res.json({ success: true, data: node });
});

// ── Relations ─────────────────────────────────────────────────────────────────
exports.createRelation = asyncWrapper(async (req, res) => {
  const relation = await CustomerRelation.create(req.body);
  res.status(201).json({ success: true, data: relation });
});

exports.updateRelation = asyncWrapper(async (req, res) => {
  const relation = await CustomerRelation.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }).lean();
  if (!relation) return res.status(404).json({ success: false, error: 'Không tìm thấy quan hệ' });
  res.json({ success: true, data: relation });
});

exports.deleteRelation = asyncWrapper(async (req, res) => {
  const relation = await CustomerRelation.findByIdAndDelete(req.params.id).lean();
  if (!relation) return res.status(404).json({ success: false, error: 'Không tìm thấy quan hệ' });
  res.json({ success: true, message: 'Đã xóa quan hệ' });
});

// ── Groups ────────────────────────────────────────────────────────────────────
exports.createGroup = asyncWrapper(async (req, res) => {
  const group = await CustomerGroup.create(req.body);
  res.status(201).json({ success: true, data: group });
});

exports.updateGroup = asyncWrapper(async (req, res) => {
  const group = await CustomerGroup.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }).lean();
  if (!group) return res.status(404).json({ success: false, error: 'Không tìm thấy nhóm' });
  res.json({ success: true, data: group });
});

exports.deleteGroup = asyncWrapper(async (req, res) => {
  const group = await CustomerGroup.findByIdAndDelete(req.params.id).lean();
  if (!group) return res.status(404).json({ success: false, error: 'Không tìm thấy nhóm' });
  // Remove group from all nodes
  await CustomerNode.updateMany({ groupIds: req.params.id }, { $pull: { groupIds: req.params.id } });
  res.json({ success: true, message: 'Đã xóa nhóm' });
});
