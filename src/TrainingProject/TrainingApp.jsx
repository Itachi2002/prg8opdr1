import React, { useState, useEffect } from 'react';
import kNear from '../knear.js';

const TrainingApp = () => {
  const [trainingData, setTrainingData] = useState([]);
  const [testData, setTestData] = useState([]);
  const [accuracyScore, setAccuracyScore] = useState(0);
  const [confusionMatrix, setConfusionMatrix] = useState({});
  const [knnModel] = useState(new kNear(5));

  // Load training data
  useEffect(() => {
    fetch('/src/posedata.json')
      .then(res => res.json())
      .then(data => {
        // Split data 80/20 for training/testing
        const splitIndex = Math.floor(data.length * 0.8);
        setTrainingData(data.slice(0, splitIndex));
        setTestData(data.slice(splitIndex));
      });
  }, []);

  const calculateAccuracy = () => {
    if (testData.length === 0) return;

    let correct = 0;
    const matrix = {
      'stance_good': { 'stance_good': 0, 'stance_bad': 0 },
      'stance_bad': { 'stance_good': 0, 'stance_bad': 0 },
      'plant_foot_good': { 'plant_foot_good': 0, 'plant_foot_bad': 0 },
      'plant_foot_bad': { 'plant_foot_good': 0, 'plant_foot_bad': 0 },
      'kick_leg_good': { 'kick_leg_good': 0, 'kick_leg_bad': 0 },
      'kick_leg_bad': { 'kick_leg_good': 0, 'kick_leg_bad': 0 }
    };

    // Train model with training data
    trainingData.forEach(sample => {
      knnModel.learn(sample.features, sample.label);
    });

    // Test and build confusion matrix
    testData.forEach(sample => {
      const prediction = knnModel.classify(sample.features);
      if (prediction === sample.label) correct++;
      
      // Update confusion matrix
      if (matrix[sample.label]) {
        matrix[sample.label][prediction] = (matrix[sample.label][prediction] || 0) + 1;
      }
    });

    const accuracy = (correct / testData.length) * 100;
    setAccuracyScore(accuracy);
    setConfusionMatrix(matrix);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Training Dashboard</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Dataset Statistics</h2>
        <p>Training samples: {trainingData.length}</p>
        <p>Test samples: {testData.length}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Model Performance</h2>
        <button 
          onClick={calculateAccuracy}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Calculate Accuracy
        </button>
        <p className="mt-2">Accuracy: {accuracyScore.toFixed(2)}%</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Confusion Matrix</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-50">
            <tbody>
              {Object.entries(confusionMatrix).map(([actual, predictions]) => (
                Object.entries(predictions).map(([predicted, count]) => (
                  <tr key={`${actual}-${predicted}`}>
                    <td className="p-2 border">Actual: {actual}</td>
                    <td className="p-2 border">Predicted: {predicted}</td>
                    <td className="p-2 border">{count}</td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrainingApp; 