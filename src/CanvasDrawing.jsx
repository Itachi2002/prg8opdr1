import { useEffect, useRef } from 'react';
import { HandLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";

function CanvasDrawing({ poseData }) {
    const canvasRef = useRef(null);
    const drawingUtilsRef = useRef(null);
    const animationFrameRef = useRef(null);
    const poseDataRef = useRef(poseData);

    useEffect(() => {
        poseDataRef.current = poseData;
    }, [poseData]);

    useEffect(() => {
        const ctx = canvasRef.current.getContext('2d');
        drawingUtilsRef.current = new DrawingUtils(ctx);
        
        const animate = () => {
            if (drawingUtilsRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                ctx.clearRect(0, 0, 480, 270);
                
                const currentPoseData = poseDataRef.current;
                if (currentPoseData && currentPoseData.length > 0) {
                    for (const hand of currentPoseData) {
                        drawingUtilsRef.current.drawConnectors(hand, HandLandmarker.HAND_CONNECTIONS, { color: "#00FF00", lineWidth: 5 });
                        drawingUtilsRef.current.drawLandmarks(hand, { radius: 4, color: "#FF0000", lineWidth: 2 });
                    }
                }
            }
            animationFrameRef.current = requestAnimationFrame(animate);
        };
        
        animationFrameRef.current = requestAnimationFrame(animate);
        
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            width={480}
            height={270}
        />
    );
}

export default CanvasDrawing; 