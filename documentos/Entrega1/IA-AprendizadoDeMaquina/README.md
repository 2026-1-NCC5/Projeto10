# Inteligencia Artificial e Aprendizado de Maquina — Entrega 1

## Documento da Entrega

O relatorio completo desta entrega esta disponivel em:

**[Entrega01-IA-E-Aprendizado-de-Maquina.pdf](./Entrega01-IA-E-Aprendizado-de-Maquina.pdf)** — contem introducao, metodologia, metricas, tecnologias, estrutura de arquivos, evidencias de execucao via webcam e conclusao.

---

## Introducao

Este modulo implementa um sistema de deteccao de objetos para contagem automatica de alimentos doados, usando YOLOv8n (You Only Look Once — nano), desenvolvido como entrega da disciplina de Inteligencia Artificial e Aprendizado de Maquina.

O modelo YOLO detecta 5 classes granulares — **arroz** (0), **feijao** (1), **acucar** (2), **cafe** (3) e **macarrao** (4) — que sao mapeadas para 3 categorias na API: **arroz**, **feijao** e **outros**. Quando a IA reconhece um item especifico dentro de "outros" (acucar, cafe, macarrao), essa informacao e incluida no campo `sub_item` do payload. Caso nao reconheca, o `sub_item` retorna `"desconhecido"`.

---

## Arquivos

### Notebook principal

| Arquivo | Descricao |
|---------|-----------|
| `food_classifier.ipynb` | Jupyter Notebook com o pipeline completo (10 passos documentados) — atende o requisito de formato Jupyter Notebook/Codigo Python |

### Pipeline de dados

| Arquivo | Responsabilidade |
|---------|-----------------|
| `config.py` | Constantes globais: caminhos, 5 classes YOLO, mapeamento para 3 categorias, hiperparametros |
| `generate_dataset.py` | Gera dataset aumentado a partir das imagens base (rotacao, flip, blur, ruido, zoom) |
| `split_dataset.py` | Divide o dataset em treino (80%) e validacao (20%) |
| `generate_labels.py` | Gera arquivos de label no formato YOLO para cada imagem |
| `data.yaml` | Configuracao do dataset para o YOLOv8 (5 classes) |

### Scripts executaveis

| Arquivo | Finalidade |
|---------|-----------|
| `train_yolo.py` | Treina o modelo YOLOv8n e salva o checkpoint em `runs/` |
| `evaluate.py` | Avalia o modelo treinado e imprime metricas por classe |
| `webcam_demo.py` | Abre a camera, detecta objetos em tempo real, conta itens e exibe o payload JSON que o backend retornaria |

### Dataset, modelo e resultados

```
dataset_base/                          <- 88 imagens originais (5 classes)
    arroz/       (17 imagens)
    feijao/      (28 imagens)
    acucar/      (16 imagens)
    cafe/        (9 imagens)
    macarrao/    (18 imagens)
dataset/                               <- imagens apos augmentation + split
    images/
        train/   (5 subpastas)
        val/     (5 subpastas)
    labels/
        train/   <- labels YOLO para treino
        val/     <- labels YOLO para validacao
models/
    best.pt                            <- modelo treinado final (6.3 MB, 5 classes)
runs/
    detect/
        treino_alimentos/              <- resultados do treino atual
            weights/best.pt
yolov8n.pt                             <- modelo base pre-treinado (COCO)
Entrega01-IA-E-Aprendizado-de-Maquina.pdf  <- relatorio da entrega
```

---

## Mapeamento de classes

O modelo YOLO classifica 5 classes granulares, mapeadas para 3 categorias na API:

| Classe YOLO | ID | Categoria API | sub_item |
|-------------|----|---------------|----------|
| arroz       | 0  | arroz         | arroz    |
| feijao      | 1  | feijao        | feijao   |
| acucar      | 2  | outros        | acucar   |
| cafe        | 3  | outros        | cafe     |
| macarrao    | 4  | outros        | macarrao |

Se o modelo nao reconhece o item especifico, `sub_item` retorna `"desconhecido"` (fallback).

---

## Como executar

Todos os comandos devem ser executados dentro desta pasta.

### 1. Instalar dependencias

```bash
pip install ultralytics opencv-python numpy tqdm
```

### 2. Gerar dataset aumentado

```bash
python generate_dataset.py
```

Aplica augmentacoes em cada imagem base, gerando 10 variantes por original + a original redimensionada. Total esperado: ~968 imagens (88 base x 11).

### 3. Dividir em treino/validacao

```bash
python split_dataset.py
```

Move 20% das imagens para o conjunto de validacao (seed 42).

