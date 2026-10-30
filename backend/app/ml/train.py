import os
import pickle
import random
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, mean_absolute_error
from app.core.config import settings

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "storage", "synthetic")
os.makedirs(OUTPUT_DIR, exist_ok=True)
MODEL_FILE = os.path.join(OUTPUT_DIR, "delay_model.pkl")


def generate_synthetic_historical_data(n_samples: int = 3000, seed: int = 42):
    random.seed(seed)
    np.random.seed(seed)

    # Features:
    # 0: stage_id (0: SUBMITTED, 1: SCRUTINY, 2: DEFICIENCY, 3: RESCRUTINY, 4: EVC, 5: EC)
    # 1: deficiencies_count (0-6)
    # 2: days_in_current_stage (1-40)
    # 3: officer_workload (5-30)
    # 4: app_type_code (0: New Prog, 1: EoA)
    # 5: region_code (0: North, 1: South, 2: West, 3: East, 4: SW)

    X = []
    y_delay = []
    y_remaining_days = []

    for _ in range(n_samples):
        stage = random.randint(0, 5)
        def_count = np.random.poisson(lam=1.2)
        days_in_stage = int(np.random.exponential(scale=10.0)) + 1
        workload = random.randint(5, 28)
        app_type = random.choice([0, 1])
        region = random.randint(0, 4)

        # Ground truth latency logic
        stage_base = [50, 40, 32, 20, 14, 6][stage]
        remaining = max(1.0, stage_base + def_count * 7.5 - days_in_stage * 0.5 + (workload - 15) * 0.4)

        # Delay probability (> 60 days total threshold)
        delay_prob = 1.0 / (1.0 + np.exp(-(0.05 * remaining + 0.4 * def_count + 0.08 * days_in_stage - 3.0)))
        is_delayed = 1 if random.random() < delay_prob else 0

        X.append([stage, def_count, days_in_stage, workload, app_type, region])
        y_delay.append(is_delayed)
        y_remaining_days.append(remaining)

    return np.array(X), np.array(y_delay), np.array(y_remaining_days)


def train_models():
    print("=" * 60)
    print("FLOWSTATE ML TRAINING PIPELINE (Synthetic AICTE Dataset)")
    print("=" * 60)

    X, y_delay, y_days = generate_synthetic_historical_data(n_samples=3000, seed=settings.SEED_RANDOM)
    print(f"Generated {len(X)} synthetic historical applications for calibration.")

    X_train, X_test, y_delay_train, y_delay_test, y_days_train, y_days_test = train_test_split(
        X, y_delay, y_days, test_size=0.2, random_state=settings.SEED_RANDOM
    )

    print("Training Gradient Boosting Classifier for Delay Risk...")
    clf = GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=3, random_state=settings.SEED_RANDOM)
    clf.fit(X_train, y_delay_train)

    delay_probs = clf.predict_proba(X_test)[:, 1]
    auc = roc_auc_score(y_delay_test, delay_probs)
    print(f"Delay Risk Model Test ROC-AUC: {auc:.4f}")

    print("Training Gradient Boosting Regressor for Remaining Days...")
    reg = GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, max_depth=3, random_state=settings.SEED_RANDOM)
    reg.fit(X_train, y_days_train)

    pred_days = reg.predict(X_test)
    mae = mean_absolute_error(y_days_test, pred_days)
    print(f"Remaining Days Model Test MAE: {mae:.2f} days")

    artifact = {
        "classifier": clf,
        "regressor": reg,
        "features": ["stage", "deficiencies_count", "days_in_stage", "workload", "app_type", "region"],
        "metrics": {"roc_auc": round(auc, 4), "mae_days": round(mae, 2)},
        "dataset_synthetic_label": "SYNTHETIC_DATA_LABELED",
    }

    with open(MODEL_FILE, "wb") as f:
        pickle.dump(artifact, f)

    print(f"Model saved to {MODEL_FILE}")
    print("Disclaimer: Trained strictly on synthetic data for prototype orchestration.")
    return artifact


if __name__ == "__main__":
    train_models()
