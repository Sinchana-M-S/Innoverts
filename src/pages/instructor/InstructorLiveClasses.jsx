import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, Plus, Calendar, Clock, Users } from 'lucide-react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function InstructorLiveClasses() {
  const [classes, setClasses] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledAt: '',
    duration: 60,
    courseId: '',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const { data } = await api.get('/live-classes?myClasses=true');
      setClasses(data);
    } catch (error) {
      console.error('Failed to fetch live classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      const { data } = await api.post('/live-classes', formData);
      toast.success('Live class scheduled!');
      setShowCreate(false);
      setFormData({
        title: '',
        description: '',
        scheduledAt: '',
        duration: 60,
        courseId: '',
      });
      fetchClasses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create live class');
    } finally {
      setCreating(false);
    }
  };

  const handleStart = async (classId) => {
    try {
      await api.put(`/live-classes/${classId}/status`, { isActive: true });
      toast.success('Live class started!');
      fetchClasses();
    } catch (error) {
      toast.error('Failed to start live class');
    }
  };

  const handleEnd = async (classId) => {
    try {
      await api.put(`/live-classes/${classId}/status`, { isCompleted: true, isActive: false });
      toast.success('Live class ended!');
      fetchClasses();
    } catch (error) {
      toast.error('Failed to end live class');
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-20">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-white">Live Classes</h1>
          <Button variant="primary" onClick={() => setShowCreate(true)}>
            <Plus size={18} className="mr-2" />
            Schedule Class
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-900" />
            ))}
          </div>
        ) : classes.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Video size={64} className="mx-auto mb-4 text-gray-600" />
              <p className="text-xl text-gray-400">No live classes scheduled</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {classes.map((liveClass, index) => (
              <motion.div
                key={liveClass._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="mb-2 text-2xl font-bold text-white">{liveClass.title}</h3>
                        {liveClass.description && (
                          <p className="mb-4 text-gray-400">{liveClass.description}</p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar size={16} />
                            <span>{formatDate(liveClass.scheduledAt)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock size={16} />
                            <span>{liveClass.duration} minutes</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users size={16} />
                            <span>{liveClass.participants?.length || 0} participants</span>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center space-x-2">
                          {liveClass.isActive && (
                            <span className="rounded-full bg-green-500/20 px-3 py-1 text-sm text-green-400">
                              Live Now
                            </span>
                          )}
                          {liveClass.isCompleted && (
                            <span className="rounded-full bg-gray-500/20 px-3 py-1 text-sm text-gray-400">
                              Completed
                            </span>
                          )}
                          {!liveClass.isActive && !liveClass.isCompleted && (
                            <span className="rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-400">
                              Scheduled
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        {!liveClass.isActive && !liveClass.isCompleted && (
                          <Button
                            variant="primary"
                            onClick={() => handleStart(liveClass._id)}
                          >
                            Start Class
                          </Button>
                        )}
                        {liveClass.isActive && (
                          <>
                            <a
                              href={liveClass.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-lg bg-white px-4 py-2 text-center text-black hover:bg-gray-200"
                            >
                              Join Meeting
                            </a>
                            <Button
                              variant="danger"
                              onClick={() => handleEnd(liveClass._id)}
                            >
                              End Class
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Schedule Live Class">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-gray-400">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2 text-white outline-none focus:border-white"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-gray-400">Description</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2 text-white outline-none focus:border-white"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-gray-400">Scheduled Date & Time *</label>
            <input
              type="datetime-local"
              required
              value={formData.scheduledAt}
              onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2 text-white outline-none focus:border-white"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-gray-400">Duration (minutes) *</label>
            <input
              type="number"
              required
              min="15"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2 text-white outline-none focus:border-white"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={creating}>
              {creating ? 'Creating...' : 'Schedule'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

