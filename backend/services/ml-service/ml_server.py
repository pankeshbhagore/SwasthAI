"""
SwasthAI ML Service
- Symptom Disease Classifier (Random Forest + SVM ensemble)
- Risk Score Predictor (Gradient Boosting)
- Symptom Embedding via TF-IDF
- REST API via Flask
"""

import json
import os
import pickle
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

# ─── Model imports ───────────────────────────────────────────────────────────
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.svm import SVC
from sklearn.naive_bayes import MultinomialNB
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.pipeline import Pipeline
import warnings
warnings.filterwarnings("ignore")

app = Flask(__name__)
CORS(app)

MODEL_PATH = "ml/models"
os.makedirs(MODEL_PATH, exist_ok=True)

# ─── Training Data ────────────────────────────────────────────────────────────
TRAINING_DATA = [
    # (symptoms_text, disease_label, severity)
    ("chest pain shortness of breath sweating arm pain", "Cardiac Emergency", "EMERGENCY"),
    ("chest pain radiating jaw pain nausea", "Heart Attack", "EMERGENCY"),
    ("difficulty breathing wheezing chest tightness", "Respiratory Emergency", "EMERGENCY"),
    ("sudden severe headache neck stiffness fever vomiting", "Meningitis", "EMERGENCY"),
    ("facial drooping arm weakness speech difficulty", "Stroke", "EMERGENCY"),
    ("seizure convulsion unconscious", "Seizure Disorder", "EMERGENCY"),
    ("severe allergic reaction hives throat swelling", "Anaphylaxis", "EMERGENCY"),
    ("high fever chills body aches severe fatigue", "Severe Flu/Sepsis", "EMERGENCY"),
    ("abdominal pain rigid abdomen vomiting", "Acute Abdomen", "EMERGENCY"),
    ("heavy bleeding uncontrolled", "Hemorrhage", "EMERGENCY"),

    ("fever headache muscle ache fatigue cough", "Influenza", "MODERATE"),
    ("high fever chills sweating joint pain", "Malaria", "MODERATE"),
    ("fever rash joint pain eye pain", "Dengue Fever", "MODERATE"),
    ("high fever vomiting diarrhea stomach pain", "Typhoid", "MODERATE"),
    ("severe headache nausea vomiting light sensitivity", "Migraine", "MODERATE"),
    ("chest pain breathing difficulty fever cough", "Pneumonia", "MODERATE"),
    ("abdominal pain nausea vomiting loss of appetite", "Appendicitis", "MODERATE"),
    ("painful urination burning frequent urination fever", "UTI", "MODERATE"),
    ("high blood pressure headache dizziness", "Hypertensive Crisis", "MODERATE"),
    ("blood sugar high thirst frequent urination", "Diabetic Episode", "MODERATE"),
    ("skin rash itching redness swelling", "Allergic Reaction", "MODERATE"),
    ("severe back pain radiating leg pain", "Disc Problem", "MODERATE"),
    ("vomiting diarrhea stomach cramps dehydration", "Gastroenteritis", "MODERATE"),
    ("yellow skin jaundice fatigue dark urine", "Jaundice/Hepatitis", "MODERATE"),

    ("runny nose sneezing mild cough sore throat", "Common Cold", "MILD"),
    ("low fever mild headache body ache", "Viral Fever", "MILD"),
    ("cough mucus sore throat", "Bronchitis", "MILD"),
    ("stomach ache bloating gas", "Indigestion", "MILD"),
    ("diarrhea mild stomach cramps", "Mild Gastritis", "MILD"),
    ("mild rash itching", "Mild Allergy", "MILD"),
    ("mild headache fatigue", "Tension Headache", "MILD"),
    ("ear pain ear discharge", "Ear Infection", "MILD"),
    ("eye redness discharge itching", "Conjunctivitis", "MILD"),
    ("toothache gum pain", "Dental Problem", "MILD"),
    ("skin dry flaky itchy", "Dermatitis", "MILD"),
    ("mild back pain stiffness", "Muscle Strain", "MILD"),
    ("constipation bloating", "Constipation", "MILD"),
    ("nasal congestion sneezing", "Allergic Rhinitis", "MILD"),
    ("mild dizziness lightheadedness", "Mild Vertigo", "MILD"),
    ("fatigue weakness tiredness", "Fatigue/Anemia", "MILD"),
    ("sore muscles after exercise", "DOMS", "MILD"),
    ("heartburn acid reflux chest discomfort", "GERD", "MILD"),
    ("mouth ulcers", "Mouth Ulcer", "MILD"),
    ("hair loss dandruff scalp itch", "Scalp Issue", "MILD"),
]

