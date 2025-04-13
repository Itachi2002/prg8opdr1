import './App.css'
import Posedetector from './Posedetector'
import { useState, useRef, useCallback, useEffect } from "react";
import kNear from './knear.js';

// Constants for the KNN classifier
const K = 5;
const MOVEMENT_THRESHOLD = 0.05;
const DEBOUNCE_TIME = 500; // ms
const POSE_CAPTURE_DELAY = 5; // seconds

const TRAINING_PHASES = {
  STANCE: {
    id: 'stance',
    title: 'Starthouding',
    description: 'De basis van een perfecte vrije trap',
    goodTips: [
      'Rechte rug',
      'Schouders ontspannen',
      'Voeten op schouderbreedte',
      'Lichte buiging in de knieën'
    ],
    badSigns: [
      'Gebogen rug',
      'Gespannen schouders',
      'Voeten te dicht bij elkaar',
      'Stijve knieën'
    ]
  },
  PLANT_FOOT: {
    id: 'plant_foot',
    title: 'Standvoet',
    description: 'De anker voor je schot',
    goodTips: [
      'Voet naast de bal',
      'Tenen wijzen naar doel',
      'Stabiele plaatsing',
      'Lichte buiging in de knie'
    ],
    badSigns: [
      'Voet te ver van de bal',
      'Tenen wijzen verkeerd',
      'Onstabiele stand',
      'Been te gestrekt'
    ]
  },
  KICK_LEG: {
    id: 'kick_leg',
    title: 'Schietbeen',
    description: 'De kracht en precisie van je schot',
    goodTips: [
      'Goede uitzwaai',
      'Enkel vast',
      'Knie over de bal',
      'Volg door na contact'
    ],
    badSigns: [
      'Korte uitzwaai',
      'Losse enkel',
      'Knie niet boven bal',
      'Geen follow-through'
    ]
  }
};

