import { useRef, useState, useEffect } from 'react';
import kNear from './knear.js';
import posedata from './posedata.json';

const k = 3;
// Initialize with the pose data from the JSON file
const initialTraining = posedata.map(pose => ({
    v: pose.points,
    lab: pose.label
}));
const machine = new kNear(k, initialTraining);

function PoseRecognition({ poseData }) {
    const [currentPose, setCurrentPose] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [isTraining, setIsTraining] = useState(false);
    const [poseLabel, setPoseLabel] = useState('');

    const handleCapturePose = () => {
        if (poseData && poseData.length > 0) {
            // Convert pose data to flat array of coordinates
            const flatPose = poseData[0].flatMap(point => [point.x, point.y, point.z]);
            setCurrentPose(flatPose);
            console.log('Captured pose:', flatPose);
        }
    };

    const handleTrainPose = () => {
        if (currentPose && poseLabel) {
            machine.learn(currentPose, poseLabel);
            console.log(`Trained pose as: ${poseLabel}`);
            setPoseLabel('');
        }
    };

    const handleClassifyPose = () => {
        if (currentPose) {
            const result = machine.classify(currentPose);
            setPrediction(result);
            console.log(`Predicted pose: ${result}`);
        }
    };

    return (
        <div className="pose-recognition">
            <button onClick={handleCapturePose}>Capture Current Pose</button>
            
            {currentPose && (
                <div>
                    <input
                        type="text"
                        value={poseLabel}
                        onChange={(e) => setPoseLabel(e.target.value)}
                        placeholder="Enter pose label (rock/paper/scissors)"
                    />
                    <button onClick={handleTrainPose}>Train Pose</button>
                    <button onClick={handleClassifyPose}>Classify Pose</button>
                </div>
            )}
            
            {prediction && (
                <div>
                    <h3>Prediction: {prediction}</h3>
                </div>
            )}
        </div>
    );
}

export default PoseRecognition; 