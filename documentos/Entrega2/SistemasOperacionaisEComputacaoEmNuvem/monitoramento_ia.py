import time, datetime, warnings
import numpy as np
import pandas as pd
import psutil
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
warnings.filterwarnings("ignore")

from sklearn.linear_model import LinearRegression
from sklearn.cluster import KMeans
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score, silhouette_score

print("\n🔵 Coletando métricas do EC2 (60 amostras)...\n")
registros = []
for i in range(60):
    mem   = psutil.virtual_memory()
    disco = psutil.disk_usage("/")
    load  = psutil.getloadavg()
    registros.append({
        "sample_idx"  : i,
        "cpu_pct"     : psutil.cpu_percent(interval=1),
        "mem_pct"     : mem.percent,
        "mem_used_mb" : mem.used / 1024**2,
        "disco_pct"   : disco.percent,
        "load_1min"   : load[0],
    })
    if (i+1) % 10 == 0:
        print(f"  ✔ {i+1}/60 amostras coletadas")

df = pd.DataFrame(registros)
df.to_csv("dados_ec2.csv", index=False)
print("\n✅ Dados salvos em dados_ec2.csv")
print(df.describe().round(2))

print("\n" + "="*50)
print("ALGORITMO 1 — REGRESSÃO LINEAR")
print("="*50)

X = df[["sample_idx"]].values
y = df["cpu_pct"].values
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

rl = LinearRegression()
rl.fit(X_train, y_train)
y_pred_rl = rl.predict(X_test)
futuros    = np.arange(60, 80).reshape(-1, 1)
cpu_futuro = rl.predict(futuros)

print(f"  Coeficiente : {rl.coef_[0]:.4f}")
print(f"  Intercepto  : {rl.intercept_:.4f}")
print(f"  MSE         : {mean_squared_error(y_test, y_pred_rl):.4f}")
print(f"  R²          : {r2_score(y_test, y_pred_rl):.4f}")
print(f"  CPU pred +20s: {cpu_futuro[-1]:.2f}%")

print("\n" + "="*50)
print("ALGORITMO 2 — K-MEANS CLUSTERING")
print("="*50)

scaler  = StandardScaler()
X_km    = scaler.fit_transform(df[["cpu_pct","mem_pct","disco_pct"]])
km      = KMeans(n_clusters=3, random_state=42, n_init=10)
df["cluster"] = km.fit_predict(X_km)
sil = silhouette_score(X_km, df["cluster"])

nomes = {0:"Baixo Uso", 1:"Uso Médio", 2:"Alto Uso"}
print(f"  Silhouette Score: {sil:.4f}")
print("\n  Distribuição dos clusters:")
print(df["cluster"].value_counts().rename(nomes))
print("\n  Média por cluster:")
print(df.groupby("cluster")[["cpu_pct","mem_pct","disco_pct"]].mean().round(2).rename(index=nomes))

print("\n" + "="*50)
print("ALGORITMO 3 — ÁRVORE DE DECISÃO")
print("="*50)

def classificar(row):
    if row["cpu_pct"] > 80 or row["mem_pct"] > 85:
        return 2
    elif row["cpu_pct"] > 50 or row["mem_pct"] > 60:
        return 1
    return 0

df["status"] = df.apply(classificar, axis=1)
features = ["cpu_pct","mem_pct","disco_pct","load_1min"]
X_dt = df[features]
y_dt = df["status"]
X_tr, X_te, y_tr, y_te = train_test_split(X_dt, y_dt, test_size=0.3, random_state=42)

dt = DecisionTreeClassifier(max_depth=4, random_state=42)
dt.fit(X_tr, y_tr)
y_pred_dt = dt.predict(X_te)
acc = accuracy_score(y_te, y_pred_dt)

labels = {0:"Normal", 1:"Alerta", 2:"Crítico"}
print(f"  Acurácia: {acc*100:.1f}%")
print(f"\n  Distribuição dos estados:")
print(df["status"].value_counts().rename(labels))

