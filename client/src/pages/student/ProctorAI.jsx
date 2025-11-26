import { useState, useEffect } from "react";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  Users,
  Calendar,
  Plus,
  Trash2,
  Eye,
  Video,
  LogOut,
  LayoutDashboard,
  FileText,
  Settings,
} from "lucide-react";
import api from "../../lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { formatDate } from "../../lib/utils";
import toast from "react-hot-toast";
import ProctorAIComponent from "../../components/ProctorAI";

export default function ProctorAI() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [examRooms, setExamRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinExam, setShowJoinExam] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [proctorLogs, setProctorLogs] = useState([]);
  const [isProctorActive, setIsProctorActive] = useState(false);
  const [currentExam, setCurrentExam] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [timerInterval, setTimerInterval] = useState(null);

  // Form states
  const [roomForm, setRoomForm] = useState({
    name: "",
    googleFormLink: "https://forms.google.com/",
    examDuration: 60,
    linkOpenDuration: 2,
  });

  const [joinForm, setJoinForm] = useState({
    name: "",
    rollNumber: "",
    roomCode: "",
  });

  // Guest identity
  const guestId =
    localStorage.getItem("guestId") ||
    `g-${Math.random().toString(36).slice(2)}`;
  const guestName =
    localStorage.getItem("guestName") ||
    `Guest-${Math.floor(Math.random() * 9000 + 1000)}`;

  useEffect(() => {
    localStorage.setItem("guestId", guestId);
    localStorage.setItem("guestName", guestName);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsRes, studentsRes] = await Promise.all([
        api.get("/api/proctor/exam-rooms"),
        api.get("/api/proctor/students"),
      ]);
      setExamRooms(roomsRes.data || []);
      setStudents(studentsRes.data || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setExamRooms([]);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...roomForm,
        createdBy: guestId,
        createdByName: guestName,
      };
      const { data } = await api.post("/api/proctor/exam-rooms", payload);
      toast.success(
        data.message ||
          `Exam room created successfully! Room Code: ${data.uniqueCode}`
      );
      setRoomForm({
        name: "",
        googleFormLink: "https://forms.google.com/",
        examDuration: 60,
        linkOpenDuration: 2,
      });
      fetchData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create exam room"
      );
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Are you sure you want to delete this exam room?"))
      return;
    try {
      await api.delete(`/api/proctor/exam-rooms/${roomId}`);
      toast.success("Exam room deleted!");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete exam room");
    }
  };

  const handleJoinExam = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: joinForm.name,
        rollNumber: joinForm.rollNumber,
        roomCode: joinForm.roomCode,
        guestId,
        guestName,
      };
      const { data } = await api.post("/api/proctor/join-exam", payload);

      // After joining, get exam details (like Django start_exam view)
      const examData = await api.get(
        `/api/proctor/start-exam/${data.student.roomCode}/${data.student.rollNumber}`
      );

      const examInfo = {
        ...examData.data,
        student: data.student,
      };
      setCurrentExam(examInfo);
      setIsProctorActive(true);
      setShowJoinExam(false);
      setProctorLogs([]);

      // Start timer
      const duration = examInfo.examDuration * 60; // Convert to seconds
      setTimeRemaining(duration);
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleEndExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setTimerInterval(interval);

      toast.success("Exam started! Monitoring is active.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to join exam");
    }
  };

  const handleEndExam = async () => {
    if (
      currentExam &&
      !window.confirm("Are you sure you want to end the exam?")
    )
      return;

    // Clear timer
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    try {
      if (currentExam) {
        // Django uses 'log' parameter with JSON string
        await api.post(
          `/api/proctor/end-exam/${currentExam.roomCode}/${currentExam.rollNumber}`,
          {
            log: JSON.stringify(proctorLogs),
          }
        );
        toast.success("Exam submitted successfully!");
      }
      setIsProctorActive(false);
      setCurrentExam(null);
      setProctorLogs([]);
      setTimeRemaining(null);
      setJoinForm({ name: "", rollNumber: "", roomCode: "" });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit exam");
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  const handleViewLogs = async (student) => {
    setSelectedStudent(student);
    setActiveTab("logs");
    // Fetch logs from API (like Django get_student_logs)
    try {
      const { data } = await api.get(
        `/api/proctor/logs?studentName=${encodeURIComponent(student.name)}`
      );
      setSelectedStudent({ ...student, logs: data.logs || [] });
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
  };

  // Calculate stats
  const stats = {
    totalRooms: examRooms.length,
    totalStudents: students.length,
    activeExams: students.filter((s) => s.startTime && !s.endTime).length,
  };

  // Get recent students
  const recentStudents = students
    .sort(
      (a, b) =>
        new Date(b.date || b.startTime) - new Date(a.date || a.startTime)
    )
    .slice(0, 10);

  // Get logs for selected student
  const studentLogs = selectedStudent?.logs || [];

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center space-x-2 mb-8">
            <Video className="text-blue-500" size={28} />
            <h2 className="text-xl font-bold text-black dark:text-white">
              SARVASVA
            </h2>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "dashboard"
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
              }`}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab("create-room")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "create-room"
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
              }`}
            >
              <Plus size={20} />
              <span>Create Exam Room</span>
            </button>

            <button
              onClick={() => setActiveTab("manage-students")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "manage-students"
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
              }`}
            >
              <Users size={20} />
              <span>Manage Students</span>
            </button>

            <button
              onClick={() => setActiveTab("logs")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "logs"
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
              }`}
            >
              <FileText size={20} />
              <span>Logs & Reports</span>
            </button>

            <button
              onClick={() => setShowJoinExam(true)}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <Video size={20} />
              <span>Join Exam</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-900"
                />
              ))}
            </div>
          ) : (
            <>
              {/* Dashboard Tab */}
              {activeTab === "dashboard" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
                      Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      Welcome to ProctorAI - AI-Powered Exam Monitoring
                    </p>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Exam Rooms Created
                            </p>
                            <h3 className="text-3xl font-bold text-black dark:text-white mt-2">
                              {stats.totalRooms}
                            </h3>
                          </div>
                          <Calendar className="text-blue-500" size={40} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Total Students
                            </p>
                            <h3 className="text-3xl font-bold text-black dark:text-white mt-2">
                              {stats.totalStudents}
                            </h3>
                          </div>
                          <Users className="text-green-500" size={40} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Active Exams
                            </p>
                            <h3 className="text-3xl font-bold text-black dark:text-white mt-2">
                              {stats.activeExams}
                            </h3>
                          </div>
                          <Clock className="text-orange-500" size={40} />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Students Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Exam Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-800">
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Student
                              </th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Roll No.
                              </th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Date
                              </th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Warnings
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentStudents.length === 0 ? (
                              <tr>
                                <td
                                  colSpan="4"
                                  className="py-8 text-center text-gray-500 dark:text-gray-400"
                                >
                                  No recent exam activity
                                </td>
                              </tr>
                            ) : (
                              recentStudents.map((student, index) => (
                                <tr
                                  key={index}
                                  className="border-b border-gray-100 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900"
                                >
                                  <td className="py-3 px-4">
                                    <div className="flex items-center space-x-2">
                                      <Users
                                        size={16}
                                        className="text-gray-400"
                                      />
                                      <span className="text-black dark:text-white">
                                        {student.name}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                    {student.rollNumber}
                                  </td>
                                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                    {formatDate(
                                      student.date || student.startTime
                                    )}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span
                                      className={`px-2 py-1 rounded text-xs font-semibold ${
                                        (student.warnings || 0) > 0
                                          ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                                          : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                                      }`}
                                    >
                                      {student.warnings || 0}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Exam Rooms List */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Exam Rooms</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {examRooms.length === 0 ? (
                        <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                          No exam rooms created yet
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {examRooms.map((room) => (
                            <div
                              key={room.id}
                              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900"
                            >
                              <div>
                                <p className="font-semibold text-black dark:text-white">
                                  {room.name}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Code: {room.uniqueCode}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Create Exam Room Tab */}
              {activeTab === "create-room" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
                      Create Exam Room
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      Create a new exam room for students to join
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Create New Room</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleCreateRoom} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Room Name
                            </label>
                            <input
                              type="text"
                              required
                              value={roomForm.name}
                              onChange={(e) =>
                                setRoomForm({
                                  ...roomForm,
                                  name: e.target.value,
                                })
                              }
                              className="w-full rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-black dark:text-white"
                              placeholder="Enter exam room name"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Google Form Link
                            </label>
                            <input
                              type="url"
                              required
                              value={roomForm.googleFormLink}
                              onChange={(e) =>
                                setRoomForm({
                                  ...roomForm,
                                  googleFormLink: e.target.value,
                                })
                              }
                              className="w-full rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-black dark:text-white"
                              placeholder="https://forms.google.com/..."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Exam Duration (minutes)
                            </label>
                            <input
                              type="number"
                              required
                              min="1"
                              value={roomForm.examDuration}
                              onChange={(e) =>
                                setRoomForm({
                                  ...roomForm,
                                  examDuration: parseInt(e.target.value),
                                })
                              }
                              className="w-full rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-black dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Link Open Duration (hours)
                            </label>
                            <input
                              type="number"
                              required
                              min="1"
                              value={roomForm.linkOpenDuration}
                              onChange={(e) =>
                                setRoomForm({
                                  ...roomForm,
                                  linkOpenDuration: parseInt(e.target.value),
                                })
                              }
                              className="w-full rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-black dark:text-white"
                            />
                          </div>

                          <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                          >
                            Create Room
                          </Button>
                        </form>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Existing Rooms</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {examRooms.length === 0 ? (
                          <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No exam rooms created
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {examRooms.map((room) => (
                              <div
                                key={room.id}
                                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900"
                              >
                                <div>
                                  <p className="font-semibold text-black dark:text-white">
                                    {room.name}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Code: {room.uniqueCode} | Duration:{" "}
                                    {room.examDuration} min
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleDeleteRoom(room.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                >
                                  <Trash2 size={20} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Manage Students Tab */}
              {activeTab === "manage-students" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
                      Manage Students
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      View and manage student exam records
                    </p>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Student Records</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-800">
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Exam Name
                              </th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Student
                              </th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Roll No.
                              </th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Date
                              </th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Warnings
                              </th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {students.length === 0 ? (
                              <tr>
                                <td
                                  colSpan="6"
                                  className="py-8 text-center text-gray-500 dark:text-gray-400"
                                >
                                  No students found
                                </td>
                              </tr>
                            ) : (
                              students.map((student, index) => (
                                <tr
                                  key={index}
                                  className="border-b border-gray-100 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900"
                                >
                                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                    {student.examRoomName || "N/A"}
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center space-x-2">
                                      <Users
                                        size={16}
                                        className="text-gray-400"
                                      />
                                      <span className="text-black dark:text-white">
                                        {student.name}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                    {student.rollNumber}
                                  </td>
                                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                    {formatDate(
                                      student.date || student.startTime
                                    )}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span
                                      className={`px-2 py-1 rounded text-xs font-semibold ${
                                        (student.warnings || 0) > 0
                                          ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                                          : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                                      }`}
                                    >
                                      {student.warnings || 0}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <button
                                      onClick={() => handleViewLogs(student)}
                                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                                    >
                                      <Eye size={18} />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Logs & Reports Tab */}
              {activeTab === "logs" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
                      Logs & Reports
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      View detailed monitoring logs for students
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Students</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {students.length === 0 ? (
                            <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                              No students found
                            </p>
                          ) : (
                            students.map((student, index) => (
                              <button
                                key={index}
                                onClick={() => setSelectedStudent(student)}
                                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                                  selectedStudent?.id === student.id
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                    : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <Users size={16} className="text-gray-400" />
                                  <span className="font-semibold text-black dark:text-white">
                                    {student.name}
                                  </span>
                                  <span
                                    className={`ml-auto px-2 py-1 rounded text-xs font-semibold ${
                                      (student.warnings || 0) > 0
                                        ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                                        : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                                    }`}
                                  >
                                    {student.warnings || 0} warnings
                                  </span>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>
                          Logs for {selectedStudent?.name || "Select a student"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {!selectedStudent ? (
                          <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                            Select a student to view logs
                          </p>
                        ) : studentLogs.length === 0 ? (
                          <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No logs found for this student
                          </p>
                        ) : (
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {studentLogs.map((log, index) => (
                              <div
                                key={index}
                                className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                              >
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {log}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Join Exam Modal */}
      <Modal
        isOpen={showJoinExam}
        onClose={() => setShowJoinExam(false)}
        title="Join Exam Room"
      >
        <form onSubmit={handleJoinExam} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Name
            </label>
            <input
              type="text"
              required
              value={joinForm.name}
              onChange={(e) =>
                setJoinForm({ ...joinForm, name: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-black dark:text-white"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Roll Number
            </label>
            <input
              type="text"
              required
              value={joinForm.rollNumber}
              onChange={(e) =>
                setJoinForm({ ...joinForm, rollNumber: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-black dark:text-white"
              placeholder="Enter your roll number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Room Code
            </label>
            <input
              type="text"
              required
              value={joinForm.roomCode}
              onChange={(e) =>
                setJoinForm({ ...joinForm, roomCode: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-black dark:text-white"
              placeholder="Enter exam room code"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowJoinExam(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Start Exam
            </Button>
          </div>
        </form>
      </Modal>

      {/* Active Exam with ProctorAI */}
      {currentExam && (
        <Modal
          isOpen={!!currentExam}
          onClose={() => {}}
          title={currentExam.name || "Exam in Progress"}
          className="max-w-6xl"
        >
          <div className="space-y-6">
            {/* ProctorAI Monitoring */}
            <ProctorAIComponent
              isActive={isProctorActive}
              onLogsUpdate={(logs) => setProctorLogs(logs)}
            />

            {/* Exam Content */}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
              <iframe
                src={currentExam.googleFormLink}
                width="100%"
                height="600"
                frameBorder="0"
                className="rounded-lg"
                title="Exam Form"
              />
            </div>

            {/* Timer and End Exam */}
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 pt-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Clock
                    size={20}
                    className="text-gray-600 dark:text-gray-400"
                  />
                  {timeRemaining !== null && (
                    <span className="text-lg font-semibold text-black dark:text-white">
                      Time Remaining:{" "}
                      {Math.floor(timeRemaining / 60)
                        .toString()
                        .padStart(2, "0")}
                      :{(timeRemaining % 60).toString().padStart(2, "0")}
                    </span>
                  )}
                </div>
              </div>
              <Button variant="primary" onClick={handleEndExam}>
                End Exam
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
