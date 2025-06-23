import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

export default function App() {
  const [routines, setRoutines] = useState([]);
  const [newRoutineName, setNewRoutineName] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('exerciseAppData');
    if (saved) setRoutines(JSON.parse(saved));
  }, []);

  const saveData = () => {
    localStorage.setItem('exerciseAppData', JSON.stringify(routines));
    alert('Data saved!');
  };

  const addRoutine = () => {
    if (!newRoutineName.trim()) return;
    setRoutines([
      ...routines,
      { id: Date.now(), name: newRoutineName, checked: false, completed: false, exercises: [] }
    ]);
    setNewRoutineName('');
  };

  const updateRoutine = (id, updates) => {
    setRoutines(routines.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteRoutine = id => setRoutines(routines.filter(r => r.id !== id));
  const completeRoutine = id => updateRoutine(id, { completed: true });

  const toggleRoutine = id => {
    setRoutines(routines.map(r => {
      if (r.id === id) {
        const newChecked = !r.checked;
        return { ...r, checked: newChecked, exercises: r.exercises.map(ex => ({ ...ex, checked: newChecked })) };
      }
      return r;
    }));
  };

  const addExercise = (routineId, exercise) => {
    updateRoutine(routineId, { exercises: [...routines.find(r => r.id === routineId).exercises, exercise] });
  };

  const updateExercise = (rId, exId, updates) => {
    setRoutines(routines.map(r => {
      if (r.id === rId) {
        const exs = r.exercises.map(ex => ex.id === exId ? { ...ex, ...updates } : ex);
        const allChecked = exs.length > 0 && exs.every(e => e.checked);
        return { ...r, exercises: exs, checked: allChecked };
      }
      return r;
    }));
  };

  const deleteExercise = (rId, exId) => {
    setRoutines(routines.map(r => {
      if (r.id === rId) {
        const exs = r.exercises.filter(ex => ex.id !== exId);
        const allChecked = exs.length > 0 && exs.every(e => e.checked);
        return { ...r, exercises: exs, checked: allChecked };
      }
      return r;
    }));
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body, #root { margin: 0; font-family: Arial, sans-serif; background: #f7f7f7; }
        .app { max-width: 900px; margin: auto; padding: 20px; }
        h1 { text-align: center; color: #333; }
        .controls {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 20px;
        }
        input, button { padding: 8px; font-size: 14px; }
        input { flex: 1; min-width: 120px; border: 1px solid #ccc; border-radius: 4px; }
        button {
          border: none;
          background: #007bff;
          color: white;
          border-radius: 4px;
          cursor: pointer;
          margin: 2px;
          flex-shrink: 0;
        }
        button:hover { background: #0056b3; }
        .routine {
          background: white;
          padding: 15px;
          margin-bottom: 15px;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: background 0.3s;
        }
        .routine.completed { background: #d4edda; }
        .routine-header {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }
        .routine-header input[type="text"] {
          font-weight: bold;
          font-size: 16px;
          border: none;
          background: transparent;
          flex: 1;
          min-width: 100px;
        }
        .ex-list { margin-top: 10px; }
        .exercise {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          padding: 6px 0;
          border-bottom: 1px solid #eee;
        }
        .exercise:last-child { border-bottom: none; }
        .ex-info {
          flex: 1;
          min-width: 100px;
          border: none;
          background: transparent;
        }
        .exercise input[type="number"] {
          width: 60px;
          min-width: 50px;
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 4px;
        }
        .ex-controls { display: flex; flex-wrap: wrap; gap: 6px; }
        .add-ex {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 10px;
        }
        .add-ex input { flex: 1; min-width: 80px; }
      `}</style>
      <div className="app">
        <h1>Exercise CRUD App</h1>
        <div className="controls">
          <input
            type="text"
            placeholder="New routine name..."
            value={newRoutineName}
            onChange={e => setNewRoutineName(e.target.value)}
          />
          <button onClick={addRoutine}>Add Routine</button>
          <button onClick={saveData}>Save Data</button>
        </div>
        {routines.map(routine => (
          <div key={routine.id} className={`routine ${routine.completed ? 'completed' : ''}`}>
            <div className="routine-header">
              <label>
                <input
                  type="checkbox"
                  checked={routine.checked}
                  onChange={() => toggleRoutine(routine.id)}
                />
              </label>
              <input
                type="text"
                value={routine.name}
                onChange={e => updateRoutine(routine.id, { name: e.target.value })}
              />
              <button onClick={() => completeRoutine(routine.id)}>Complete</button>
              <button onClick={() => deleteRoutine(routine.id)}>Delete</button>
            </div>
            <div className="ex-list">
              {routine.exercises.map(ex => (
                <div key={ex.id} className="exercise">
                  <label><input
                    type="checkbox"
                    checked={ex.checked}
                    onChange={() => updateExercise(routine.id, ex.id, { checked: !ex.checked })}
                  /></label>
                  <input
                    className="ex-info"
                    type="text"
                    value={ex.name}
                    onChange={e => updateExercise(routine.id, ex.id, { name: e.target.value })}
                  />
                  <input
                    type="number"
                    value={ex.weight}
                    onChange={e => updateExercise(routine.id, ex.id, { weight: e.target.value })}
                  />kg x
                  <input
                    type="number"
                    value={ex.sets}
                    onChange={e => updateExercise(routine.id, ex.id, { sets: e.target.value })}
                  /> x
                  <input
                    type="number"
                    value={ex.reps}
                    onChange={e => updateExercise(routine.id, ex.id, { reps: e.target.value })}
                  />
                  <div className="ex-controls">
                    <button onClick={() => deleteExercise(routine.id, ex.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
            <AddExerciseForm onAdd={ex => addExercise(routine.id, ex)} />
          </div>
        ))}
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
    onAdd({ id: Date.now(), name, weight, sets, reps, checked: false });
    setName(''); setWeight(''); setSets(''); setReps('');
  };

  return (
    <div className="add-ex">
      <input type="text" placeholder="Exercise name" value={name} onChange={e => setName(e.target.value)} />
      <input type="number" placeholder="Weight (kg)" value={weight} onChange={e => setWeight(e.target.value)} />
      <input type="number" placeholder="Sets" value={sets} onChange={e => setSets(e.target.value)} />
      <input type="number" placeholder="Reps" value={reps} onChange={e => setReps(e.target.value)} />
      <button onClick={handleAdd}>Add Exercise</button>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
