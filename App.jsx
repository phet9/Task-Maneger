import { useState, useEffect, useRef } from "react";

const PRIORITIES = {
  high:   { label: "High",   color: "#C0392B", bg: "#FDEDEC" },
  medium: { label: "Medium", color: "#D68910", bg: "#FEF9E7" },
  low:    { label: "Low",    color: "#1E8449", bg: "#EAFAF1" },
};

const FILTERS = ["All", "Active", "Completed"];

const STORAGE_KEY = "taskmanager-tasks";

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

async function loadTasks() {
  try {
    const result = await window.storage.get(STORAGE_KEY);
    return result ? JSON.parse(result.value) : [];
  } catch {
    return [];
  }
}

async function saveTasks(tasks) {
  try {
    await window.storage.set(STORAGE_KEY, JSON.stringify(tasks));
  } catch {}
}

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("All");
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState("medium");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [loaded, setLoaded] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    loadTasks().then(t => { setTasks(t); setLoaded(true); });
  }, []);

  useEffect(() => {
    if (loaded) saveTasks(tasks);
  }, [tasks, loaded]);

  const filtered = tasks.filter(t =>
    filter === "All" ? true : filter === "Active" ? !t.done : t.done
  );

  const activeCount = tasks.filter(t => !t.done).length;

  function addTask() {
    const text = input.trim();
    if (!text) return;
    const newTask = { id: genId(), text, priority, done: false, createdAt: Date.now() };
    setTasks(prev => [newTask, ...prev]);
    setInput("");
    inputRef.current?.focus();
  }

  function toggleDone(id) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  function deleteTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  function startEdit(task) {
    setEditId(task.id);
    setEditText(task.text);
  }

  function saveEdit(id) {
    const text = editText.trim();
    if (!text) return;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, text } : t));
    setEditId(null);
  }

  function clearCompleted() {
    setTasks(prev => prev.filter(t => !t.done));
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F7F5F2",
      fontFamily: "'Georgia', serif",
      padding: "2.5rem 1rem",
    }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{
            fontSize: 36,
            fontWeight: 700,
            letterSpacing: "-1.5px",
            color: "#1A1A1A",
            margin: 0,
            lineHeight: 1,
            fontFamily: "'Georgia', serif",
          }}>
            My Tasks
          </h1>
          <p style={{ color: "#888", fontSize: 14, marginTop: 6, fontFamily: "sans-serif" }}>
            {activeCount === 0 ? "All done — great work!" : `${activeCount} task${activeCount !== 1 ? "s" : ""} remaining`}
          </p>
        </div>

        {/* Add Task */}
        <div style={{
          background: "#fff",
          borderRadius: 16,
          padding: "1rem 1.25rem",
          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          marginBottom: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTask()}
            placeholder="Add a new task..."
            style={{
              border: "none",
              outline: "none",
              fontSize: 16,
              color: "#1A1A1A",
              background: "transparent",
              fontFamily: "'Georgia', serif",
              width: "100%",
            }}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {/* Priority Selector */}
            <div style={{ display: "flex", gap: 6 }}>
              {Object.entries(PRIORITIES).map(([key, p]) => (
                <button
                  key={key}
                  onClick={() => setPriority(key)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 20,
                    border: priority === key ? `1.5px solid ${p.color}` : "1.5px solid #E0E0E0",
                    background: priority === key ? p.bg : "transparent",
                    color: priority === key ? p.color : "#999",
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: "sans-serif",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <button
              onClick={addTask}
              style={{
                background: "#1A1A1A",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "8px 18px",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "sans-serif",
                cursor: "pointer",
                transition: "opacity 0.15s",
              }}
              onMouseOver={e => e.target.style.opacity = "0.8"}
              onMouseOut={e => e.target.style.opacity = "1"}
            >
              + Add
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: "1rem" }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "6px 16px",
                borderRadius: 20,
                border: "none",
                background: filter === f ? "#1A1A1A" : "transparent",
                color: filter === f ? "#fff" : "#888",
                fontSize: 13,
                fontWeight: 500,
                fontFamily: "sans-serif",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Task List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.length === 0 && (
            <div style={{
              textAlign: "center",
              padding: "3rem 0",
              color: "#BBB",
              fontFamily: "sans-serif",
              fontSize: 15,
            }}>
              {filter === "Completed" ? "No completed tasks yet." : "Nothing here. Add something!"}
            </div>
          )}

          {filtered.map(task => {
            const p = PRIORITIES[task.priority];
            const isEditing = editId === task.id;
            return (
              <div
                key={task.id}
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  padding: "14px 16px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  opacity: task.done ? 0.6 : 1,
                  transition: "opacity 0.2s",
                  borderLeft: `4px solid ${p.color}`,
                }}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleDone(task.id)}
                  aria-label={task.done ? "Mark incomplete" : "Mark complete"}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    border: `2px solid ${task.done ? p.color : "#DDD"}`,
                    background: task.done ? p.color : "transparent",
                    cursor: "pointer",
                    flexShrink: 0,
                    marginTop: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                  }}
                >
                  {task.done && (
                    <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                      <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>

                {/* Text / Edit */}
                <div style={{ flex: 1 }}>
                  {isEditing ? (
                    <input
                      autoFocus
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") saveEdit(task.id);
                        if (e.key === "Escape") setEditId(null);
                      }}
                      onBlur={() => saveEdit(task.id)}
                      style={{
                        border: "none",
                        borderBottom: "1.5px solid #1A1A1A",
                        outline: "none",
                        fontSize: 15,
                        width: "100%",
                        fontFamily: "'Georgia', serif",
                        background: "transparent",
                        color: "#1A1A1A",
                        padding: "2px 0",
                      }}
                    />
                  ) : (
                    <span style={{
                      fontSize: 15,
                      color: "#1A1A1A",
                      fontFamily: "'Georgia', serif",
                      textDecoration: task.done ? "line-through" : "none",
                      wordBreak: "break-word",
                    }}>
                      {task.text}
                    </span>
                  )}
                  <div style={{
                    marginTop: 4,
                    display: "inline-block",
                    background: p.bg,
                    color: p.color,
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: "sans-serif",
                    padding: "2px 8px",
                    borderRadius: 10,
                    letterSpacing: "0.5px",
                  }}>
                    {p.label.toUpperCase()}
                  </div>
                </div>

                {/* Actions */}
                {!isEditing && (
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <button
                      onClick={() => startEdit(task)}
                      aria-label="Edit task"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#BBB",
                        padding: "4px",
                        borderRadius: 6,
                        fontSize: 16,
                        lineHeight: 1,
                        transition: "color 0.15s",
                      }}
                      onMouseOver={e => e.currentTarget.style.color = "#555"}
                      onMouseOut={e => e.currentTarget.style.color = "#BBB"}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      aria-label="Delete task"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#BBB",
                        padding: "4px",
                        borderRadius: 6,
                        fontSize: 16,
                        lineHeight: 1,
                        transition: "color 0.15s",
                      }}
                      onMouseOver={e => e.currentTarget.style.color = "#C0392B"}
                      onMouseOut={e => e.currentTarget.style.color = "#BBB"}
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {tasks.some(t => t.done) && (
          <div style={{ marginTop: "1.25rem", textAlign: "center" }}>
            <button
              onClick={clearCompleted}
              style={{
                background: "none",
                border: "none",
                color: "#C0392B",
                fontSize: 13,
                fontFamily: "sans-serif",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Clear all completed
            </button>
          </div>
        )}

        {/* Stats Bar */}
        {tasks.length > 0 && (
          <div style={{
            marginTop: "2rem",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
          }}>
            {[
              { label: "Total", value: tasks.length },
              { label: "Active", value: tasks.filter(t => !t.done).length },
              { label: "Done", value: tasks.filter(t => t.done).length },
            ].map(s => (
              <div key={s.label} style={{
                background: "#fff",
                borderRadius: 12,
                padding: "12px",
                textAlign: "center",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#1A1A1A", fontFamily: "'Georgia', serif" }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 12, color: "#999", fontFamily: "sans-serif", marginTop: 2 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
