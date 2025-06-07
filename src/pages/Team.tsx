import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTeamStore } from '../store/teamStore';
import { User, UserPlus, Mail, Trash2, Edit, Shield, Eye } from 'lucide-react';

const Team = () => {
  useAuthStore();
  const { members, fetchTeamMembers, addTeamMember, removeTeamMember, isLoading, error } = useTeamStore();
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'agent'
  });

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addTeamMember(newMember);
      setIsAddingMember(false);
      setNewMember({ name: '', email: '', role: 'agent' });
    } catch (err) {
      // Error is handled by the store
    }
  };

  const handleRemoveMember = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      try {
        await removeTeamMember(id);
      } catch (err) {
        // Error is handled by the store
      }
    }
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Team Members</h2>
          <p className="text-neutral-500">Manage your support team and assign tickets</p>
        </div>
        <button
          onClick={() => setIsAddingMember(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Add Team Member
        </button>
      </div>

      {error && (
        <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {isAddingMember && (
        <div className="bg-white shadow-lg rounded-lg p-6 border border-neutral-200">
          <h3 className="text-lg font-medium mb-4">Add New Team Member</h3>
          <form onSubmit={handleAddMember} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                  className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                  className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Role</label>
              <select
                value={newMember.role}
                onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="agent">Support Agent</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
              <p className="mt-1 text-sm text-neutral-500">
                Agents can manage tickets, Admins have full access, Viewers can only read
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsAddingMember(false)}
                className="px-4 py-2 border border-neutral-300 rounded-md text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {isLoading ? 'Adding...' : 'Add Member'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {isLoading && members.length === 0 ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            <p className="mt-2 text-neutral-500">Loading team members...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center">
            <User className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No team members yet</h3>
            <p className="text-neutral-500 mb-4">Add your first team member to start collaborating</p>
            <button
              onClick={() => setIsAddingMember(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Add Team Member
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                  <tr key={member._id} className="hover:bg-neutral-50">
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
                      <div className="flex justify-end space-x-2">
                        <button
                          className="text-primary-600 hover:text-primary-900"
                          title="Edit member"
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Team Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <User className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-500">Total Members</p>
              <p className="text-2xl font-semibold text-neutral-900">{members.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Shield className="h-8 w-8 text-error-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-500">Admins</p>
              <p className="text-2xl font-semibold text-neutral-900">
                {members.filter(m => m.role === 'admin').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <User className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-500">Agents</p>
              <p className="text-2xl font-semibold text-neutral-900">
                {members.filter(m => m.role === 'agent').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;