function App() {
  const [feedback, setFeedback] = useState('Welkom bij je persoonlijke vrije trap trainer! 🎯');
  const [currentPhase, setCurrentPhase] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const [knnClassifier] = useState(new kNear(K));
  const [capturedPoses, setCapturedPoses] = useState([]);
  const [lastPose, setLastPose] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [trainingStats, setTrainingStats] = useState({
    stance: { good: 0, bad: 0 },
    plant_foot: { good: 0, bad: 0 },
    kick_leg: { good: 0, bad: 0 }
  });
  
  const lastPredictionRef = useRef(null);
  const lastPredictionTimeRef = useRef(0);
  const countdownTimerRef = useRef(null);

  // Handle countdown timer
  useEffect(() => {
    if (countdown !== null) {
      if (countdown > 0) {
        countdownTimerRef.current = setTimeout(() => {
          setCountdown(countdown - 1);
          setFeedback(`⏳ Neem je houding aan... ${countdown} seconden`);
        }, 1000);
      } else {
        handleStopTraining();
        setCountdown(null);
      }
    }
    return () => {
      if (countdownTimerRef.current) {
        clearTimeout(countdownTimerRef.current);
      }
    };
  }, [countdown]);

  // Check if the pose has changed significantly
  const hasPoseChanged = useCallback((newPose, oldPose) => {
    if (!oldPose) return true;
    
    const totalDiff = newPose.reduce((sum, coord, i) => {
      return sum + Math.abs(coord - oldPose[i]);
    }, 0);
    
    const avgDiff = totalDiff / newPose.length;
    return avgDiff > MOVEMENT_THRESHOLD;
  }, []);

  const handlePoseDetected = useCallback((landmarks) => {
    if (!landmarks) return;

    const features = landmarks.flatMap(point => [point.x, point.y]);
    
    const now = Date.now();
    const timeSinceLastPrediction = now - lastPredictionTimeRef.current;
    const poseChanged = hasPoseChanged(features, lastPose);

    if (isTraining) {
      setLastPose(features);
    } else if (capturedPoses.length > 0 && poseChanged && timeSinceLastPrediction > DEBOUNCE_TIME) {
      try {
        const prediction = knnClassifier.classify(features);
        
        if (prediction !== lastPredictionRef.current) {
          updateFeedback(prediction);
          lastPredictionRef.current = prediction;
          lastPredictionTimeRef.current = now;
        }
      } catch (err) {
        console.error('Classificatie fout:', err);
        if (timeSinceLastPrediction > DEBOUNCE_TIME) {
          setFeedback('⚠️ Train eerst enkele voorbeelden van goede en slechte houdingen.');
          lastPredictionTimeRef.current = now;
        }
      }
    }
    
    setLastPose(features);
  }, [isTraining, currentPhase, capturedPoses.length, hasPoseChanged, knnClassifier]);

  const updateFeedback = (prediction) => {
    const [phase, quality] = prediction.split('_');
    const phaseData = Object.values(TRAINING_PHASES).find(p => p.id === phase);
    
    if (!phaseData) return;

    if (quality === 'good') {
      const randomTip = phaseData.goodTips[Math.floor(Math.random() * phaseData.goodTips.length)];
      setFeedback(`✅ Uitstekende ${phaseData.title.toLowerCase()}!\n${randomTip}`);
    } else {
      const randomSign = phaseData.badSigns[Math.floor(Math.random() * phaseData.badSigns.length)];
      setFeedback(`❌ Verbeter je ${phaseData.title.toLowerCase()}:\n${randomSign}`);
    }
  };

  const handleStartTraining = (phase, isGood) => {
    setIsTraining(isGood ? 'good' : 'bad');
    setCurrentPhase(phase);
    setSelectedPhase(phase);
    setCountdown(POSE_CAPTURE_DELAY);
    setFeedback(`⏳ Neem een ${isGood ? 'GOEDE' : 'SLECHTE'} ${TRAINING_PHASES[phase.toUpperCase()].title.toLowerCase()} positie aan... ${POSE_CAPTURE_DELAY} seconden`);
    lastPredictionRef.current = null;
    lastPredictionTimeRef.current = 0;
  };

  const handleStopTraining = () => {
    if (lastPose && isTraining && currentPhase) {
      knnClassifier.learn(lastPose, `${currentPhase}_${isTraining}`);
      setCapturedPoses(prev => [...prev, { 
        features: lastPose, 
        label: `${currentPhase}_${isTraining}` 
      }]);
      
      // Update training stats
      setTrainingStats(prev => ({
        ...prev,
        [currentPhase]: {
          ...prev[currentPhase],
          [isTraining]: prev[currentPhase][isTraining] + 1
        }
      }));

      setFeedback('✅ Houding succesvol opgeslagen! Kies een nieuwe houding om te trainen of begin met oefenen.');
    }
    setIsTraining(false);
    lastPredictionRef.current = null;
    lastPredictionTimeRef.current = 0;
  };

  const getProgressPercentage = (phase) => {
    const stats = trainingStats[phase];
    const total = stats.good + stats.bad;
    return total > 0 ? Math.min((total / 6) * 100, 100) : 0;
  };

  // Nieuwe functie om model op te slaan
  const handleSaveModel = () => {
    try {
      const modelData = knnClassifier.saveModel();
      localStorage.setItem('vrije_trap_model', modelData);
      setFeedback('✅ Model succesvol opgeslagen!');
    } catch (error) {
      console.error('Error bij opslaan model:', error);
      setFeedback('❌ Fout bij opslaan model');
    }
  };

  // Nieuwe functie om model te laden
  const handleLoadModel = () => {
    try {
      const savedModel = localStorage.getItem('vrije_trap_model');
      if (savedModel) {
        knnClassifier.loadModel(savedModel);
        setFeedback(`✅ Model geladen met ${knnClassifier.training.length} voorbeelden`);
      } else {
        setFeedback('ℹ️ Geen opgeslagen model gevonden');
      }
    } catch (error) {
      console.error('Error bij laden model:', error);
      setFeedback('❌ Fout bij laden model');
    }
  };

  // Laad het model bij het opstarten
  useEffect(() => {
    handleLoadModel();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
      <div className="max-w-[1600px] mx-auto px-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            ⚽ Virtuele Vrije Trap Trainer
          </h1>
          <p className="text-lg text-gray-600">
            Train je techniek met real-time feedback en professionele analyse
          </p>
        </header>
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '5fr 3fr 3fr',
          gap: '2rem',
          alignItems: 'start'
        }}>
          {/* Main Video Feed - Left */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden" style={{ minHeight: '500px' }}>
            <Posedetector onPoseDetected={handlePoseDetected} />
          </div>

          {/* Live Feedback - Middle */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Live Feedback
            </h2>
            <div className="bg-gray-50 rounded-xl p-5 mb-6 min-h-[120px]">
              <p className="text-gray-700 whitespace-pre-line text-lg leading-relaxed">{feedback}</p>
            </div>
            
            {selectedPhase && (
              <div className="bg-blue-50 rounded-xl p-5">
                <h3 className="font-semibold text-gray-800 mb-3">Tips voor {TRAINING_PHASES[selectedPhase.toUpperCase()].title}</h3>
                <ul className="text-base text-gray-700 space-y-3">
                  {TRAINING_PHASES[selectedPhase.toUpperCase()].goodTips.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 text-blue-500">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Training Controls - Right */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Training Fases
            </h2>
            
            <div className="space-y-6">
              {Object.entries(TRAINING_PHASES).map(([key, phase]) => (
                <div key={key} className="bg-gray-50 rounded-xl p-5">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-800">{phase.title}</h3>
                    <span className="text-sm bg-blue-100 text-blue-800 py-1 px-3 rounded-full font-medium">
                      {trainingStats[phase.id].good + trainingStats[phase.id].bad}/6
                    </span>
                  </div>
                  
                  <div className="h-2 bg-gray-200 rounded-full mb-4">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage(phase.id)}%` }}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => handleStartTraining(phase.id, true)}
                      className="w-full bg-green-100 text-green-800 border-2 border-green-500 px-4 py-3 rounded-xl text-base font-bold hover:bg-green-200 transition-colors disabled:opacity-50 shadow-sm"
                      disabled={isTraining || countdown !== null}
                    >
                      ✅ Train Goede {phase.title}
                    </button>
                    <button
                      onClick={() => handleStartTraining(phase.id, false)}
                      className="w-full bg-red-100 text-red-800 border-2 border-red-500 px-4 py-3 rounded-xl text-base font-bold hover:bg-red-200 transition-colors disabled:opacity-50 shadow-sm"
                      disabled={isTraining || countdown !== null}
                    >
                      ❌ Train Foute {phase.title}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 space-x-2">
          <button
            onClick={handleSaveModel}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            💾 Model Opslaan
          </button>
          <button
            onClick={handleLoadModel}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            📂 Model Laden
          </button>
        </div>
      </div>
    </div>
  );
}

export default App
