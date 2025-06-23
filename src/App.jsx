import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

export default function App() {
  const [routines, setRoutines] = useState([]);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('exerciseAppData');
    if (saved) {
      try {
        const { routines: r, darkMode: d } = JSON.parse(saved);
        setRoutines(r || []);
        setDarkMode(d || false);
      } catch {}
    }
  }, []);

  // Show toast message
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Save to localStorage
  const saveData = () => {
    const payload = JSON.stringify({ routines, darkMode });
    localStorage.setItem('exerciseAppData', payload);
    showToast('Data saved successfully', 'success');
  };

  // Routine operations
  const addRoutine = () => {
    if (!newRoutineName.trim()) return;
    setRoutines((prev) => [
      ...prev,
      { id: Date.now(), name: newRoutineName.trim(), checked: false, completed: false, note: '', exercises: [] }
    ]);
    setNewRoutineName('');
    showToast('Routine added', 'success');
  };

  const updateRoutine = (id, updates) => {
    setRoutines((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const deleteRoutine = (id) => {
    setRoutines((prev) => prev.filter((r) => r.id !== id));
    showToast('Routine deleted', 'info');
  };

  const completeRoutine = (id) => {
    updateRoutine(id, { completed: true });
    showToast('Routine completed', 'success');
  };

  const toggleRoutineCheck = (id) => {
    setRoutines((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const newChecked = !r.checked;
          return {
            ...r,
            checked: newChecked,
            exercises: r.exercises.map((ex) => ({ ...ex, checked: newChecked }))
          };
        }
        return r;
      })
    );
  };

  // Exercise operations
  const addExercise = (routineId, ex) => {
    updateRoutine(routineId, {
      exercises: routines
        .find((r) => r.id === routineId)
        .exercises.concat({ ...ex, id: Date.now(), checked: false, completed: false, note: '' })
    });
    showToast('Exercise added', 'success');
  };

  const updateExercise = (rId, exId, updates) => {
    updateRoutine(rId, {
      exercises: routines
        .find((r) => r.id === rId)
        .exercises.map((ex) => (ex.id === exId ? { ...ex, ...updates } : ex))
    });
  };

  const deleteExercise = (rId, exId) => {
    updateRoutine(rId, {
      exercises: routines
        .find((r) => r.id === rId)
        .exercises.filter((ex) => ex.id !== exId)
    });
    showToast('Exercise deleted', 'info');
  };

  const completeExercise = (rId, exId) => {
    updateExercise(rId, exId, { completed: true });
    showToast('Exercise completed', 'success');
  };

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <>
      <style>{`
        :root {
          --bg: #f7f7f7;
          --card-bg: #fff;
          --text: #333;
          --input-bg: #fff;
          --btn-bg: #007bff;
          --btn-hover: #0056b3;
          --success: #28a745;
          --info: #17a2b8;
        }
        .dark-mode {
          --bg: #181818;
          --card-bg: #242424;
          --text: #f1f1f1;
          --input-bg: #333;
          --btn-bg: #0069d9;
          --btn-hover: #0053ba;
        }
        * { box-sizing: border-box; }
        body, #root { margin: 0; font-family: Arial, sans-serif; }
        .app { background: var(--bg); color: var(--text); min-height: 100vh; padding: 20px; }
        h1 { text-align: center; }
        .controls { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
        input, textarea, button { padding: 8px; font-size: 14px; }
        input, textarea { background: var(--input-bg); color: var(--text); border: 1px solid #ccc; border-radius: 4px; }
        button { background: var(--btn-bg); color: white; border: none; border-radius: 4px; cursor: pointer; margin: 2px; }
        button:hover { background: var(--btn-hover); }
        .routine { background: var(--card-bg); padding: 15px; margin-bottom: 15px; border-radius: 6px; }
        .routine.completed { border-left: 6px solid var(--success); }
        .routine-header { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
        .routine-header input[type='text'] { flex: 1; min-width: 100px; border: none; background: transparent; font-size: 16px; font-weight: bold; color: var(--text); }
        .notes { width: 100%; min-height: 50px; margin-top: 8px; border-radius: 4px; }
        .ex-list { margin-top: 12px; }
        .exercise { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid #eee; }
        .exercise.completed { background: rgba(40,167,69,0.1); }
        .ex-info { flex: 1; min-width: 80px; border: none; background: transparent; color: var(--text); }
        .exercise input[type='number'] { width: 60px; min-width: 50px; border: 1px solid #ccc; border-radius: 4px; }
        .add-ex { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
        .add-ex input { flex: 1; min-width: 80px; }
        .toast-container { position: fixed; top: 20px; right: 20px; display: flex; flex-direction: column; gap: 8px; }
        .toast { padding: 10px 14px; border-radius: 4px; color: white; }
        .toast.success { background: var(--success); }
        .toast.info { background: var(--info); }
      `}</style>
      <div className={darkMode ? 'app dark-mode' : 'app'}>
        <h1>Exercise CRUD App</h1>
        <div className="controls">
          <input
            type="text"
            placeholder="New routine name..."
            value={newRoutineName}
            onChange={(e) => setNewRoutineName(e.target.value)}
          />
          <button onClick={addRoutine}>Add Routine</button>
          <button onClick={saveData}>Save Data</button>
          <button onClick={toggleDarkMode}>{darkMode ? 'Light Mode' : 'Dark Mode'}</button>
        </div>

        {routines.map((r) => (
          <div key={r.id} className={`routine ${r.completed ? 'completed' : ''}`}>            
            <div className="routine-header">
              <label>
                <input
                  type="checkbox"
                  checked={r.checked}
                  onChange={() => toggleRoutineCheck(r.id)}
                />
              </label>
              <input
                type="text"
                value={r.name}
                onChange={(e) => updateRoutine(r.id, { name: e.target.value })}
              />
              <button onClick={() => completeRoutine(r.id)}>Complete</button>
              <button onClick={() => deleteRoutine(r.id)}>Delete</button>
            </div>
            <textarea
              className="notes"
              placeholder="Routine notes..."
              value={r.note}
              onChange={(e) => updateRoutine(r.id, { note: e.target.value })}
            />
            <div className="ex-list">
              {r.exercises.map((ex) => (
                <div key={ex.id} className={`exercise ${ex.completed ? 'completed' : ''}`}>                  
                  <label>
                    <input
                      type="checkbox"
                      checked={ex.checked}
                      onChange={() => updateExercise(r.id, ex.id, { checked: !ex.checked })}
                    />
                  </label>
                  <input
                    className="ex-info"
                    type="text"
                    value={ex.name}
                    onChange={(e) => updateExercise(r.id, ex.id, { name: e.target.value })}
                  />
                  <input
                    type="number"
                    value={ex.weight}
                    onChange={(e) => updateExercise(r.id, ex.id, { weight: e.target.value })}
                  />kg x
                  <input
                    type="number"
                    value={ex.sets}
                    onChange={(e) => updateExercise(r.id, ex.id, { sets: e.target.value })}
                  /> x
                  <input
                    type="number"
                    value={ex.reps}
                    onChange={(e) => updateExercise(r.id, ex.id, { reps: e.target.value })}
                  />
                  <button onClick={() => completeExercise(r.id, ex.id)}>Complete</button>
                  <button onClick={() => deleteExercise(r.id, ex.id)}>Delete</button>
                  <textarea
                    className="notes"
                    placeholder="Exercise note..."
                    value={ex.note}
                    onChange={(e) => updateExercise(r.id, ex.id, { note: e.target.value })}
                  />
                </div>
              ))}
            </div>
            <AddExerciseForm onAdd={(ex) => addExercise(r.id, ex)} />
          </div>
        ))}

        <div className="toast-container">
          {toasts.map((t) => (
            <div key={t.id} className={`toast ${t.type}`}>{t.message}</div>
          ))}
        </div>
      </div>
    </>
  );
}

function AddExerciseForm({ onAdd }) {
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');

  const handleAdd = () => {
    if (!name.trim() || !weight || !sets || !reps) return;
    onAdd({ name: name.trim(), weight, sets, reps });
    setName(''); setWeight(''); setSets(''); setReps('');
  };

  return (
    <div className="add-ex">
      <input type="text" placeholder="Exercise name" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="number" placeholder="Weight (kg)" value={weight} onChange={(e) => setWeight(e.target.value)} />
      <input type="number" placeholder="Sets" value={sets} onChange={(e) => setSets(e.target.value)} />
      <input type="number" placeholder="Reps" value={reps} onChange={(e) => setReps(e.target.value)} />
      <button onClick={handleAdd}>Add Exercise</button>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
