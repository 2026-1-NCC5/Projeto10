# Inteligencia Artificial e Aprendizado de Maquina — Entrega 1

> **Codigo-fonte**: todo o codigo (scripts de treino, modelo, dataset, demo) esta em [`src/Entrega1/backend/training/`](../../../src/Entrega1/backend/training/).
> Esta pasta contem apenas a documentacao e o notebook explicativo.
>
> **Por que essa separacao?** Seguindo boas praticas de engenharia de software, o repositorio separa **documentacao** de **codigo-fonte**. A pasta `documentos/` armazena exclusivamente entregas academicas (PDFs, notebooks explicativos e resultados visuais), enquanto a pasta `src/` concentra todo o codigo executavel. Isso evita misturar artefatos de naturezas diferentes, facilita a manutencao e reflete a arquitetura real do projeto em producao, onde os scripts de treino sao consumidos diretamente pelo backend.

---

## Documento da Entrega

| Arquivo | Descricao |
|---------|-----------|
| Entrega01-IA-E-Aprendizado-de-Maquina.pdf | Relatorio completo com introducao, metodologia, metricas, tecnologias, evidencias e conclusao |

---

## Notebook

| Arquivo | Descricao |
|---------|-----------|
| [food_classifier.ipynb](food_classifier.ipynb) | Pipeline completo (10 passos documentados) com codigo inline, explicacoes e visualizacoes — atende o requisito de formato Jupyter Notebook |

O notebook contem o mesmo codigo dos scripts em `src/Entrega1/backend/training/`, mas com explicacoes passo a passo e saidas visuais.

---

## Sobre o Modelo

O modelo YOLO classifica **5 classes granulares**, mapeadas para **3 categorias** na API:

| Classe YOLO | ID | Categoria API | sub_item |
|-------------|----|---------------|----------|
| arroz       | 0  | arroz         | arroz    |
| feijao      | 1  | feijao        | feijao   |
| acucar      | 2  | outros        | acucar   |
| cafe        | 3  | outros        | cafe     |
| macarrao    | 4  | outros        | macarrao |

Quando a IA reconhece um item especifico dentro de "outros" (acucar, cafe, macarrao), essa informacao e incluida no campo `sub_item` do payload. Caso nao reconheca, retorna `"desconhecido"`.

### Exemplo de payload retornado pelo backend

```json
{
  "session_id": "demo-local",
  "counts": { "arroz": 1, "feijao": 1, "outros": 1, "total": 3 },
  "sub_items": { "macarrao": 1 },
  "detections": [
    { "label": "arroz", "sub_item": "arroz", "confidence": 0.9187, "timestamp": 1774728142.3 },
    { "label": "feijao", "sub_item": "feijao", "confidence": 0.8934, "timestamp": 1774728148.5 },
    { "label": "outros", "sub_item": "macarrao", "confidence": 0.8408, "timestamp": 1774728156.7 }
  ],
  "elapsed_seconds": 25.3,
  "total_unique_items": 3
}
```

---

## Como executar o codigo

```bash
cd src/Entrega1/backend/training

pip install ultralytics opencv-python numpy tqdm

python generate_dataset.py     # gera dataset aumentado
python split_dataset.py        # divide treino/validacao
python generate_labels.py      # gera labels YOLO
python train_yolo.py           # treina o modelo
python evaluate.py             # avalia metricas

python webcam_demo.py 1        # demo visual com webcam externa
```

---

## Augmentacoes aplicadas

| Tecnica | Parametros | Probabilidade |
|---------|-----------|---------------|
| Rotacao | +/- 20 graus | 70% |
| Flip | Horizontal, vertical, ambos | 50% |
| Brilho/Contraste | alpha [0.8, 1.2], beta [-30, 30] | 50% |
| Blur Gaussiano | kernel 3x3 ou 5x5 | 30% |
| Ruido Gaussiano | sigma = 10 | 30% |
| Zoom | escala [0.85, 1.15] | 50% |

---

## Tecnologias

| Tecnologia | Finalidade |
|------------|-----------|
| Python 3.10 | Linguagem principal |
| YOLOv8 (Ultralytics) | Deteccao de objetos em tempo real |
| PyTorch | Framework de deep learning |
| OpenCV | Processamento de imagem e data augmentation |
| NumPy | Manipulacao de arrays e operacoes numericas |