### 4. Gerar labels

```bash
python generate_labels.py
```

Cria arquivos `.txt` no formato YOLO (classe + bounding box) para cada imagem.

### 5. Treinar o modelo

```bash
python train_yolo.py
```

Treina o YOLOv8n por 30 epocas (batch 8, imagem 640x640). O melhor modelo e salvo em `runs/detect/treino_alimentos/weights/best.pt`.

### 6. Avaliar o modelo

```bash
python evaluate.py
```

Imprime mAP50, mAP50-95 e metricas por classe (precision, recall, AP50).

### 7. Copiar modelo para o backend

```bash
cp runs/detect/treino_alimentos/weights/best.pt models/best.pt
cp runs/detect/treino_alimentos/weights/best.pt ../../../src/Entrega1/backend/models/best.pt
```

---

## Testar com a webcam (Demo Visual)

Apos treinar o modelo (passos 1-6 acima), voce pode testar a deteccao em tempo real usando sua propria camera.

### Executar

```bash
python3 webcam_demo.py        # usa a camera padrao (indice 0)
python3 webcam_demo.py 1      # usa webcam externa (indice 1)
```

### Como funciona

1. O script abre a camera e carrega o modelo YOLOv8
2. Cada frame e analisado pelo modelo em tempo real
3. Bounding boxes coloridas aparecem ao redor dos objetos detectados com o nome da classe e a confianca
4. **Contagem por estabilidade**: o sistema precisa detectar o **mesmo item por 10 frames consecutivos** antes de confirmar a contagem — trocar entre sub-itens (ex: acucar para cafe) reseta o contador
5. Apos contar, ha um cooldown de 3 segundos antes de poder contar o mesmo tipo de item novamente
6. Um painel no canto superior esquerdo mostra as contagens em tempo real por categoria
7. Uma barra de progresso na parte inferior mostra o andamento da estabilizacao
8. A cada item contado, o terminal exibe o **payload JSON** que o backend retornaria via API

### Dicas para teste

- Segure o produto **parado** na frente da camera por 2-3 segundos ate a barra de estabilizacao completar
- Mantenha o produto **centralizado** no campo de visao da camera
- Boa iluminacao melhora a deteccao
- Pressione **q** para encerrar e ver o resumo final no terminal

### Exemplo de saida no terminal

```
Modelo carregado.
Camera iniciada. Pressione 'q' para sair.

[CONTADO] arroz  conf=0.92  total=1
[PAYLOAD] {
  "label": "arroz",
  "sub_item": "arroz",
  "confidence": 0.9187,
  "timestamp": 1774728142.3
}

[CONTADO] feijao  conf=0.89  total=2
[PAYLOAD] {
  "label": "feijao",
  "sub_item": "feijao",
  "confidence": 0.8934,
  "timestamp": 1774728148.5
}

[CONTADO] outros (macarrao)  conf=0.84  total=3
[PAYLOAD] {
  "label": "outros",
  "sub_item": "macarrao",
  "confidence": 0.8408,
  "timestamp": 1774728156.7
}

=== Resumo da sessao ===
  arroz: 1
  feijao: 1
  outros: 1
  total: 3

=== Payload que o backend retornaria (DELETE /api/sessions/id) ===
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

## Augmentacoes aplicadas

| Tecnica | Parametros | Probabilidade | Objetivo |
|---------|-----------|---------------|----------|
| Rotacao | ±20 graus | 70% | Variacao de angulo |
| Flip | Horizontal, vertical, ambos | 50% | Espelhamento |
| Brilho/Contraste | alpha [0.8, 1.2], beta [-30, 30] | 50% | Variacao de iluminacao |
| Blur Gaussiano | kernel 3x3 ou 5x5 | 30% | Suavizacao |
| Ruido Gaussiano | sigma = 10 | 30% | Robustez a ruido |
| Zoom | escala [0.85, 1.15] | 50% | Variacao de escala |

Todas as imagens sao redimensionadas para 640x640 pixels.

---

## Tecnologias

| Tecnologia | Versao | Finalidade |
|------------|--------|-----------|
| Python | 3.10 | Linguagem principal |
| YOLOv8 (Ultralytics) | 8.4.24 | Deteccao de objetos em tempo real |
| PyTorch | 2.10.0 | Framework de deep learning |
| OpenCV | - | Processamento de imagem e data augmentation |
| NumPy | - | Manipulacao de arrays e operacoes numericas |
| Jupyter Notebook | - | Documentacao interativa do pipeline |

---

## Requisitos

Python 3.10 ou superior.

```
ultralytics
opencv-python
numpy
tqdm
```
