import React, { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';

function NNPredictor({ onPoseClassified }) {
    const [model, setModel] = useState(null);
    const [status, setStatus] = useState('Model laden...');

    // Laad het model bij component mount
    useEffect(() => {
        loadModel();
    }, []);

    const loadModel = async () => {
        try {
            const loadedModel = await tf.loadLayersModel('localstorage://vrije-trap-nn-model');
            setModel(loadedModel);
            setStatus('Model geladen');
        } catch (error) {
            console.error('Error bij laden model:', error);
            setStatus('Error bij laden model');
        }
    };

    const classifyPose = async (landmarks) => {
        if (!model) return;

        try {
            // Bereid de input data voor
            const features = landmarks.flat();
            const inputTensor = tf.tensor2d([features]);

            // Doe de voorspelling
            const prediction = await model.predict(inputTensor).array();
            const classIndex = prediction[0].indexOf(Math.max(...prediction[0]));

            // Converteer index naar label
            const phases = ['stance', 'plant_foot', 'kick_leg'];
            const qualities = ['good', 'bad'];
            const phase = phases[Math.floor(classIndex / 2)];
            const quality = qualities[classIndex % 2];
            const label = `${phase}_${quality}`;

            // Stuur het resultaat terug
            onPoseClassified(label);

            // Cleanup
            inputTensor.dispose();
        } catch (error) {
            console.error('Classificatie error:', error);
        }
    };

    return null; // Deze component heeft geen UI
}

export default NNPredictor; 