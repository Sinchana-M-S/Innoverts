import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Edit2, Sun, Moon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";

export default function Profile() {
  // ✅ Load guest profile
  const initialProfile =
    JSON.parse(localStorage.getItem("guestProfile")) || {
      name: "Guest User",
      email: "guest@example.com",
      bio: "",
      skills: [],
      credits: 100,
    };

  const [profile, setProfile] = useState(initialProfile);
  const [editing, setEditing] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  const [formData, setFormData] = useState({
    name: initialProfile.name,
    bio: initialProfile.bio,
    skills: initialProfile.skills.join(", "),
  });

  const { logout } = useAuthStore();
  const navigate = useNavigate();

  // ✅ Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleSave = () => {
    const updated = {
      ...profile,
      name: formData.name,
      bio: formData.bio,
      skills: formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    setProfile(updated);
    localStorage.setItem("guestProfile", JSON.stringify(updated));
    toast.success("Profile updated!");
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-4 py-20">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-black dark:text-white">Profile</h1>

          {/* ✅ Theme Switcher */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-black dark:text-white"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Info */}
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
                    {editing ? "Cancel" : "Edit"}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-sm text-gray-400">Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2"
                    />
                  ) : (
                    <p className="text-black dark:text-white">{profile.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <div className="flex items-center space-x-2">
                    <Mail size={18} className="text-gray-400" />
                    <p className="text-black dark:text-white">{profile.email}</p>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="text-sm text-gray-400">Bio</label>
                  {editing ? (
                    <textarea
                      rows={3}
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2"
                    />
                  ) : (
                    <p className="text-gray-300">
                      {profile.bio || "No bio yet"}
                    </p>
                  )}
                </div>

                {/* Skills */}
                <div>
                  <label className="text-sm text-gray-400">Skills</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.skills}
                      onChange={(e) =>
                        setFormData({ ...formData, skills: e.target.value })
                      }
                      className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.length > 0 ? (
                        profile.skills.map((s, i) => (
                          <span
                            key={i}
                            className="bg-gray-700 px-3 py-1 text-sm rounded-full text-gray-200"
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400">No skills added</span>
                      )}
                    </div>
                  )}
                </div>

                {editing && (
                  <Button variant="primary" onClick={handleSave}>
                    Save Changes
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Credits */}
            <Card>
              <CardHeader>
                <CardTitle>Credits</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">{profile.credits}</p>
                <p className="text-gray-400 text-sm">Available Credits</p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="text-center p-6">
                <div className="flex justify-center mb-4">
                  <div className="h-24 w-24 rounded-full bg-gray-800 flex items-center justify-center">
                    <User size={48} className="text-gray-400" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white">{profile.name}</h3>
                <p className="text-gray-400 text-sm">{profile.email}</p>
                <Button
                  variant="ghost"
                  className="mt-6 w-full border border-gray-700 dark:border-gray-700 hover:border-red-500 hover:text-red-500"
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                >
                  Log out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
