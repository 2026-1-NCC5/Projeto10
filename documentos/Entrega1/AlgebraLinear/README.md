# Entrega 1 — Representação Matricial de Imagens Digitais

Demonstração de que toda imagem digital pode ser representada como uma **matriz numérica** (H × W), onde cada elemento contém os valores de cor (R, G, B) de um pixel. A imagem utilizada é um registro visual de alimento doado (pacote de feijão), relacionada ao projeto do semestre.

## Documentação

| Arquivo | Descrição |
|---------|-----------|
| [Entrega01-Algebra Linear-Vetores-Geometria-Analítica.pdf](Entrega01-Algebra%20Linear-Vetores-Geometria-Analítica.pdf) | Documento PDF da entrega com a fundamentação teórica e análise completa |

## Resultados gerados

| Arquivo | Descrição |
|---------|-----------|
| [representacao_matricial.xlsx](representacao_matricial.xlsx) | Planilha com duas abas: **"Dados dos Pixels"** (2.500 linhas com Y, X, R, G, B) e **"Imagem Reconstruída"** (grade 50×50 onde cada célula está pintada com a cor RGB do pixel) |
| [pixel_data.csv](pixel_data.csv) | Dados brutos dos pixels em formato CSV — pode ser aberto em qualquer editor de planilhas |
| [reconstructed_image.png](reconstructed_image.png) | Imagem reconstruída exclusivamente a partir do CSV, provando que nenhuma informação foi perdida |

## Notebook

| Arquivo | Descrição |
|---------|-----------|
| [rgb_pixel_extraction.ipynb](rgb_pixel_extraction.ipynb) | Notebook fonte com todo o pipeline (7 passos) — pode ser executado para reproduzir os resultados |
| [rgb_pixel_extraction_executed.ipynb](rgb_pixel_extraction_executed.ipynb) | Notebook já executado com todas as saídas visíveis (tabelas, imagens, comparação final) |

O notebook segue 7 passos:

1. Importação das bibliotecas (Pillow, pandas, NumPy)
2. Definição dos caminhos de entrada/saída
3. Carregamento e redimensionamento da imagem para 50×50 pixels
4. Extração da matriz de pixels (Y, X, R, G, B) — 2.500 linhas
5. Exportação dos dados para CSV
6. Reconstrução da imagem a partir do CSV (ignorando a imagem original)
7. Comparação visual e verificação numérica (`np.array_equal` → **SIM**, imagens idênticas)

## Código-fonte (módulos Python)

O pipeline também está disponível como módulos Python independentes, que podem ser executados via `python3 main.py`:

```
main.py                  ← Entry point — orquestra todo o pipeline
├── image_loader.py      ← Busca a imagem em images/ e redimensiona para 50×50
├── pixel_extractor.py   ← Percorre cada pixel e monta o DataFrame (Y, X, R, G, B)
├── data_exporter.py     ← Exporta o DataFrame para CSV
└── image_reconstructor.py  ← Lê o CSV e reconstrói a imagem pixel a pixel

generate_excel.py        ← Gera o arquivo .xlsx a partir do CSV (independente do main.py)
```

Os módulos `main.py` e o notebook fazem a mesma coisa — o notebook adiciona visualizações e explicações passo a passo, enquanto os módulos são a versão programática limpa.

O `generate_excel.py` é independente: lê o `pixel_data.csv` (gerado pelo notebook ou pelo `main.py`) e produz o `representacao_matricial.xlsx`.

## Estrutura de pastas

```
AlgebraLinear/
├── images/
│   └── pacote-feijao.png                      ← Imagem original (alimento doado)
├── Entrega01-Algebra Linear-(...).pdf         ← Documento da entrega
├── rgb_pixel_extraction.ipynb                 ← Notebook fonte
├── rgb_pixel_extraction_executed.ipynb         ← Notebook com saídas
├── main.py                                    ← Pipeline via CLI
├── image_loader.py                            ← Módulo: carregar imagem
├── pixel_extractor.py                         ← Módulo: extrair pixels
├── data_exporter.py                           ← Módulo: exportar CSV
├── image_reconstructor.py                     ← Módulo: reconstruir imagem
├── generate_excel.py                          ← Gerador do Excel
├── pixel_data.csv                             ← Dados dos pixels (gerado)
├── reconstructed_image.png                    ← Imagem reconstruída (gerado)
└── representacao_matricial.xlsx               ← Planilha com dados + imagem (gerado)
```

## Como reproduzir

```bash
cd documentos/Entrega1/AlgebraLinear

# Opção 1: via notebook
jupyter notebook rgb_pixel_extraction.ipynb

# Opção 2: via CLI
python3 main.py

# Gerar o Excel (após ter o pixel_data.csv)
python3 generate_excel.py
```

**Dependências**: `Pillow`, `pandas`, `numpy`, `openpyxl`