print("\n📊 Gerando gráficos...")

fig, axes = plt.subplots(3, 2, figsize=(16, 14))
fig.suptitle("Monitoramento de Recursos EC2 com IA", fontsize=16, fontweight="bold", y=0.98)

ax = axes[0, 0]
ax.plot(df["sample_idx"], df["cpu_pct"],  label="CPU %",    color="#e74c3c", linewidth=2)
ax.plot(df["sample_idx"], df["mem_pct"],  label="Memória %", color="#3498db", linewidth=2)
ax.set_title("Uso de CPU e Memória ao Longo do Tempo")
ax.set_xlabel("Amostra"); ax.set_ylabel("%")
ax.legend(); ax.grid(alpha=0.3)

ax = axes[0, 1]
ax.scatter(df["sample_idx"], df["cpu_pct"], color="#e74c3c", alpha=0.4, label="Real", s=20)
ax.plot(df["sample_idx"], rl.predict(df[["sample_idx"]]), color="#2ecc71", linewidth=2, label="Regressão")
ax.plot(futuros, cpu_futuro, color="#f39c12", linewidth=2, linestyle="--", label="Predição futura")
ax.axvline(60, color="gray", linestyle=":", alpha=0.7)
ax.set_title("Regressão Linear — Predição de CPU")
ax.set_xlabel("Amostra"); ax.set_ylabel("CPU %")
ax.legend(); ax.grid(alpha=0.3)

ax = axes[1, 0]
cores = {0:"#2ecc71", 1:"#f39c12", 2:"#e74c3c"}
for c, nome in nomes.items():
    subset = df[df["cluster"] == c]
    ax.scatter(subset["cpu_pct"], subset["mem_pct"], c=cores[c], label=nome, s=50, alpha=0.8)
ax.set_title("K-Means — Clusters de Padrão de Uso")
ax.set_xlabel("CPU %"); ax.set_ylabel("Memória %")
ax.legend(); ax.grid(alpha=0.3)

ax = axes[1, 1]
contagem = df["cluster"].value_counts().sort_index()
bars = ax.bar([nomes[i] for i in contagem.index], contagem.values,
               color=[cores[i] for i in contagem.index], edgecolor="white", linewidth=1.5)
for bar, v in zip(bars, contagem.values):
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.3,
            str(v), ha="center", fontweight="bold")
ax.set_title("K-Means — Quantidade por Cluster")
ax.set_ylabel("Amostras"); ax.grid(axis="y", alpha=0.3)

ax = axes[2, 0]
cores_dt = {0:"#2ecc71", 1:"#f39c12", 2:"#e74c3c"}
for estado, nome in labels.items():
    subset = df[df["status"] == estado]
    ax.scatter(subset["sample_idx"], subset["cpu_pct"],
               c=cores_dt[estado], label=nome, s=40, alpha=0.85)
ax.set_title("Árvore de Decisão — Estado do Sistema")
ax.set_xlabel("Amostra"); ax.set_ylabel("CPU %")
ax.legend(); ax.grid(alpha=0.3)

ax = axes[2, 1]
importancias = pd.Series(dt.feature_importances_, index=features).sort_values()
importancias.plot(kind="barh", ax=ax, color="#9b59b6", edgecolor="white")
ax.set_title("Árvore de Decisão — Importância das Features")
ax.set_xlabel("Importância"); ax.grid(axis="x", alpha=0.3)

plt.tight_layout()
plt.savefig("monitoramento_ia.png", dpi=150, bbox_inches="tight")
print("✅ Gráfico salvo: monitoramento_ia.png")

print("\n" + "="*50)
print("✅ EXECUÇÃO CONCLUÍDA COM SUCESSO!")
print("="*50)
print("  Arquivos gerados:")
print("    📄 dados_ec2.csv")
print("    📊 monitoramento_ia.png")