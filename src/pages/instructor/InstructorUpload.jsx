import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Plus, X, Video } from 'lucide-react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

export default function InstructorUpload() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
    tags: '',
    learningObjectives: '',
    prerequisites: '',
    thumbnail: '',
  });
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addVideo = () => {
    setVideos([...videos, { title: '', videoUrl: '', duration: 0, order: videos.length }]);
  };

  const updateVideo = (index, field, value) => {
    const updated = [...videos];
    updated[index][field] = value;
    setVideos(updated);
  };

  const removeVideo = (index) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const courseData = {
        ...formData,
        price: parseInt(formData.price),
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        learningObjectives: formData.learningObjectives
          .split('\n')
          .map((o) => o.trim())
          .filter(Boolean),
        prerequisites: formData.prerequisites
          .split('\n')
          .map((p) => p.trim())
          .filter(Boolean),
        videos,
        isPublished: true,
      };

      const { data } = await api.post('/courses', courseData);
      toast.success('Course created successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        price: 0,
        tags: '',
        learningObjectives: '',
        prerequisites: '',
        thumbnail: '',
      });
      setVideos([]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-20">
        <h1 className="mb-8 text-4xl font-bold text-white">Upload Course</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm text-gray-400">Course Title *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2 text-white outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-gray-400">Description *</label>
                    <textarea
                      name="description"
                      required
                      rows={6}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2 text-white outline-none focus:border-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm text-gray-400">Category *</label>
                      <select
                        name="category"
                        required
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2 text-white outline-none focus:border-white"
                      >
                        <option value="">Select category</option>
                        <option value="programming">Programming</option>
                        <option value="design">Design</option>
                        <option value="business">Business</option>
                        <option value="science">Science</option>
                        <option value="language">Language</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-gray-400">Price (Credits) *</label>
                      <input
                        type="number"
                        name="price"
                        required
                        min="0"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2 text-white outline-none focus:border-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-gray-400">Thumbnail URL</label>
                    <input
                      type="url"
                      name="thumbnail"
                      value={formData.thumbnail}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2 text-white outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-gray-400">Tags (comma-separated)</label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="tag1, tag2, tag3"
                      className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2 text-white outline-none focus:border-white"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Course Videos</CardTitle>
                    <Button type="button" variant="secondary" onClick={addVideo} size="sm">
                      <Plus size={18} className="mr-2" />
                      Add Video
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {videos.length === 0 ? (
                    <div className="py-8 text-center text-gray-400">
                      <Video size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No videos added yet</p>
                    </div>
                  ) : (
                    videos.map((video, index) => (
                      <div
                        key={index}
                        className="rounded-lg border border-gray-800 bg-gray-900 p-4"
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <span className="font-medium text-white">Video {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeVideo(index)}
                            className="rounded-lg p-2 text-red-400 hover:bg-gray-800"
                          >
                            <X size={18} />
                          </button>
                        </div>
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Video Title"
                            value={video.title}
                            onChange={(e) => updateVideo(index, 'title', e.target.value)}
                            className="w-full rounded-lg border border-gray-800 bg-gray-800 px-4 py-2 text-white outline-none focus:border-white"
                          />
                          <input
                            type="url"
                            placeholder="Video URL"
                            value={video.videoUrl}
                            onChange={(e) => updateVideo(index, 'videoUrl', e.target.value)}
                            className="w-full rounded-lg border border-gray-800 bg-gray-800 px-4 py-2 text-white outline-none focus:border-white"
                          />
                          <input
                            type="number"
                            placeholder="Duration (seconds)"
                            value={video.duration}
                            onChange={(e) => updateVideo(index, 'duration', parseInt(e.target.value) || 0)}
                            className="w-full rounded-lg border border-gray-800 bg-gray-800 px-4 py-2 text-white outline-none focus:border-white"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Learning Objectives</CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    name="learningObjectives"
                    rows={4}
                    value={formData.learningObjectives}
                    onChange={handleInputChange}
                    placeholder="Enter learning objectives (one per line)"
                    className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2 text-white outline-none focus:border-white"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Prerequisites</CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    name="prerequisites"
                    rows={4}
                    value={formData.prerequisites}
                    onChange={handleInputChange}
                    placeholder="Enter prerequisites (one per line)"
                    className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2 text-white outline-none focus:border-white"
                  />
                </CardContent>
              </Card>

              <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                {loading ? 'Creating Course...' : 'Create Course'}
              </Button>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h3 className="mb-4 text-lg font-bold text-white">Course Creation Tips</h3>
                  <ul className="space-y-3 text-sm text-gray-400">
                    <li>• Provide a clear and descriptive title</li>
                    <li>• Write a detailed description</li>
                    <li>• Add high-quality video content</li>
                    <li>• Set appropriate pricing</li>
                    <li>• Include learning objectives</li>
                    <li>• You'll earn credits when students enroll</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

