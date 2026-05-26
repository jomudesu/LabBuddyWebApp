import React, { useState, useEffect } from 'react';
import { X, Droplet, FlaskConical, Gauge } from 'lucide-react';
import { useAuth } from '../../backend/Firebase/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../backend/Firebase/firebase';

const GenericSimulation = ({ config, experimentId, onClose, onComplete }) => {
  const { currentUser } = useAuth();
  const [addedVolume, setAddedVolume] = useState(0);
  const [state, setState] = useState({ pH: config.initialpH, indicatorColor: config.indicator.colorBelow, isComplete: false });
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Load saved notes from Firestore
  useEffect(() => {
    const loadNotes = async () => {
      if (!currentUser) return;
      const noteRef = doc(db, 'userNotes', `${currentUser.uid}_${experimentId}`);
      const noteSnap = await getDoc(noteRef);
      if (noteSnap.exists()) setNotes(noteSnap.data().content || '');
    };
    loadNotes();
  }, [currentUser, experimentId]);

  // Auto-save notes every 2 seconds
  useEffect(() => {
    if (!currentUser) return;
    const timeout = setTimeout(async () => {
      setSaving(true);
      const noteRef = doc(db, 'userNotes', `${currentUser.uid}_${experimentId}`);
      await setDoc(noteRef, { userId: currentUser.uid, experimentId, content: notes, updatedAt: new Date() }, { merge: true });
      setSaving(false);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [notes, currentUser, experimentId]);

  // Update simulation state whenever addedVolume changes
  useEffect(() => {
    const newState = config.computeState(addedVolume, config);
    setState(newState);
  }, [addedVolume, config]);

  const addBase = (mL) => {
    setAddedVolume(prev => Math.min(prev + mL, 100)); // cap at 100 mL
  };

  const reset = () => {
    setAddedVolume(0);
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">{config.title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Lab equipment area */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2 bg-gray-100 rounded-xl p-6 flex flex-col items-center">
              <FlaskConical size={80} className="text-gray-600" />
              <div className="mt-4 text-center">
                <p className="font-mono text-2xl">{addedVolume.toFixed(1)} mL NaOH added</p>
                <div className="w-48 h-4 bg-gray-300 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(addedVolume / 100) * 100}%` }}></div>
                </div>
              </div>
              <div className="mt-6 flex gap-4">
                <button onClick={() => addBase(1)} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">+1 mL</button>
                <button onClick={() => addBase(5)} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">+5 mL</button>
                <button onClick={reset} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">Reset</button>
              </div>
            </div>

            {/* Sensors & indicator */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 shadow flex items-center gap-3">
                <Gauge className="text-green-600" size={24} />
                <div>
                  <p className="text-sm text-gray-500">pH Meter</p>
                  <p className="text-2xl font-bold">{state.pH.toFixed(2)}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow flex items-center gap-3">
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: state.indicatorColor === 'pink' ? '#f9a8d4' : '#e5e7eb' }}></div>
                <div>
                  <p className="text-sm text-gray-500">Indicator</p>
                  <p className="font-medium">{state.indicatorColor === 'pink' ? 'Pink (basic)' : 'Colorless (acidic)'}</p>
                </div>
              </div>
              {state.isComplete && (
                <div className="bg-green-100 border-l-4 border-green-500 p-3 rounded">
                  <p className="text-green-700 font-semibold">✓ Endpoint reached! You can complete the experiment.</p>
                </div>
              )}
            </div>
          </div>

          {/* Steps */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Procedure</h3>
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              {config.steps.map((step, idx) => <li key={idx}>{step}</li>)}
            </ol>
          </div>

          {/* Notes */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold">Lab Notes</label>
              <span className="text-xs text-gray-400">{saving ? 'Saving...' : 'Auto-saved'}</span>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
              placeholder="Record your observations, volumes, and conclusions..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-100">Close</button>
          <button
            onClick={handleComplete}
            disabled={!state.isComplete}
            className={`px-6 py-2 rounded-lg flex items-center gap-2 ${state.isComplete ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            <Droplet size={18} /> Mark Experiment Complete
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenericSimulation;