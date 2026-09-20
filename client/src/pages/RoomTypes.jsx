import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Key, Plus, Edit2, Trash2, Users, DollarSign, Sparkles } from 'lucide-react';
import { roomTypesApi } from '../api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/common/Modal';
import { formatCurrency } from '../utils/format';

export default function RoomTypes() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: '',
    capacity: 2,
    amenities: 'WiFi, AC, TV, Mini Bar, Ocean View',
  });

  const { data: roomTypes = [], isLoading } = useQuery({
    queryKey: ['roomTypes'],
    queryFn: async () => {
      const res = await roomTypesApi.getAll();
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data) =>
      editingType ? roomTypesApi.update(editingType.id, data) : roomTypesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['roomTypes']);
      toast.success(editingType ? 'Room type updated' : 'Room type created');
      handleCloseModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to save room type');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => roomTypesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['roomTypes']);
      toast.success('Room type deleted');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete room type');
    },
  });

  const handleOpenAdd = () => {
    setEditingType(null);
    setFormData({
      name: '',
      description: '',
      base_price: '',
      capacity: 2,
      amenities: 'WiFi, AC, TV, Mini Bar',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (type) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      description: type.description || '',
      base_price: type.base_price,
      capacity: type.capacity,
      amenities: Array.isArray(type.amenities) ? type.amenities.join(', ') : type.amenities || '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingType(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const amenitiesArr = formData.amenities
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    saveMutation.mutate({
      ...formData,
      base_price: parseFloat(formData.base_price),
      capacity: parseInt(formData.capacity),
      amenities: amenitiesArr,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Room Categories & Pricing</h2>
          <p style={{ color: '#8B949E', fontSize: '0.85rem' }}>
            Configure room types, default rates, guest capacity, and amenities.
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} /> New Room Type
        </button>
      </div>

      {isLoading ? (
        <div style={{ color: '#8B949E', textAlign: 'center', padding: '40px' }}>Loading categories...</div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {roomTypes.map((type) => {
            let amenitiesList = [];
            if (Array.isArray(type.amenities)) {
              amenitiesList = type.amenities;
            } else if (typeof type.amenities === 'string') {
              try {
                const parsed = JSON.parse(type.amenities);
                if (Array.isArray(parsed)) amenitiesList = parsed;
                else amenitiesList = type.amenities.split(',').map((s) => s.trim()).filter(Boolean);
              } catch {
                amenitiesList = type.amenities.split(',').map((s) => s.trim()).filter(Boolean);
              }
            }

            return (
              <motion.div
                key={type.id}
                whileHover={{ y: -4 }}
                className="glass-card"
                style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F0F6FC' }}>{type.name}</h3>
                    <div style={{ fontSize: '0.85rem', color: '#8B949E', marginTop: '4px' }}>
                      <Users size={14} style={{ display: 'inline', marginRight: 4 }} /> Max {type.capacity} Guests
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      color: '#58A6FF',
                      background: 'rgba(56, 139, 253, 0.1)',
                      padding: '4px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(56, 139, 253, 0.2)',
                    }}
                  >
                    {formatCurrency(type.base_price)}
                    <span style={{ fontSize: '0.75rem', color: '#8B949E', fontWeight: 400 }}> / night</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: '#8B949E', lineHeight: '1.5' }}>
                  {type.description || 'No description provided.'}
                </p>

                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#8B949E', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Included Amenities
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {amenitiesList.map((item, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: '#21262D',
                          color: '#C9D1D9',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          border: '1px solid #30363D',
                        }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #30363D' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '6px 12px', fontSize: '0.85rem' }}
                    onClick={() => handleOpenEdit(type)}
                  >
                    <Edit2 size={14} /> Edit Category
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                    onClick={() => {
                      if (window.confirm(`Delete category ${type.name}?`)) {
                        deleteMutation.mutate(type.id);
                      }
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal for create / edit */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingType ? `Edit ${editingType.name}` : 'Create Room Category'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Category Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Executive Suite"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Base Rate ($ per night) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                placeholder="150.00"
                value={formData.base_price}
                onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Guest Capacity *</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Amenities (comma-separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="King Bed, Ocean View, Free WiFi, Jacuzzi"
              value={formData.amenities}
              onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Detailed description of the room category..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : editingType ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
