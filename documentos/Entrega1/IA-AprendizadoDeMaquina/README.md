# Inteligencia Artificial e Aprendizado de Maquina

## Introducao

Este modulo implementa um sistema de deteccao de objetos para alimentos doados, usando YOLOv8 (You Only Look Once), desenvolvido como entrega da disciplina de Inteligencia Artificial e Aprendizado de Maquina.

O sistema detecta embalagens de tres categorias — **arroz**, **feijao** e **outros** — a partir de imagens capturadas em ambiente controlado (fundo escuro, iluminacao fixa, camera sobre rampa). Utiliza data augmentation para ampliar o dataset e melhorar a robustez do modelo.

---

## Arquivos

### Pipeline de dados

| Arquivo               | Responsabilidade                                                                 |
| --------------------- | -------------------------------------------------------------------------------- |
| `config.py`           | Constantes globais: caminhos, categorias, hiperparametros                        |
| `generate_dataset.py` | Gera dataset aumentado a partir das imagens base (rotacao, flip, blur, ruido, zoom) |
| `split_dataset.py`    | Divide o dataset em treino (80%) e validacao (20%)                               |
| `generate_labels.py`  | Gera arquivos de label no formato YOLO para cada imagem                          |
| `data.yaml`           | Configuracao do dataset para o YOLOv8                                            |

### Scripts executaveis

| Arquivo          | Finalidade                                                              |
| ---------------- | ----------------------------------------------------------------------- |
| `train_yolo.py`  | Treina o modelo YOLOv8n e salva o checkpoint em `runs/`                 |
| `evaluate.py`    | Avalia o modelo treinado e imprime metricas por classe                  |
| `webcam_demo.py` | Abre a camera, detecta objetos em tempo real e conta itens unicos       |

### Dataset e modelo

```
dataset_base/
    arroz/       <- imagens originais de embalagens de arroz
    feijao/      <- imagens originais de embalagens de feijao
    outros/      <- imagens originais de outras embalagens (inclui acucar, cafe)
dataset/
    images/
        train/   <- imagens aumentadas para treino
        val/     <- imagens para validacao
    labels/
        train/   <- labels YOLO para treino
        val/     <- labels YOLO para validacao
runs/
    detect/
        treino_alimentos/
            weights/best.pt   <- melhor modelo gerado
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

Aplica augmentacoes (rotacao, flip, brilho/contraste, blur gaussiano, ruido, zoom) em cada imagem base, gerando 10 variantes por original + a original redimensionada. Total esperado: ~825 imagens.

### 3. Dividir em treino/validacao

```bash
python split_dataset.py
```

Move 20% das imagens para o conjunto de validacao.

### 4. Gerar labels

```bash
python generate_labels.py
```

Cria arquivos `.txt` no formato YOLO (classe + bounding box) para cada imagem.

### 5. Treinar o modelo

```bash
python train_yolo.py
```

Treina o YOLOv8n por 30 epocas. O melhor modelo e salvo em `runs/detect/treino_alimentos/weights/best.pt`.

### 6. Avaliar o modelo

```bash
python evaluate.py
```

Imprime mAP50, mAP50-95 e metricas por classe (precision, recall, AP50).

### 7. Copiar modelo para o backend

```bash
cp runs/detect/treino_alimentos/weights/best.pt ../../src/Entrega1/backend/models/best.pt
```

---

## Testar com a webcam (Demo Visual)

Apos treinar o modelo (passos 1-6 acima), voce pode testar a deteccao em tempo real usando sua propria camera.

### Preparacao

Certifique-se de que o modelo treinado existe em `runs/detect/treino_alimentos/weights/best.pt` (gerado automaticamente no passo 5). O script tambem funciona a partir da pasta do backend se o `best.pt` estiver em `models/`.

### Executar

```bash
python3 webcam_demo.py        # usa a camera padrao (indice 0)
python3 webcam_demo.py 1      # usa webcam externa (indice 1)
python3 webcam_demo.py 2      # tente outros indices se necessario
```

### Como funciona

1. O script abre a camera e carrega o modelo YOLOv8
2. Cada frame e analisado pelo modelo em tempo real
3. Bounding boxes coloridas aparecem ao redor dos objetos detectados com o nome da classe e a confianca
4. **Contagem por estabilidade**: o sistema precisa detectar o **mesmo item por 10 frames consecutivos** (cerca de 1-2 segundos) antes de confirmar a contagem — isso evita contagens falsas
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

[CONTADO] arroz  conf=0.89  total=1
[CONTADO] feijao  conf=0.92  total=2
[CONTADO] outros  conf=0.85  total=3

=== Resumo da sessao ===
  arroz: 1
  feijao: 1
  outros: 1
  total: 3
```

---

## Augmentacoes aplicadas

| Tecnica              | Parametros                  | Probabilidade |
| -------------------- | --------------------------- | ------------- |
| Rotacao              | ±20 graus                   | 70%           |
| Flip                 | Horizontal, vertical, ambos | 50%           |
| Brilho/Contraste     | alpha [0.8, 1.2], beta [-30, 30] | 50%      |
| Blur Gaussiano       | kernel 3x3 ou 5x5           | 30%           |
| Ruido Gaussiano      | sigma = 10                   | 30%           |
| Zoom                 | escala [0.85, 1.15]          | 50%           |

Todas as imagens sao redimensionadas para 640x640 pixels.

---

## Requisitos

Python 3.10 ou superior.

```
ultralytics
opencv-python
numpy
tqdm
```
