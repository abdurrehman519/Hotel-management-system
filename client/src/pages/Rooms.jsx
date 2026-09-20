import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BedDouble, Plus, Search, Filter, Grid, List, Edit2, Trash2,
  CheckCircle2, AlertCircle, Sparkles, Wrench
} from 'lucide-react';
import { roomsApi, roomTypesApi } from '../api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import { formatCurrency } from '../utils/format';

export default function Rooms() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  const [formData, setFormData] = useState({
    room_number: '',
    room_type_id: '',
    floor: 1,
    status: 'available',
    notes: '',
  });

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const res = await roomsApi.getAll();
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
  });

  const { data: roomTypes = [] } = useQuery({
    queryKey: ['roomTypes'],
    queryFn: async () => {
      const res = await roomTypesApi.getAll();
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data) =>
      editingRoom ? roomsApi.update(editingRoom.id, data) : roomsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['rooms']);
      toast.success(editingRoom ? 'Room updated successfully' : 'Room created successfully');
      handleCloseModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to save room');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => roomsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['rooms']);
      toast.success('Room deleted successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete room');
    },
  });

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setFormData({
      room_number: '',
      room_type_id: roomTypes[0]?.id || '',
      floor: 1,
      status: 'available',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      room_number: room.room_number,
      room_type_id: room.room_type_id,
      floor: room.floor,
      status: room.status,
      notes: room.notes || '',
    });
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingRoom(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.room_number || !formData.room_type_id) {
      toast.warning('Please fill in room number and select a room type');
      return;
    }
    saveMutation.mutate(formData);
  };

  const filteredRooms = rooms.filter((r) => {
    const rType = r.roomType || r.RoomType;
    const matchesSearch =
      r.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rType?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#8B949E' }} />
            <input
              type="text"
              placeholder="Search room or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '38px' }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-input"
            style={{ width: '160px' }}
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="dirty">Cleaning</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', background: '#161B22', borderRadius: '8px', padding: '4px', border: '1px solid #30363D' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                background: viewMode === 'grid' ? '#21262D' : 'transparent',
                color: viewMode === 'grid' ? '#F0F6FC' : '#8B949E',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
              }}
            >
              <Grid size={16} /> Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                background: viewMode === 'table' ? '#21262D' : 'transparent',
                color: viewMode === 'table' ? '#F0F6FC' : '#8B949E',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
              }}
            >
              <List size={16} /> Table
            </button>
          </div>

          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Add Room
          </button>
        </div>
      </div>

      {/* Grid or Table display */}
      {isLoading ? (
        <div style={{ color: '#8B949E', textAlign: 'center', padding: '40px' }}>Loading rooms...</div>
      ) : filteredRooms.length === 0 ? (
        <div className="empty-state">
          <BedDouble size={48} color="#8B949E" style={{ marginBottom: '16px' }} />
          <h3>No rooms found</h3>
          <p>Try adjusting your search query or filter settings.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '16px',
          }}
        >
          {filteredRooms.map((room) => {
            const rType = room.roomType || room.RoomType;
            const defaultImages = {
              Standard: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
              Deluxe: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
              'Executive Suite': 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800',
              'Family Room': 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
            };
            const roomImg = room.image_url || rType?.image_url || defaultImages[rType?.name] || defaultImages.Standard;
            const price = rType?.base_price ?? 150;
            const typeName = rType?.name || 'Standard';

            return (
              <motion.div
                key={room.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="glass-card"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  borderTop: `3px solid ${
                    room.status === 'available'
                      ? '#3FB950'
                      : room.status === 'occupied'
                      ? '#FF7B72'
                      : room.status === 'maintenance'
                      ? '#D29922'
                      : '#D2A8FF'
                  }`,
                }}
              >
                <div style={{ position: 'relative', width: '100%', height: '150px', overflow: 'hidden' }}>
                  <img
                    src={roomImg}
                    alt={`Room ${room.room_number}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                    }}
                  >
                    <StatusBadge status={room.status} />
                  </div>
                </div>

                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F0F6FC' }}>
                      Room {room.room_number}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#58A6FF', fontWeight: 700 }}>
                      {formatCurrency(price)} / night
                    </div>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#8B949E' }}>
                    <div>Type: <strong style={{ color: '#C9D1D9' }}>{typeName}</strong></div>
                    <div>Floor: <strong style={{ color: '#C9D1D9' }}>Floor {room.floor}</strong></div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px', paddingTop: '12px', borderTop: '1px solid #30363D' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '6px 12px', fontSize: '0.8rem' }}
                      onClick={() => handleOpenEdit(room)}
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      onClick={() => {
                        if (window.confirm(`Delete room ${room.room_number}?`)) {
                          deleteMutation.mutate(room.id);
                        }
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Room No</th>
                <th>Type</th>
                <th>Floor</th>
                <th>Price / Night</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map((room) => {
                const rType = room.roomType || room.RoomType;
                return (
                  <tr key={room.id}>
                    <td style={{ fontWeight: 600 }}>Room {room.room_number}</td>
                    <td>{rType?.name || 'Standard'}</td>
                    <td>Floor {room.floor}</td>
                    <td style={{ fontWeight: 600, color: '#58A6FF' }}>{formatCurrency(rType?.base_price ?? 150)}</td>
                    <td>
                      <StatusBadge status={room.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => handleOpenEdit(room)}>
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '4px 8px' }}
                          onClick={() => {
                            if (window.confirm(`Delete room ${room.room_number}?`)) {
                              deleteMutation.mutate(room.id);
                            }
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal isOpen={isAddModalOpen} onClose={handleCloseModal} title={editingRoom ? `Edit Room ${editingRoom.room_number}` : 'Add New Room'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Room Number *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 101"
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Floor</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Room Type *</label>
            <select
              className="form-input"
              value={formData.room_type_id}
              onChange={(e) => setFormData({ ...formData, room_type_id: e.target.value })}
              required
            >
              <option value="">Select Room Type</option>
              {roomTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — {formatCurrency(t.base_price)} / night
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-input"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="dirty">Cleaning</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Notes / Remarks</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Any additional information..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : editingRoom ? 'Update Room' : 'Create Room'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
