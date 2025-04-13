import React, { useRef, useEffect } from 'react';
import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { POSE_CONNECTIONS } from '@mediapipe/pose';

function Posedetector({ onPoseDetected }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const pose = new Pose({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
            }
        });

        pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        pose.onResults((results) => {
            const canvasElement = canvasRef.current;
            const canvasCtx = canvasElement.getContext('2d');

            // Set canvas width and height to match video
            canvasElement.width = results.image.width;
            canvasElement.height = results.image.height;

            // Draw the image
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
            canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

            // Draw the pose landmarks
            if (results.poseLandmarks) {
                // Log pose data
                console.log('Pose Landmarks:', results.poseLandmarks);
                
                // Log specifieke punten voor debugging
                console.log('Rechter schouder:', results.poseLandmarks[12]);
                console.log('Linker schouder:', results.poseLandmarks[11]);
                console.log('Rechter heup:', results.poseLandmarks[24]);
                console.log('Linker heup:', results.poseLandmarks[23]);

                drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
                    color: '#00FF00',
                    lineWidth: 4
                });
                drawLandmarks(canvasCtx, results.poseLandmarks, {
                    color: '#FF0000',
                    lineWidth: 2,
                    radius: 6
                });

                if (onPoseDetected) {
                    onPoseDetected(results.poseLandmarks);
                }
            } else {
                console.log('Geen pose gedetecteerd');
            }
            canvasCtx.restore();
        });

        const camera = new Camera(videoRef.current, {
            onFrame: async () => {
                await pose.send({ image: videoRef.current });
            },
            width: 1280,
            height: 720
        });

        camera.start()
            .then(() => {
                console.log('Camera gestart - Je zou nu pose data in de console moeten zien verschijnen');
            })
            .catch((error) => {
                console.error('Error bij het starten van de camera:', error);
            });

        return () => {
            camera.stop();
        };
    }, [onPoseDetected]);

    return (
        <div className="aspect-video relative">
            <video
                ref={videoRef}
                style={{ 
                    position: 'absolute',
                    visibility: 'hidden',
                    pointerEvents: 'none'
                }}
                playsInline
            />
            <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{
                    transform: 'scaleX(-1)'
                }}
            />
        </div>
    );
}

export default Posedetector; 