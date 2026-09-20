import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Plus, Edit2, UserX, Shield, Mail, Phone, Lock } from 'lucide-react';
import { staffApi } from '../api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/common/Modal';
import { formatDate } from '../utils/format';

export default function Staff() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'receptionist',
    phone: '',
  });

  const { data: staffMembers = [], isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const res = await staffApi.getAll();
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data) =>
      editingStaff ? staffApi.update(editingStaff.id, data) : staffApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['staff']);
      toast.success(editingStaff ? 'Staff member updated' : 'Staff member created');
      handleCloseModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to save staff member');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id) => staffApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['staff']);
      toast.success('Staff status updated');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update status');
    },
  });

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      full_name: '',
      role: 'receptionist',
      phone: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member) => {
    setEditingStaff(member);
    setFormData({
      username: member.username,
      email: member.email,
      password: '',
      full_name: member.full_name,
      role: member.role,
      phone: member.phone || '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const getRoleBadge = (role) => {
    if (role === 'admin')
      return { bg: 'rgba(248, 81, 73, 0.15)', color: '#FF7B72', label: 'Administrator' };
    if (role === 'manager')
      return { bg: 'rgba(210, 153, 34, 0.15)', color: '#D29922', label: 'Hotel Manager' };
    if (role === 'receptionist')
      return { bg: 'rgba(56, 139, 253, 0.15)', color: '#58A6FF', label: 'Receptionist' };
    return { bg: 'rgba(163, 113, 247, 0.15)', color: '#D2A8FF', label: 'Housekeeper' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Staff & User Management</h2>
          <p style={{ color: '#8B949E', fontSize: '0.85rem' }}>
            Manage staff accounts, assign system access roles, and monitor active user status.
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} /> Add Staff Member
        </button>
      </div>

      {isLoading ? (
        <div style={{ color: '#8B949E', textAlign: 'center', padding: '40px' }}>Loading staff members...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {staffMembers.map((member) => {
            const roleStyle = getRoleBadge(member.role);
            return (
              <motion.div
                key={member.id}
                whileHover={{ y: -4 }}
                className="glass-card"
                style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F0F6FC' }}>{member.full_name}</h3>
                    <div style={{ fontSize: '0.8rem', color: '#8B949E', marginTop: '2px' }}>@{member.username}</div>
                  </div>

                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: roleStyle.bg,
                      color: roleStyle.color,
                    }}
                  >
                    {roleStyle.label}
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#8B949E', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={14} color="#58A6FF" /> {member.email}
                  </div>
                  {member.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={14} color="#3FB950" /> {member.phone}
                    </div>
                  )}
                  <div>
                    Status:{' '}
                    <strong style={{ color: member.is_active ? '#3FB950' : '#FF7B72' }}>
                      {member.is_active ? 'Active' : 'Deactivated'}
                    </strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #30363D' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '6px 12px', fontSize: '0.85rem' }}
                    onClick={() => handleOpenEdit(member)}
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button
                    className={member.is_active ? 'btn btn-danger' : 'btn btn-secondary'}
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                    onClick={() => deactivateMutation.mutate(member.id)}
                  >
                    <UserX size={14} /> {member.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Staff Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingStaff ? `Edit Staff Account: ${editingStaff.username}` : 'Add New Staff Member'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="John Doe"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Username *</label>
              <input
                type="text"
                className="form-input"
                placeholder="johndoe"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Role *</label>
              <select
                className="form-input"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="receptionist">Receptionist</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrator</option>
                <option value="housekeeper">Housekeeper</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                placeholder="john@hotel.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+1 234 567 890"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{editingStaff ? 'New Password (leave blank to keep current)' : 'Password *'}</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!editingStaff}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : editingStaff ? 'Update Staff Account' : 'Create Staff Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
