import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Award, BookOpen, GraduationCap, Edit2 } from 'lucide-react';
import api from '../lib/api';
import useAuthStore from '../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser, fetchUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    skills: user?.skills?.join(', ') || '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        skills: user.skills?.join(', ') || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', {
        ...formData,
        skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
      });
      updateUser(data);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const isStudent = user?.role === 'student' || user?.role === 'both';
  const isInstructor = user?.role === 'instructor' || user?.role === 'both';

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-20">
        <h1 className="mb-8 text-4xl font-bold text-white">Profile</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Personal Information</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(!editing)}
                  >
                    <Edit2 size={18} className="mr-2" />
                    {editing ? 'Cancel' : 'Edit'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-gray-400">Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2 text-white outline-none focus:border-white"
                    />
                  ) : (
                    <p className="text-white">{user?.name || 'N/A'}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-400">Email</label>
                  <div className="flex items-center space-x-2">
                    <Mail size={18} className="text-gray-400" />
                    <p className="text-white">{user?.email || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-400">Role</label>
                  <div className="flex items-center space-x-2">
                    {isStudent && (
                      <span className="rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-400">
                        Student
                      </span>
                    )}
                    {isInstructor && (
                      <span className="rounded-full bg-purple-500/20 px-3 py-1 text-sm text-purple-400">
                        Instructor
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-400">Bio</label>
                  {editing ? (
                    <textarea
                      rows={4}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2 text-white outline-none focus:border-white"
                    />
                  ) : (
                    <p className="text-gray-300">{user?.bio || 'No bio yet'}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-400">Skills</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      placeholder="skill1, skill2, skill3"
                      className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2 text-white outline-none focus:border-white"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {user?.skills?.map((skill, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-300"
                        >
                          {skill}
                        </span>
                      )) || <p className="text-gray-400">No skills added</p>}
                    </div>
                  )}
                </div>

                {editing && (
                  <Button variant="primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Unified Credits */}
            <Card>
              <CardHeader>
                <CardTitle>Credits Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-gray-900 p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/20">
                        <Award className="text-yellow-400" size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Total Credits</p>
                        <p className="text-2xl font-bold text-white">{user?.credits || 0}</p>
                      </div>
                    </div>
                  </div>

                  {isStudent && (
                    <div className="flex items-center justify-between rounded-lg bg-gray-900 p-4">
                      <div className="flex items-center space-x-3">
                        <GraduationCap className="text-blue-400" size={24} />
                        <div>
                          <p className="text-sm text-gray-400">Earned as Student</p>
                          <p className="text-xl font-bold text-white">
                            {user?.completedCourses?.length * 50 || 0} credits
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {isInstructor && (
                    <div className="flex items-center justify-between rounded-lg bg-gray-900 p-4">
                      <div className="flex items-center space-x-3">
                        <BookOpen className="text-purple-400" size={24} />
                        <div>
                          <p className="text-sm text-gray-400">Earned as Instructor</p>
                          <p className="text-xl font-bold text-white">
                            {user?.createdCourses?.length * 100 || 0} credits
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-800">
                    <User size={48} className="text-gray-400" />
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">{user?.name}</h3>
                <p className="mb-4 text-sm text-gray-400">{user?.email}</p>
                <div className="mb-4 flex items-center justify-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                  <span className="text-sm text-gray-400">Online</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

