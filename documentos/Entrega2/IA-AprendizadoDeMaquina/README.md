# Inteligencia Artificial e Aprendizado de Maquina — Entrega 2

> **Codigo-fonte**: todo o codigo (scripts de treino, modelo, dataset, inferencia em tempo real) esta em [`src/Entrega2/backend/camera-ai/`](../../../src/Entrega2/backend/camera-ai/).
> Esta pasta contem apenas a documentacao e o notebook explicativo.
>
> **Por que essa separacao?** Seguindo boas praticas de engenharia de software, o repositorio separa **documentacao** de **codigo-fonte**. A pasta `documentos/` armazena exclusivamente entregas academicas (PDFs, notebooks explicativos), enquanto a pasta `src/` concentra todo o codigo executavel. Isso evita misturar artefatos de naturezas diferentes e reflete a arquitetura real do projeto em producao.

---

## Documento da Entrega

| Arquivo | Descricao |
|---------|-----------|
| Entrega02-IA-Aprendizado-de-Maquina.pdf | Relatorio completo com introducao, produtos identificados, metodologia, metricas, demonstracao visual e conclusao |

---

## Notebook

| Arquivo | Descricao |
|---------|-----------|
| [food_classifier.ipynb](food_classifier.ipynb) | Pipeline completo (9 passos documentados) com codigo inline, explicacoes e visualizacoes — atende o requisito de formato Jupyter Notebook |

O notebook cobre: importacao de bibliotecas, configuracao de hiperparametros e tabelas de peso/preco, data augmentation, geracao do dataset, divisao treino/validacao, geracao de labels YOLO, treinamento, avaliacao de metricas e inferencia visual.

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

Quando a IA reconhece um item especifico dentro de "outros" (acucar, cafe, macarrao), essa informacao e incluida no campo `sub_item`. Caso nao reconheca, retorna `"desconhecido"`.

---

## Produtos, Pesos e Precos

| Produto  | Peso (g) | Preco/kg (R$) | Valor unit. (R$) |
|----------|----------|---------------|------------------|
| Arroz    | 1.000    | 5,50          | 5,50             |
| Feijao   | 1.000    | 7,50          | 7,50             |
| Acucar   | 1.000    | 4,50          | 4,50             |
| Cafe     | 500      | 50,00         | 25,00            |
| Macarrao | 500      | 8,00          | 4,00             |

Pesos e precos ficam centralizados em `camera-ai/config.py` (constantes `CATEGORY_WEIGHTS_G` e `CATEGORY_PRICES_BRL_PER_KG`) — ajustavel sem alterar a logica de deteccao.

---

## Metricas do Modelo Treinado

| Metrica  | Valor |
|----------|-------|
| mAP50    | 99,5% |
| mAP50-95 | 99,5% |
| Precision| 99,7% |
| Recall   | 99,9% |

Metricas extraidas do `best.pt` — melhor epoca do treinamento, validada sobre o conjunto de validacao (20% do dataset).

---

## Dataset

| Classe   | Imagens base | Apos augmentation |
|----------|-------------|-------------------|
| Arroz    | 17          | 187               |
| Feijao   | 28          | 308               |
| Acucar   | 16          | 176               |
| Cafe     | 9           | 99                |
| Macarrao | 18          | 198               |
| **Total**| **88**      | **968**           |

Split 80/20: ~774 imagens de treino / ~194 de validacao.

---

## Como Funciona a Contagem (camera-ai)

O modelo treinado e integrado ao modulo `camera-ai` que roda em tempo real via webcam:

1. **Deteccao** (`ml/inference.py`): YOLOv8 analisa cada frame com confianca >= 0,75 e devolve bounding boxes
2. **Tracking** (`tracking/tracker.py`): CentroidTracker associa deteccoes entre frames por distancia euclidiana (limite 100 px, descarta apos 5 frames sem aparecer)
3. **Estabilidade**: cada track precisa manter a mesma classe por 10 frames consecutivos para ser considerado estavel
4. **Linha virtual** (`tracking/line_counter.py`): linha horizontal a 50% da altura do frame; item e contabilizado ao cruzar a linha — o ID do track previne dupla contagem
5. **Persistencia** (`services/detection_writer.py`): contagem confirmada gravada na tabela `ai_detections` do PostgreSQL com timestamp, equipe, peso e valor
6. **Evidencia** (`services/s3_uploader.py`): frame anotado enviado em background ao Amazon S3

---

## Como Executar o Codigo

```bash
# Treinar o modelo (scripts CLI)
cd src/Entrega2/backend/camera-ai/training
pip install ultralytics opencv-python numpy tqdm

python generate_dataset.py    # gera dataset aumentado
python split_dataset.py       # divide treino/validacao
python generate_labels.py     # gera labels YOLO
python train_yolo.py          # treina o modelo (~50 min CPU)
python evaluate.py            # avalia metricas

# Inferencia em tempo real (camera-ai)
cd src/Entrega2/backend/camera-ai
pip install -r requirements.txt
python main.py                # seleciona equipe e inicia deteccao
```

---

## Augmentacoes Aplicadas

| Tecnica          | Parametros                      | Probabilidade |
|------------------|---------------------------------|---------------|
| Rotacao          | +/- 20 graus                    | 70%           |
| Flip             | Horizontal, vertical, ambos     | 50%           |
| Brilho/Contraste | alpha [0.8, 1.2], beta [-30,30] | 50%           |
| Blur Gaussiano   | kernel 3x3 ou 5x5               | 30%           |
| Ruido Gaussiano  | sigma = 10                      | 30%           |
| Zoom             | escala [0.85, 1.15]             | 50%           |

---

## Tecnologias

| Tecnologia              | Finalidade |
|-------------------------|-----------|
| Python 3.10             | Linguagem principal |
| YOLOv8n (Ultralytics)   | Deteccao de objetos em tempo real |
| PyTorch                 | Framework de deep learning |
| OpenCV                  | Processamento de imagem e data augmentation |
| NumPy                   | Manipulacao de arrays e operacoes numericas |
| SQLAlchemy + PostgreSQL | Persistencia das deteccoes no banco de dados |
| Boto3                   | Upload assincrono de evidencias para Amazon S3 |
| Jupyter Notebook        | Ambiente de treinamento e validacao do modelo |
