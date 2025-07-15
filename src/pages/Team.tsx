import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTeamStore } from '../store/teamStore';
import type { TeamMember } from '../store/teamStore';
import { User, UserPlus, Mail, Trash2, Edit, Shield, Eye, X, Calendar, Phone, MapPin, EyeOff } from 'lucide-react';

interface TeamMemberWithEdit extends TeamMember {
  _editMode?: boolean;
  _editName?: string;
  _editEmail?: string;
  _editRole?: 'admin' | 'agent' | 'viewer';
}

const Team = () => {
  useAuthStore();
  const { members, fetchTeamMembers, addTeamMember, removeTeamMember, isLoading, error, updateTeamMember } = useTeamStore();
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMemberWithEdit | null>(null);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'agent',
    password: ''
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; memberId: string | null }>({ open: false, memberId: null });
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addTeamMember(newMember);
      setIsAddingMember(false);
      setNewMember({ name: '', email: '', role: 'agent', password: '' });
    } catch (err) {
      // Error is handled by the store
    }
  };

  const handleRemoveMember = async (id: string) => {
    setDeleteConfirm({ open: true, memberId: id });
  };

  const confirmDeleteMember = async () => {
    if (!deleteConfirm.memberId) return;
    try {
      await removeTeamMember(deleteConfirm.memberId);
      if (selectedMember && selectedMember._id === deleteConfirm.memberId) {
        setSelectedMember(null);
      }
      setDeleteSuccess('User deleted successfully.');
      setTimeout(() => setDeleteSuccess(null), 3000);
    } catch (err) {
      // Error is handled by the store
    } finally {
      setDeleteConfirm({ open: false, memberId: null });
    }
  };

  const handleMemberClick = (member: TeamMember) => {
    if (member.role === 'admin') return;
    setSelectedMember(member);
  };

  const closeMemberModal = () => {
    setSelectedMember(null);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-error-600" />;
      case 'agent':
        return <User className="h-4 w-4 text-primary-600" />;
      case 'viewer':
        return <Eye className="h-4 w-4 text-neutral-600" />;
      default:
        return <User className="h-4 w-4 text-neutral-600" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-error-100 text-error-800';
      case 'agent':
        return 'bg-primary-100 text-primary-800';
      case 'viewer':
        return 'bg-neutral-100 text-neutral-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Team Count */}
      <div className="bg-primary-600 w-full rounded-lg md:rounded-lg p-4 md:p-6 text-white mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold">Team Members</h2>
          <p className="text-primary-100 mt-1 text-sm md:text-base">Manage your support team and assign tickets</p>
          <div className="mt-3 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-2 md:gap-6 w-full">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span className="text-lg font-semibold">{members.length} Total Members</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span className="text-sm">{members.filter(m => m.role === 'admin').length} Admins</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span className="text-sm">{members.filter(m => m.role === 'agent').length} Agents</span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span className="text-sm">{members.filter(m => m.role === 'viewer').length} Viewers</span>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 w-full md:w-auto flex justify-center md:justify-end">
        <button
          onClick={() => setIsAddingMember(true)}
            className="inline-flex items-center justify-center w-full md:w-auto px-4 py-2 border border-white rounded-md text-sm font-medium text-primary-600 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Add Team Member
        </button>
        </div>
      </div>

      {error && (
        <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {isAddingMember && (
        <div className="bg-white shadow-2xl rounded-2xl p-8 border border-neutral-200 max-w-2xl mx-auto mb-8 animate-fade-in">
          <h3 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-primary-600" />
            Add New Team Member
          </h3>
          <form onSubmit={handleAddMember} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Name</label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                  className="block w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-2 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition placeholder-neutral-400"
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                  className="block w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-2 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition placeholder-neutral-400"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newMember.password}
                    onChange={(e) => setNewMember({...newMember, password: e.target.value})}
                    className="block w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-2 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition placeholder-neutral-400 pr-10"
                    placeholder="Set password for team member"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-neutral-400 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Role</label>
              <div className="relative">
              <select
                value={newMember.role}
                onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                  className="block w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-2 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition"
              >
                  <option value="agent">🧑‍💼 Support Agent</option>
                  <option value="admin">🛡️ Admin</option>
                  <option value="viewer">👁️ Viewer</option>
              </select>
                <div className="mt-2 text-xs text-neutral-500 min-h-[1.5em]">
                  {newMember.role === 'admin' && 'Admins have full access to all features, including team management and settings.'}
                  {newMember.role === 'agent' && 'Agents can manage tickets and respond to customers, but have limited access to team settings.'}
                  {newMember.role === 'viewer' && 'Viewers have read-only access and cannot make changes.'}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingMember(false)}
                className="px-5 py-2 border border-neutral-300 rounded-lg text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center px-5 py-2 rounded-lg text-white bg-gradient-to-r from-primary-600 to-primary-700 shadow-md font-semibold hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-200 transition disabled:opacity-50"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                {isLoading ? 'Adding...' : 'Add Member'}
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteSuccess && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-800 px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {deleteSuccess}
        </div>
      )}

      {deleteConfirm.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-sm w-full">
            <h4 className="text-lg font-semibold mb-4 text-neutral-900">Confirm Deletion</h4>
            <p className="mb-6 text-neutral-700">Are you sure you want to delete this team member? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
                onClick={() => setDeleteConfirm({ open: false, memberId: null })}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-error-600 text-white hover:bg-error-700"
                onClick={confirmDeleteMember}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Team Members Table with Summary */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full">
        {/* Table Header with Summary */}
        {members.length > 0 && (
          <div className="bg-neutral-50 px-4 py-4 md:px-6 md:py-4 border-b border-neutral-200 w-full">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-2">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 w-full">
                <span className="text-sm font-medium text-neutral-700">
                  Showing {members.length} team member{members.length !== 1 ? 's' : ''}
                </span>
                <div className="flex items-center space-x-3 text-xs text-neutral-500 mt-2 md:mt-0">
                  <span className="flex items-center space-x-1">
                    <Shield className="h-3 w-3 text-error-600" />
                    <span>{members.filter(m => m.role === 'admin').length} Admin</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <User className="h-3 w-3 text-blue-600" />
                    <span>{members.filter(m => m.role === 'agent').length} Agent</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Eye className="h-3 w-3 text-neutral-600" />
                    <span>{members.filter(m => m.role === 'viewer').length} Viewer</span>
                  </span>
                </div>
              </div>
              <div className="text-xs text-neutral-500 mt-2 md:mt-0">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Card Layout */}
        <div className="block md:hidden w-full px-4 py-4 space-y-4">
          {members.map((member) => (
            <div key={member._id} className="bg-neutral-50 rounded-lg p-4 flex flex-col gap-2 shadow-sm border border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <div className="text-base font-semibold text-neutral-900">{member.name}</div>
                  <div className="text-xs text-neutral-500">{member.email}</div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>{getRoleIcon(member.role)}<span className="ml-1 capitalize">{member.role}</span></span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.isActive !== false ? 'bg-success-100 text-success-800' : 'bg-neutral-100 text-neutral-800'}`}>{member.isActive !== false ? 'Active' : 'Inactive'}</span>
                <span className="text-xs text-neutral-400">Joined: {new Date(member.createdAt).toLocaleDateString()}</span>
              </div>
              {/* Only show edit/delete if not admin */}
              {member.role !== 'admin' && (
                <div className="flex gap-2 mt-2">
                  <button
                    className="text-primary-600 hover:text-primary-900"
                    title="Edit member"
                    onClick={() => handleMemberClick(member)}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveMember(member._id)}
                    className="text-error-600 hover:text-error-900"
                    title="Remove member"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden md:block w-full overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {members.map((member) => (
                <tr 
                  key={member._id} 
                  className="hover:bg-neutral-50 cursor-pointer transition-colors"
                  onClick={() => handleMemberClick(member)}
                >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="h-6 w-6 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-neutral-900">{member.name}</div>
                          <div className="text-sm text-neutral-500">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                        {getRoleIcon(member.role)}
                        <span className="ml-1 capitalize">{member.role}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.isActive !== false ? 'bg-success-100 text-success-800' : 'bg-neutral-100 text-neutral-800'
                      }`}>
                        {member.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {new Date(member.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                        {member.role !== 'admin' && (
                          <>
                            <button
                              className="text-primary-600 hover:text-primary-900"
                              title="Edit member"
                            onClick={() => handleMemberClick(member)}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveMember(member._id)}
                              className="text-error-600 hover:text-error-900"
                              title="Remove member"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>

      {/* Enhanced Team Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-card border-l-4 border-primary-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <User className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-500">Total Members</p>
              <p className="text-3xl font-bold text-neutral-900">{members.length}</p>
              <p className="text-xs text-neutral-400 mt-1">Active team size</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-card border-l-4 border-error-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Shield className="h-8 w-8 text-error-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-500">Administrators</p>
              <p className="text-3xl font-bold text-neutral-900">
                {members.filter(m => m.role === 'admin').length}
              </p>
              <p className="text-xs text-neutral-400 mt-1">Full access users</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-card border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-500">Support Agents</p>
              <p className="text-3xl font-bold text-neutral-900">
                {members.filter(m => m.role === 'agent').length}
              </p>
              <p className="text-xs text-neutral-400 mt-1">Ticket handlers</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-card border-l-4 border-neutral-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Eye className="h-8 w-8 text-neutral-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-500">Viewers</p>
              <p className="text-3xl font-bold text-neutral-900">
                {members.filter(m => m.role === 'viewer').length}
              </p>
              <p className="text-xs text-neutral-400 mt-1">Read-only access</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Insights */}
      {members.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-card">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Team Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {Math.round((members.filter(m => m.role === 'admin').length / members.length) * 100)}%
              </div>
              <div className="text-sm text-neutral-600">Admin Ratio</div>
              <div className="text-xs text-neutral-400 mt-1">
                {members.filter(m => m.role === 'admin').length} of {members.length} members
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((members.filter(m => m.role === 'agent').length / members.length) * 100)}%
              </div>
              <div className="text-sm text-neutral-600">Agent Ratio</div>
              <div className="text-xs text-neutral-400 mt-1">
                {members.filter(m => m.role === 'agent').length} of {members.length} members
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neutral-600">
                {new Date(Math.min(...members.map(m => new Date(m.createdAt).getTime()))).toLocaleDateString()}
              </div>
              <div className="text-sm text-neutral-600">Oldest Member</div>
              <div className="text-xs text-neutral-400 mt-1">
                {members.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0]?.name}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Member Details Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 md:p-4">
          <div className="bg-white w-full max-w-full h-full max-h-full rounded-none p-0 shadow-2xl overflow-y-auto md:rounded-xl md:max-w-2xl md:h-auto md:max-h-none md:p-0 flex flex-col animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-4 md:px-8 md:py-6 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900">Team Member Details</h3>
              <button
                onClick={closeMemberModal}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-4 py-4 md:px-8 md:py-6 flex-1 overflow-y-auto">
              {selectedMember._editMode ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await updateTeamMember(selectedMember._id, {
                      name: selectedMember._editName,
                      email: selectedMember._editEmail,
                      role: selectedMember._editRole,
                    });
                    setSelectedMember({ ...selectedMember, name: selectedMember._editName ?? '', email: selectedMember._editEmail ?? '', role: selectedMember._editRole ?? 'agent', _editMode: false });
                  }}
                  className="flex flex-col md:flex-row md:space-x-8 space-y-8 md:space-y-0 items-start justify-center mb-6"
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0 flex flex-col items-center w-full md:w-1/3">
                    <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                      <User className="h-12 w-12 text-primary-600" />
                    </div>
                  </div>
                  {/* Editable Fields */}
                  <div className="flex-1 w-full space-y-4">
                    <input
                      type="text"
                      value={selectedMember._editName}
                      onChange={e => setSelectedMember({ ...selectedMember, _editName: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-neutral-300 bg-neutral-50 focus:ring-2 focus:ring-primary-200 focus:border-primary-500 text-lg font-semibold text-neutral-900"
                      placeholder="Full Name"
                      required
                    />
                    <input
                      type="email"
                      value={selectedMember._editEmail}
                      onChange={e => setSelectedMember({ ...selectedMember, _editEmail: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-neutral-300 bg-neutral-50 focus:ring-2 focus:ring-primary-200 focus:border-primary-500 text-base text-neutral-700"
                      placeholder="Email Address"
                      required
                    />
                    <select
                      value={selectedMember._editRole}
                      onChange={e => setSelectedMember({ ...selectedMember, _editRole: e.target.value as 'admin' | 'agent' | 'viewer' })}
                      className="w-full px-4 py-2 rounded-lg border border-neutral-300 bg-neutral-50 focus:ring-2 focus:ring-primary-200 focus:border-primary-500 text-base text-neutral-700"
                    >
                      <option value="admin">🛡️ Admin</option>
                      <option value="agent">🧑‍💼 Agent</option>
                      <option value="viewer">👁️ Viewer</option>
                    </select>
                    <div className="flex justify-end gap-3 mt-4">
                      <button
                        type="button"
                        className="px-5 py-2 border border-neutral-300 rounded-lg text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-200 transition"
                        onClick={() => setSelectedMember({ ...selectedMember, _editMode: false })}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-lg text-white bg-gradient-to-r from-primary-600 to-primary-700 shadow-md font-semibold hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-200 transition"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col md:flex-row md:space-x-8 space-y-8 md:space-y-0 items-start justify-center mb-6">
                  {/* Avatar and Basic Info */}
                  <div className="flex-shrink-0 flex flex-col items-center w-full md:w-1/3">
                    <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                      <User className="h-12 w-12 text-primary-600" />
                    </div>
                    <h4 className="text-xl font-semibold text-neutral-900 text-center">{selectedMember.name}</h4>
                    <p className="text-neutral-600 text-center">{selectedMember.email}</p>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(selectedMember.role)}`}>
                        {getRoleIcon(selectedMember.role)}
                        <span className="ml-1 capitalize">{selectedMember.role}</span>
                      </span>
                    </div>
                  </div>
                  {/* Details */}
                  <div className="flex-1 w-full space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
                      <Mail className="h-5 w-5 text-neutral-400" />
                      <div>
                        <p className="text-sm font-medium text-neutral-900">Email Address</p>
                        <p className="text-sm text-neutral-600">{selectedMember.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
                      <Shield className="h-5 w-5 text-neutral-400" />
                      <div>
                        <p className="text-sm font-medium text-neutral-900">Role</p>
                        <p className="text-sm text-neutral-600 capitalize">{selectedMember.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-neutral-400" />
                      <div>
                        <p className="text-sm font-medium text-neutral-900">Joined</p>
                        <p className="text-sm text-neutral-600">
                          {new Date(selectedMember.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
                      <User className="h-5 w-5 text-neutral-400" />
                      <div>
                        <p className="text-sm font-medium text-neutral-900">Status</p>
                        <p className="text-sm text-neutral-600">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            selectedMember.isActive !== false ? 'bg-success-100 text-success-800' : 'bg-neutral-100 text-neutral-800'
                          }`}>
                            {selectedMember.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </p>
                      </div>
                    </div>
                    {/* Role Description */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h5 className="text-sm font-medium text-blue-900 mb-2">Role Permissions</h5>
                      <p className="text-sm text-blue-700">
                        {selectedMember.role === 'admin' && 'Full access to all features including team management, settings, and ticket operations.'}
                        {selectedMember.role === 'agent' && 'Can manage tickets, respond to customers, and update ticket status. Limited access to team settings.'}
                        {selectedMember.role === 'viewer' && 'Read-only access to view tickets and team information. Cannot make changes or respond to tickets.'}
                      </p>
                    </div>
                    {/* Action Buttons */}
                    <div className="mt-6 flex space-x-3">
                      <button
                        className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 bg-white hover:bg-neutral-50 transition-colors"
                        onClick={closeMemberModal}
                      >
                        Close
                      </button>
                      <button
                        className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        onClick={() => setSelectedMember({
                          ...selectedMember,
                          _editMode: true,
                          _editName: selectedMember.name,
                          _editEmail: selectedMember.email,
                          _editRole: selectedMember.role,
                        })}
                      >
                        Edit Member
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;