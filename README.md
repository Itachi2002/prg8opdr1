# Virtuele Vrije Trap Trainer

Een React-applicatie die MediaPipe en KNN gebruikt om voetballers te helpen bij het verbeteren van hun vrije trap techniek.

## Features

- Real-time pose detection met MediaPipe
- KNN-model voor houding classificatie
- Training modus voor goede en slechte houdingen
- Direct feedback op houding
- Analyse van trainingsdata met accuraatheid en confusion matrix

## Installatie

1. Clone de repository:
```bash
git clone https://github.com/Itachi2002/prg8opdr1.git
cd prg8opdr1
```

2. Installeer dependencies:
```bash
npm install
```

3. Start de development server:
```bash
npm run dev
```

## Gebruik

1. Start de applicatie en geef toegang tot je webcam
2. Gebruik de groene knoppen om goede houdingen te trainen
3. Gebruik de rode knoppen om slechte houdingen te trainen
4. Sla meerdere voorbeelden op met de blauwe "Opslaan" knop
5. Train eerst de starthoudingen, dan de standvoet en schietbeen
6. Ontvang direct feedback op je houding

## Technische Stack

- React 18
- Vite
- MediaPipe Pose Detection
- TensorFlow.js
- Tailwind CSS

## Licentie

MIT
