# Entrega 1 — Representacao Matricial de Imagens Digitais

> **Codigo-fonte**: os modulos Python (main.py, image_loader.py, pixel_extractor.py, data_exporter.py, image_reconstructor.py, generate_excel.py) estao em [`src/Entrega1/backend/algebra-linear/`](../../../src/Entrega1/backend/algebra-linear/).
> Esta pasta contem a documentacao, notebooks, dados gerados e resultados visuais.
>
> **Por que essa separacao?** Seguindo boas praticas de engenharia de software, o repositorio separa **documentacao** de **codigo-fonte**. A pasta `documentos/` armazena exclusivamente entregas academicas (PDFs, notebooks explicativos e resultados visuais), enquanto a pasta `src/` concentra todo o codigo executavel. Isso evita misturar artefatos de naturezas diferentes, facilita a manutencao e garante que a estrutura do repositorio reflita a arquitetura real do projeto.

---

## Documento da Entrega

| Arquivo | Descricao |
|---------|-----------|
| [Entrega01-Algebra Linear-Vetores-Geometria-Analitica.pdf](Entrega01-Algebra%20Linear-Vetores-Geometria-Analítica.pdf) | Documento PDF da entrega com a fundamentacao teorica e analise completa |

---

## Notebooks

| Arquivo | Descricao |
|---------|-----------|
| [rgb_pixel_extraction.ipynb](rgb_pixel_extraction.ipynb) | Notebook fonte com todo o pipeline (7 passos) — pode ser executado para reproduzir os resultados |
| [rgb_pixel_extraction_executed.ipynb](rgb_pixel_extraction_executed.ipynb) | Notebook ja executado com todas as saidas visiveis (tabelas, imagens, comparacao final) |

O notebook segue 7 passos:

1. Importacao das bibliotecas (Pillow, pandas, NumPy)
2. Definicao dos caminhos de entrada/saida
3. Carregamento e redimensionamento da imagem para 50x50 pixels
4. Extracao da matriz de pixels (Y, X, R, G, B) — 2.500 linhas
5. Exportacao dos dados para CSV
6. Reconstrucao da imagem a partir do CSV (ignorando a imagem original)
7. Comparacao visual e verificacao numerica (`np.array_equal` -> **SIM**, imagens identicas)

---

## Resultados gerados

| Arquivo | Descricao |
|---------|-----------|
| [representacao_matricial.xlsx](representacao_matricial.xlsx) | Planilha com duas abas: "Dados dos Pixels" (2.500 linhas) e "Imagem Reconstruida" (grade 50x50 pintada com cores RGB) |
| [pixel_data.csv](pixel_data.csv) | Dados brutos dos pixels em formato CSV |
| [reconstructed_image.png](reconstructed_image.png) | Imagem reconstruida a partir do CSV |
| [images/pacote-feijao.png](images/pacote-feijao.png) | Imagem original (alimento doado) |

---

## Como executar o codigo

```bash
cd src/Entrega1/backend/algebra-linear

pip install Pillow pandas numpy openpyxl

python3 main.py              # pipeline completo
python3 generate_excel.py    # gerar Excel a partir do CSV
```

Ou via notebook:

```bash
cd documentos/Entrega1/AlgebraLinear
jupyter notebook rgb_pixel_extraction.ipynb
```
