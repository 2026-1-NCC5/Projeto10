# Inteligência Artificial e Aprendizado de Máquina

## Introdução

Este módulo implementa um classificador de visão computacional para alimentos, desenvolvido como entrega da disciplina de Inteligência Artificial e Aprendizado de Máquina.

O sistema identifica embalagens de três categorias — **arroz**, **feijão** e **outros** — a partir de imagens capturadas em ambiente controlado (fundo escuro, iluminação fixa, câmera sobre rampa). Essa condição simplifica a segmentação do objeto, tornando desnecessário um pipeline de pré-processamento complexo.

O arquivo `food_classifier.ipynb` é o documento principal de entrega acadêmica. Ele contém o mesmo código dos scripts Python, porém organizado em células com explicações em texto, curvas de treinamento e visualizações — servindo para que os avaliadores acompanhem o raciocínio por trás de cada etapa. Os arquivos `.py` são a implementação executável do projeto, destinados ao uso prático e à integração futura com uma API.

---

## Arquivos

### Módulos de suporte

| Arquivo            | Responsabilidade                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| `config.py`        | Constantes globais: caminhos, categorias, hiperparâmetros e device (CPU/GPU)                           |
| `preprocessing.py` | Funções OpenCV: extração de ROI via Otsu, pré-processamento de imagens e detecção de objetos em frames |
| `dataset.py`       | Classe `FoodDataset`, transforms de treino/validação e função de carregamento do dataset               |
| `model.py`         | Criação do MobileNetV2 com classificador customizado e carregamento de pesos salvos                    |

### Scripts executáveis

| Arquivo      | Finalidade                                                               |
| ------------ | ------------------------------------------------------------------------ |
| `train.py`   | Treina o modelo e salva o melhor checkpoint em `models/`                 |
| `predict.py` | Classifica uma única imagem e exibe o resultado com gráfico de confiança |
| `webcam.py`  | Abre a câmera, classifica objetos em tempo real e conta objetos únicos   |

### Dataset e modelo

```
dataset/
    arroz/      <- imagens de embalagens de arroz
    feijao/     <- imagens de embalagens de feijão
    outros/     <- imagens de outras embalagens
models/
    best_food_classifier.pth   <- gerado após o treinamento
```

---

## Como executar

Todos os comandos devem ser executados dentro desta pasta.

### 1. Preparar o dataset

Coloque as imagens de cada categoria nas subpastas correspondentes dentro de `dataset/`. Os formatos aceitos são `.jpg`, `.jpeg`, `.png`, `.bmp` e `.webp`. Não há número mínimo obrigatório, mas recomenda-se ao menos 30 imagens por categoria para resultados confiáveis.

### 2. Treinar o modelo

```bash
python train.py
```

O script carrega as imagens, divide em treino (80%) e validação (20%), treina por 15 épocas e salva o melhor modelo em `models/best_food_classifier.pth`. Ao final, imprime o relatório de classificação e a matriz de confusão.

### 3. Classificar uma imagem

```bash
python predict.py caminho/para/imagem.jpg
```

Exibe no terminal a categoria predita e a confiança, e abre uma janela com a imagem e o gráfico de probabilidades por categoria.

### 4. Inferência via webcam

```bash
python webcam.py
```

Abre a câmera do computador. Para cada frame, detecta se há um objeto presente, classifica-o e exibe o label com a confiança na tela. Conta objetos únicos — um novo objeto é registrado quando aparece após ausência ou após um intervalo de 2 segundos, evitando contagens duplicadas entre frames. Pressione `q` para encerrar. Ao fechar, imprime o resumo com o total por categoria.

Se a webcam não estiver disponível, o script exibe uma mensagem informativa e encerra sem erros.

---

## Requisitos

Python 3.10 ou superior.

```
torch
torchvision
opencv-python
scikit-learn
matplotlib
Pillow
numpy
```

Instalação:

```bash
pip install torch torchvision opencv-python scikit-learn matplotlib Pillow numpy
```

Para usar GPU, instale o PyTorch com suporte a CUDA seguindo as instruções em pytorch.org de acordo com a versão do driver instalado. Sem GPU, o treinamento ocorre na CPU normalmente, porém de forma mais lenta.
