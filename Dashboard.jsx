import axios from "axios";
import React, { useState, useEffect } from "react";
import "./Dashboard.css";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taskText, setTaskText] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [taskTime, setTaskTime] = useState("");

  useEffect(() => {
    // Fetch tasks from backend on mount
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/tasks");
        setTasks(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch tasks:", err.message || err);
        setError("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const addTask = () => {
    if (!taskText.trim() || !taskDate) {
      alert("Please enter a task and select a date.");
      return;
    }

    const dateTime = taskTime ? `${taskDate}T${taskTime}` : `${taskDate}T00:00`;
    const newTask = {
      id: Date.now(),
      text: taskText.trim(),
      date: dateTime,
      completed: false,
    };

    // send to backend
    const create = async () => {
      try {
        const res = await axios.post("/api/tasks", newTask);
        setTasks((prev) => [...prev, res.data]);
        setTaskText("");
        setTaskDate("");
        setTaskTime("");
      } catch (err) {
        console.error("Failed to add task:", err.message || err);
        alert("Could not add task. Try again.");
      }
    };
    create();
  };

  const deleteTask = (id) => {
    const remove = async () => {
      try {
        await axios.delete(`/api/tasks/${id}`);
        setTasks((prev) => prev.filter((t) => t.id !== id));
      } catch (err) {
        console.error("Failed to delete task:", err.message || err);
        alert("Could not delete task. Try again.");
      }
    };
    remove();
  };

  const toggleComplete = (id) => {
    const toggle = async () => {
      try {
        const task = tasks.find((t) => t.id === id);
        if (!task) return;
        const updated = { ...task, completed: !task.completed };
        const res = await axios.put(`/api/tasks/${id}`, updated);
        setTasks((prev) => prev.map((t) => (t.id === id ? res.data : t)));
      } catch (err) {
        console.error("Failed to update task:", err.message || err);
        alert("Could not update task. Try again.");
      }
    };
    toggle();
  };

  const isToday = (taskDate) => {
    const today = new Date();
    const d = new Date(taskDate);
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const todayTasks = tasks.filter((t) => isToday(t.date) && !t.completed);
  const upcomingTasks = tasks.filter((t) => !isToday(t.date) && !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="todo-container">
      <h1 className="heading">My To-Do List</h1>

  <div className="input-section">
        <input
          type="text"
          placeholder="What needs doing?"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
        />
        <input
          type="date"
          value={taskDate}
          onChange={(e) => setTaskDate(e.target.value)}
        />
        <input
          type="time"
          value={taskTime}
          onChange={(e) => setTaskTime(e.target.value)}
        />
        <button onClick={addTask}>Add Task</button>
      </div>

      {loading ? (
        <p className="empty">Loading tasks...</p>
      ) : error ? (
        <p className="empty">{error}</p>
      ) : (
        <div className="task-sections-wrapper">

        {/* Today Section */}
        <div className="task-section">
          <h2>Today</h2>
          {todayTasks.length === 0 ? (
            <p className="empty">No tasks for today 🎉</p>
          ) : (
            todayTasks.map((t) => (
              <div key={t.id} className={`task ${t.completed ? "done" : ""}`}>
                <input
                  type="checkbox"
                  checked={t.completed}
                  onChange={() => toggleComplete(t.id)}
                />
                <div className="task-info">
                  <span>{t.text}</span>
                  <small>{formatDateTime(t.date)}</small>
                </div>
                <button className="delete" onClick={() => deleteTask(t.id)}>
                  ❌
                </button>
              </div>
            ))
          )}
        </div>

        {/* Upcoming Section */}
        <div className="task-section">
          <h2>Upcoming</h2>
          {upcomingTasks.length === 0 ? (
            <p className="empty">No upcoming tasks</p>
          ) : (
            upcomingTasks.map((t) => (
              <div key={t.id} className={`task ${t.completed ? "done" : ""}`}>
                <input
                  type="checkbox"
                  checked={t.completed}
                  onChange={() => toggleComplete(t.id)}
                />
                <div className="task-info">
                  <span>{t.text}</span>
                  <small>{formatDateTime(t.date)}</small>
                </div>
                <button className="delete" onClick={() => deleteTask(t.id)}>
                  ❌
                </button>
              </div>
            ))
          )}
        </div>

        {/* ✅ Completed Section */}
        <div className="task-section">
          <h2>Completed</h2>
          {completedTasks.length === 0 ? (
            <p className="empty">No completed tasks yet</p>
          ) : (
            completedTasks.map((t) => (
              <div key={t.id} className="task done">
                <input
                  type="checkbox"
                  checked={t.completed}
                  onChange={() => toggleComplete(t.id)}
                />
                <div className="task-info">
                  <span>{t.text}</span>
                  <small>{formatDateTime(t.date)}</small>
                </div>
                <button className="delete" onClick={() => deleteTask(t.id)}>
                  ❌
                </button>
              </div>
            ))
          )}
        </div>

        </div>
      )}
    </div>
  );
}
