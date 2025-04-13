import React, { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import poseData from '../posedata.json';

function TrainNN() {
    const [model, setModel] = useState(null);
    const [status, setStatus] = useState('Niet gestart');
    const [accuracy, setAccuracy] = useState(0);

    // Voorbereid de data
    const prepareData = () => {
        const features = [];
        const labels = [];
        
        // Verwerk de pose data
        poseData.forEach(entry => {
            // Features zijn al plat in de JSON
            features.push(entry.features);
            
            // One-hot encoding voor labels
            const label = entry.label.split('_');
            const phase = label[0]; // stance, plant_foot, kick_leg
            const quality = label[1]; // good, bad
            
            // Maak numerieke labels (bijv. 0 = stance_good, 1 = stance_bad, etc.)
            let labelIndex = 0;
            if (phase === 'plant_foot') labelIndex += 2;
            if (phase === 'kick_leg') labelIndex += 4;
            if (quality === 'bad') labelIndex += 1;
            
            labels.push(labelIndex);
        });

        return {
            features: tf.tensor2d(features),
            labels: tf.oneHot(labels, 6) // 6 mogelijke categorieën
        };
    };

    // Maak het neural network model
    const createModel = () => {
        const model = tf.sequential();
        
        // Input layer (66 features voor 33 landmarks met x,y coördinaten)
        model.add(tf.layers.dense({
            inputShape: [66],
            units: 128,
            activation: 'relu'
        }));
        
        // Hidden layer
        model.add(tf.layers.dense({
            units: 64,
            activation: 'relu'
        }));
        
        // Dropout voor regularisatie
        model.add(tf.layers.dropout({
            rate: 0.2
        }));
        
        // Output layer (6 categorieën)
        model.add(tf.layers.dense({
            units: 6,
            activation: 'softmax'
        }));
        
        return model;
    };

    // Train het model
    const trainModel = async () => {
        try {
            setStatus('Data voorbereiden...');
            const { features, labels } = prepareData();
            
            setStatus('Model maken...');
            const newModel = createModel();
            
            newModel.compile({
                optimizer: 'adam',
                loss: 'categoricalCrossentropy',
                metrics: ['accuracy']
            });
            
            setStatus('Training gestart...');
            const history = await newModel.fit(features, labels, {
                epochs: 50,
                validationSplit: 0.2,
                callbacks: {
                    onEpochEnd: (epoch, logs) => {
                        setAccuracy(Math.round(logs.acc * 100));
                        setStatus(`Training... Epoch ${epoch + 1}/50`);
                    }
                }
            });
            
            setModel(newModel);
            setStatus('Training voltooid!');
            
            // Sla het model op
            await newModel.save('localstorage://vrije-trap-nn-model');
            setStatus('Model opgeslagen!');
            
        } catch (error) {
            console.error('Training error:', error);
            setStatus('Error tijdens training');
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Neural Network Training</h2>
            
            <div className="mb-4">
                <p>Status: {status}</p>
                {accuracy > 0 && <p>Accuraatheid: {accuracy}%</p>}
            </div>
            
            <button
                onClick={trainModel}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                disabled={status.includes('Training')}
            >
                Start Training
            </button>
        </div>
    );
}

export default TrainNN; 