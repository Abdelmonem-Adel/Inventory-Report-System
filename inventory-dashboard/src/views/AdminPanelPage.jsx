import React, { useEffect, useState } from 'react';
import api from '../api/authApi';

const AdminPanelPage = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'manager' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      setError('Failed to fetch users');
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Handle create/edit user form submit
  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setSuccess('');
    // Basic validation
    if (!form.name || !form.email || (!editingId && !form.password) || !form.role) {
      setError('All fields are required');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError('Invalid email format');
      return;
    }
    if (!editingId && form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, form);
        setSuccess('User updated');
      } else {
        await api.post('/users', form);
        setSuccess('User created');
      }
      setForm({ name: '', email: '', password: '', role: 'manager' });
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    }
  };

  const handleEdit = user => {
    setEditingId(user._id);
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete user?')) return;
    try {
      await api.delete(`/users/${id}`);
      setSuccess('User deleted');
      fetchUsers();
    } catch (err) {
      setError('Delete failed');
    }
  };

  // Role-based UI logic
  const canEdit = user?.role === 'top_admin';
  const canDelete = user?.role === 'top_admin';
  const canCreate = user?.role === 'top_admin' || user?.role === 'admin';

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      {canCreate && (
        <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2 max-w-md">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required className="border p-2 rounded" />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required className="border p-2 rounded" />
          <input name="password" value={form.password} onChange={handleChange} placeholder="Password" type="password" required={!editingId} className="border p-2 rounded" />
          <select name="role" value={form.role} onChange={handleChange} className="border p-2 rounded">
            {/* <option value="top_admin">Top Admin</option> */}
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="planner">Planner</option>
            <option value="shiftLeader">Shift Leader</option>
            <option value="keeper">Keeper</option>
          </select>
          <button type="submit" className="bg-blue-600 text-white py-2 rounded">{editingId ? 'Update' : 'Create'} User</button>
        </form>
      )}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Role</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id} className="border-t">
              <td className="p-2">{u.name}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.role}</td>
              <td className="p-2 flex gap-2">
                {canEdit && <button onClick={() => handleEdit(u)} className="bg-yellow-400 px-2 rounded">Edit</button>}
                {canDelete && <button onClick={() => handleDelete(u._id)} className="bg-red-500 text-white px-2 rounded">Delete</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanelPage;