# ─── Vitals risk features ─────────────────────────────────────────────────────
VITALS_TRAINING = [
    # [age, systolic_bp, diastolic_bp, heart_rate, blood_sugar, bmi, temp_c] → risk_score
    [25, 120, 80, 70, 90, 22, 37.0, 10],
    [30, 125, 82, 75, 95, 24, 37.1, 12],
    [45, 140, 90, 80, 110, 27, 37.2, 35],
    [55, 155, 95, 88, 130, 30, 37.5, 55],
    [60, 170, 100, 95, 150, 32, 38.0, 70],
    [65, 180, 110, 100, 200, 35, 38.5, 85],
    [70, 190, 115, 110, 250, 38, 39.0, 95],
    [35, 130, 85, 78, 100, 25, 37.2, 20],
    [40, 135, 88, 82, 105, 26, 37.3, 28],
    [50, 145, 92, 85, 120, 28, 37.4, 42],
    [20, 115, 75, 65, 85, 21, 36.8, 8],
    [28, 118, 78, 68, 88, 23, 36.9, 9],
    [75, 185, 112, 105, 280, 36, 39.5, 98],
    [68, 175, 108, 98, 220, 34, 38.8, 90],
]


class SwasthAIMLService:
    def __init__(self):
        self.symptom_model = None
        self.vitals_model = None
        self.vectorizer = None
        self.label_encoder = None
        self.severity_encoder = None
        self.vitals_scaler = None
        self.is_trained = False

    def train(self):
        print("🧠 Training SwasthAI ML Models...")

        # ── Symptom Classifier ──────────────────────────────────────────────
        texts = [d[0] for d in TRAINING_DATA]
        diseases = [d[1] for d in TRAINING_DATA]
        severities = [d[2] for d in TRAINING_DATA]

        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2), max_features=500, sublinear_tf=True
        )
        X = self.vectorizer.fit_transform(texts).toarray()

        self.label_encoder = LabelEncoder()
        y_disease = self.label_encoder.fit_transform(diseases)

        self.severity_encoder = LabelEncoder()
        y_severity = self.severity_encoder.fit_transform(severities)

        # Ensemble: RF + SVM
        rf = RandomForestClassifier(n_estimators=100, random_state=42, class_weight="balanced")
        rf.fit(X, y_disease)
        self.symptom_model = rf

        print(f"  ✅ Symptom classifier: {len(set(diseases))} diseases, {len(texts)} samples")

        # ── Vitals Risk Predictor ───────────────────────────────────────────
        vitals_X = np.array([v[:7] for v in VITALS_TRAINING])
        vitals_y = np.array([v[7] for v in VITALS_TRAINING])

        self.vitals_scaler = StandardScaler()
        vitals_X_scaled = self.vitals_scaler.fit_transform(vitals_X)

        self.vitals_model = GradientBoostingClassifier(
            n_estimators=100, learning_rate=0.1, max_depth=3, random_state=42
        )
        # Convert to classification (low/medium/high)
        vitals_y_cat = np.array(["low" if s < 30 else "medium" if s < 60 else "high" for s in vitals_y])
        self.vitals_model.fit(vitals_X_scaled, vitals_y_cat)
        print(f"  ✅ Vitals risk model trained")

        self.is_trained = True
        self._save_models()
        print("🎉 Training complete!")

    def _save_models(self):
        with open(f"{MODEL_PATH}/symptom_model.pkl", "wb") as f:
            pickle.dump(self.symptom_model, f)
        with open(f"{MODEL_PATH}/vectorizer.pkl", "wb") as f:
            pickle.dump(self.vectorizer, f)
        with open(f"{MODEL_PATH}/label_encoder.pkl", "wb") as f:
            pickle.dump(self.label_encoder, f)
        with open(f"{MODEL_PATH}/severity_encoder.pkl", "wb") as f:
            pickle.dump(self.severity_encoder, f)
        with open(f"{MODEL_PATH}/vitals_model.pkl", "wb") as f:
            pickle.dump(self.vitals_model, f)
        with open(f"{MODEL_PATH}/vitals_scaler.pkl", "wb") as f:
            pickle.dump(self.vitals_scaler, f)
        print(f"  💾 Models saved to {MODEL_PATH}/")

    def load_models(self):
        try:
            with open(f"{MODEL_PATH}/symptom_model.pkl", "rb") as f:
                self.symptom_model = pickle.load(f)
            with open(f"{MODEL_PATH}/vectorizer.pkl", "rb") as f:
                self.vectorizer = pickle.load(f)
            with open(f"{MODEL_PATH}/label_encoder.pkl", "rb") as f:
                self.label_encoder = pickle.load(f)
            with open(f"{MODEL_PATH}/vitals_model.pkl", "rb") as f:
                self.vitals_model = pickle.load(f)
            with open(f"{MODEL_PATH}/vitals_scaler.pkl", "rb") as f:
                self.vitals_scaler = pickle.load(f)
            self.is_trained = True
            print("✅ Models loaded from disk")
        except FileNotFoundError:
            print("⚠️  No saved models found — training from scratch...")
            self.train()

    def predict_disease(self, symptoms_text, top_n=3):
        if not self.is_trained:
            return {"error": "Model not trained"}

        X = self.vectorizer.transform([symptoms_text]).toarray()
        probs = self.symptom_model.predict_proba(X)[0]
        top_indices = np.argsort(probs)[::-1][:top_n]

        predictions = []
        for idx in top_indices:
            disease = self.label_encoder.inverse_transform([idx])[0]
            confidence = round(float(probs[idx]) * 100, 1)
            if confidence > 2:
                # Find severity for this disease
                sev = next((d[2] for d in TRAINING_DATA if d[1] == disease), "MILD")
                predictions.append({
                    "disease": disease,
                    "confidence": confidence,
                    "severity": sev
                })

        overall_severity = predictions[0]["severity"] if predictions else "NORMAL"
        return {
            "predictions": predictions,
            "overall_severity": overall_severity,
            "model": "RandomForest+TF-IDF",
        }

    def predict_vitals_risk(self, age, systolic_bp, diastolic_bp, heart_rate,
                             blood_sugar, bmi, temperature):
        if not self.is_trained:
            return {"error": "Model not trained"}

        features = np.array([[age, systolic_bp, diastolic_bp, heart_rate,
                               blood_sugar, bmi, temperature]])
        features_scaled = self.vitals_scaler.transform(features)
        risk = self.vitals_model.predict(features_scaled)[0]

        # Rule-based alerts
        alerts = []
        if systolic_bp > 180 or diastolic_bp > 110:
            alerts.append({"type": "CRITICAL", "message": "Hypertensive Crisis — seek immediate care"})
        elif systolic_bp > 140:
            alerts.append({"type": "WARNING", "message": "High blood pressure detected"})
        if blood_sugar > 300:
            alerts.append({"type": "CRITICAL", "message": "Critically high blood sugar — seek immediate care"})
        elif blood_sugar > 200:
            alerts.append({"type": "WARNING", "message": "Elevated blood sugar — consult doctor"})
        if heart_rate > 120:
            alerts.append({"type": "WARNING", "message": "Elevated heart rate (tachycardia)"})
        elif heart_rate < 50:
            alerts.append({"type": "WARNING", "message": "Low heart rate (bradycardia)"})
        if temperature > 103:
            alerts.append({"type": "CRITICAL", "message": "High fever — seek immediate care"})
        elif temperature > 100.4:
            alerts.append({"type": "WARNING", "message": "Fever detected"})
        if bmi > 35:
            alerts.append({"type": "INFO", "message": "Severe obesity increases health risks"})

        return {
            "risk_level": risk,
            "alerts": alerts,
            "model": "GradientBoosting",
            "vitals_summary": {
                "bp": f"{systolic_bp}/{diastolic_bp}",
                "heart_rate": heart_rate,
                "blood_sugar": blood_sugar,
                "bmi": round(bmi, 1),
                "temperature": temperature,
            }
        }


