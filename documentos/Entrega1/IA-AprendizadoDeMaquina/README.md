# Inteligencia Artificial e Aprendizado de Maquina — Entrega 1

## Documento da Entrega

O relatorio completo desta entrega esta disponivel em:

**[Entrega01-IA-E-Aprendizado-de-Maquina.pdf](./Entrega01-IA-E-Aprendizado-de-Maquina.pdf)** — contem introducao, metodologia, metricas, tecnologias, estrutura de arquivos, evidencias de execucao via webcam e conclusao.

---

## Introducao

Este modulo implementa um sistema de deteccao de objetos para contagem automatica de alimentos doados, usando YOLOv8n (You Only Look Once — nano), desenvolvido como entrega da disciplina de Inteligencia Artificial e Aprendizado de Maquina.

O sistema detecta embalagens de tres categorias — **arroz** (classe 0), **feijao** (classe 1) e **outros** (classe 2, inclui acucar, cafe e demais itens) — a partir de imagens capturadas em ambiente controlado (fundo escuro, iluminacao fixa, camera sobre rampa).

---

## Metricas do Modelo Treinado

Avaliacao no conjunto de validacao (313 imagens):

| Metrica | Valor |
|---------|-------|
| mAP50 | 0.6337 |
| mAP50-95 | 0.6337 |
| Precision geral | 0.543 |
| Recall geral | 0.985 |

Metricas por classe:

| Classe | Precision | Recall | AP50 |
|--------|-----------|--------|------|
| Arroz | 0.5217 | 0.9545 | 0.6878 |
| Feijao | 0.5167 | 1.0000 | 0.5776 |
| Outros | 0.5901 | 1.0000 | 0.6358 |

Graficos de curvas (Precision, Recall, F1, PR) e matrizes de confusao estao disponiveis em `runs/detect/treino_alimentos2/`.

---

## Arquivos

### Notebook principal

| Arquivo | Descricao |
|---------|-----------|
| `food_classifier.ipynb` | Jupyter Notebook com o pipeline completo (10 passos documentados) — atende o requisito de formato Jupyter Notebook/Codigo Python |

### Pipeline de dados

| Arquivo | Responsabilidade |
|---------|-----------------|
| `config.py` | Constantes globais: caminhos, categorias, hiperparametros |
| `generate_dataset.py` | Gera dataset aumentado a partir das imagens base (rotacao, flip, blur, ruido, zoom) |
| `split_dataset.py` | Divide o dataset em treino (80%) e validacao (20%) |
| `generate_labels.py` | Gera arquivos de label no formato YOLO para cada imagem |
| `data.yaml` | Configuracao do dataset para o YOLOv8 |

### Scripts executaveis

| Arquivo | Finalidade |
|---------|-----------|
| `train_yolo.py` | Treina o modelo YOLOv8n e salva o checkpoint em `runs/` |
| `evaluate.py` | Avalia o modelo treinado e imprime metricas por classe |
| `webcam_demo.py` | Abre a camera, detecta objetos em tempo real e conta itens unicos |

### Dataset, modelo e resultados

```
dataset_base/                          <- 88 imagens originais
    arroz/       (17 imagens)
    feijao/      (28 imagens)
    outros/      (43 imagens)
dataset/                               <- 1089 imagens apos augmentation + split
    images/
        train/   (776 imagens)
        val/     (313 imagens)
    labels/
        train/   <- labels YOLO para treino
        val/     <- labels YOLO para validacao
models/
    best.pt                            <- modelo treinado final (6.3 MB)
runs/
    detect/
        treino_alimentos2/             <- resultados do treino atual
            weights/best.pt
            results.csv
            results.png
            confusion_matrix.png
            confusion_matrix_normalized.png
            BoxP_curve.png
            BoxR_curve.png
            BoxF1_curve.png
            BoxPR_curve.png
        val2/                          <- resultados da avaliacao
yolov8n.pt                             <- modelo base pre-treinado (COCO)
Entrega01-IA-E-Aprendizado-de-Maquina.pdf  <- relatorio da entrega
```

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

Treina o YOLOv8n por 30 epocas (batch 8, imagem 640x640). O melhor modelo e salvo em `runs/detect/treino_alimentos/weights/best.pt`. Tempo estimado: ~57 minutos na CPU.

### 6. Avaliar o modelo

```bash
python evaluate.py
```

Imprime mAP50, mAP50-95 e metricas por classe (precision, recall, AP50).

### 7. Copiar modelo para o backend

```bash
cp runs/detect/treino_alimentos2/weights/best.pt models/best.pt
cp runs/detect/treino_alimentos2/weights/best.pt ../../src/Entrega1/backend/models/best.pt
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
4. **Contagem por estabilidade**: o sistema precisa detectar o **mesmo item por 10 frames consecutivos** antes de confirmar a contagem
5. Apos contar, ha um cooldown de 3 segundos antes de poder contar o mesmo tipo de item novamente
6. Um painel no canto superior esquerdo mostra as contagens em tempo real por categoria
7. Uma barra de progresso na parte inferior mostra o andamento da estabilizacao

### Dicas para teste

- Segure o produto **parado** na frente da camera por 2-3 segundos ate a barra de estabilizacao completar
- Mantenha o produto **centralizado** no campo de visao da camera
- Boa iluminacao melhora a deteccao
- Pressione **q** para encerrar e ver o resumo final no terminal

### Exemplo de saida no terminal

```
Modelo carregado.
Camera iniciada. Pressione 'q' para sair.

[CONTADO] arroz  conf=0.84  total=1
[CONTADO] feijao  conf=0.88  total=2
[CONTADO] outros  conf=0.87  total=3

=== Resumo da sessao ===
  arroz: 1
  feijao: 1
  outros: 1
  total: 3
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
