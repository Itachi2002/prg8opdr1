export default class kNear {
    constructor(k = 3) {
        this.k = k;
        this.training = [];
        this.maxDist = 0;
    }

    //compute the euclidean distance between two vectors
    //function assumes vectors are arrays of equal length
    dist(v1, v2) {
        let sum = 0
        v1.forEach( (val, index) => {
            sum += Math.pow(val - v2[index], 2)
        })
        return Math.sqrt(sum)
    };

    updateMax(val, arr) {
        let max = 0
        for(let obj of arr) {
            max = Math.max(max, obj.d)
        }
        return max
    }

    mode(store) {
        let frequency = {} // array of frequency.
        let max = 0 // holds the max frequency.
        let result // holds the max frequency element.
        for (let v in store) {
            frequency[store[v]] = (frequency[store[v]] || 0) + 1; // increment frequency.
            if (frequency[store[v]] > max) { // is this frequency > max so far ?
                max = frequency[store[v]] // update max.
                result = store[v] // update result.
            }
        }
        return result
    }

    checkInput(point) {
        if (!Array.isArray(point)) {
            throw new Error("Punt moet een array zijn");
        }
        if (this.training.length > 0 && point.length !== this.training[0].point.length) {
            throw new Error(`Punt moet ${this.training[0].point.length} dimensies hebben`);
        }
        if (point.some(isNaN)) {
            throw new Error("Punt mag geen NaN waarden bevatten");
        }
    }

    distance(p1, p2) {
        let sum = 0;
        for (let i = 0; i < p1.length; i++) {
            sum += (p1[i] - p2[i]) ** 2;
        }
        return Math.sqrt(sum);
    }

    updateMaxDist() {
        this.maxDist = 0;
        for (let i = 0; i < this.training.length; i++) {
            for (let j = 0; j < this.training.length; j++) {
                if (i !== j) {
                    const dist = this.distance(this.training[i].point, this.training[j].point);
                    if (dist > this.maxDist) {
                        this.maxDist = dist;
                    }
                }
            }
        }
    }

    //add a point to the training set
    learn(point, label) {
        this.checkInput(point);
        this.training.push({ point, label });
        this.updateMaxDist();
    }

    // classify a new unknown point
    classify(point) {
        this.checkInput(point);
        if (this.training.length === 0) {
            throw new Error("Geen trainingdata beschikbaar");
        }

        const distances = this.training.map(item => ({
            label: item.label,
            distance: this.distance(point, item.point)
        }));

        distances.sort((a, b) => a.distance - b.distance);
        const kNearest = distances.slice(0, this.k);
        
        // Tel de stemmen voor elk label
        const votes = {};
        kNearest.forEach(item => {
            votes[item.label] = (votes[item.label] || 0) + 1;
        });

        // Vind het label met de meeste stemmen
        let maxVotes = 0;
        let winner = null;
        for (const label in votes) {
            if (votes[label] > maxVotes) {
                maxVotes = votes[label];
                winner = label;
            }
        }

        return winner;
    }

    // Nieuwe methode om model op te slaan
    saveModel() {
        const modelData = {
            k: this.k,
            training: this.training,
            maxDist: this.maxDist
        };
        return JSON.stringify(modelData);
    }

    // Nieuwe methode om model te laden
    loadModel(modelData) {
        try {
            const data = JSON.parse(modelData);
            this.k = data.k;
            this.training = data.training;
            this.maxDist = data.maxDist;
            console.log('Model succesvol geladen met', this.training.length, 'trainingsvoorbeelden');
        } catch (error) {
            throw new Error('Ongeldig model formaat');
        }
    }
} 