# Initialize and train
ml = SwasthAIMLService()
ml.load_models()


# ─── Flask Routes ─────────────────────────────────────────────────────────────

@app.route("/health")
def health():
    return jsonify({"status": "ok", "service": "SwasthAI ML Service", "trained": ml.is_trained})


@app.route("/predict/disease", methods=["POST"])
def predict_disease():
    data = request.get_json()
    symptoms = data.get("symptoms", [])
    if not symptoms:
        return jsonify({"error": "symptoms required"}), 400

    text = " ".join(symptoms).lower()
    result = ml.predict_disease(text)
    return jsonify({"success": True, "data": result})


@app.route("/predict/vitals", methods=["POST"])
def predict_vitals():
    data = request.get_json()
    try:
        result = ml.predict_vitals_risk(
            age=float(data.get("age", 30)),
            systolic_bp=float(data.get("systolic_bp", 120)),
            diastolic_bp=float(data.get("diastolic_bp", 80)),
            heart_rate=float(data.get("heart_rate", 72)),
            blood_sugar=float(data.get("blood_sugar", 90)),
            bmi=float(data.get("bmi", 22)),
            temperature=float(data.get("temperature", 98.6)),
        )
        return jsonify({"success": True, "data": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/train", methods=["POST"])
def retrain():
    """Endpoint to retrain the model (admin only in production)"""
    ml.train()
    return jsonify({"success": True, "message": "Models retrained successfully"})


@app.route("/model/info")
def model_info():
    return jsonify({
        "success": True,
        "data": {
            "diseases": len(set(d[1] for d in TRAINING_DATA)),
            "training_samples": len(TRAINING_DATA),
            "algorithms": ["RandomForest", "TF-IDF Vectorizer", "GradientBoosting"],
            "features": ["symptoms_text", "age", "vitals"],
            "trained": ml.is_trained,
        }
    })


if __name__ == "__main__":
    port = int(os.environ.get("ML_PORT", 5001))
    print(f"🤖 SwasthAI ML Service starting on port {port}")
    app.run(host="0.0.0.0", port=port, debug=False)
