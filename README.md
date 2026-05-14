# Liderancas Empaticas (LE) - Contagem Inteligente de Alimentos

<p align="center">
  <strong>Projeto 10 &mdash; G2JF</strong>
</p>

<p align="center">
<strong>Classificacao e contagem automatizada de doacoes com Visao Computacional e OCR</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/Entrega-2_de_2-blue?style=for-the-badge" alt="Entrega">
  <img src="https://img.shields.io/badge/Semestre-5%C2%BA_CCOMP_2026-green?style=for-the-badge" alt="Semestre">
</p>

---

## Acesse o Projeto

<p align="center">
  <a href="https://project-10-rho-two.vercel.app/overview"><strong>Dashboard Publico (sem login)</strong></a>
  &nbsp;&nbsp;&bull;&nbsp;&nbsp;
  <a href="https://project-10-rho-two.vercel.app"><strong>Aplicacao Web Completa</strong></a>
</p>

> **Acesse o Dashboard Publico** para visualizar deteccoes registradas, graficos por categoria e historico de coletas sem precisar criar conta.
> Para explorar o fluxo completo, acesse a Aplicacao Web e crie uma conta.

| Recurso | URL |
|---------|-----|
| Dashboard Publico (sem login) | https://project-10-rho-two.vercel.app/overview |
| Aplicacao Web (login/cadastro) | https://project-10-rho-two.vercel.app |

---

## FECAP - Fundacao de Comercio Alvares Penteado

<p align="center">
<a href="https://www.fecap.br/"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhZPrRa89Kma0ZZogxm0pi-tCn_TLKeHGVxywp-LXAFGR3B1DPouAJYHgKZGV0XTEf4AE&usqp=CAU" alt="FECAP - Fundacao de Comercio Alvares Penteado" border="25.0px"></a>
</p>

---

## Integrantes — Projeto 10 (G2JF)

- Felipe Vallim Soares — RA: 24026060
- [Guilhermy Mariano Lisboa Garcia](https://www.linkedin.com/in/guilhermy-lisboa-garcia-385656223/) — RA: 23025371
- [Gustavo Oliveira Demetrio](https://www.linkedin.com/in/gustavo-demetrio-145151270/) — RA: 24026213
- [Saulo Pereira de Jesus](https://www.linkedin.com/in/saulo-pereira-jesus/) — RA: 24026095

---

## Professores Orientadores

- **Prof. [Marcos Minoru Nakatsugawa](https://www.linkedin.com/in/marcosminorunakatsugawa/)**
- **Prof. [Rafael Diogo Rossetti](https://www.linkedin.com/in/rafael-diogo-rossetti/)**
- **Prof. [Rodnil da Silva Moreira Lisboa](https://www.linkedin.com/in/professorrodnil/)**
- **Prof. [Rodrigo da Rosa](https://www.linkedin.com/in/rodrigo-da-rosa-phd/)**
- **Prof. [Victor Bruno Alexander Rosetti de Quiroz](https://www.linkedin.com/in/victorbarq/)**

---

## Descricao

O **Liderancas Empaticas (LE)** e uma iniciativa que une impacto social e educacao empreendedora. Por meio da arrecadacao de alimentos e recursos financeiros, alunos desenvolvem acoes praticas que aplicam conceitos de gestao, lideranca e organizacao.

Uma das dificuldades operacionais do LE e realizar a **contagem confiavel da arrecadacao por equipe arrecadadora e por tipo de alimento**. Este projeto resolve esse problema com uma solucao baseada em **Visao Computacional, IA e OCR** para identificar, classificar, pesar e contar pacotes de alimentos colocados em um ambiente controlado.

O sistema detecta **3 categorias** (Arroz, Feijao e Outros) e **5 sub-itens** (arroz, feijao, acucar, cafe, macarrao), registrando automaticamente a contagem por equipe com timestamp, peso estimado, valor monetario e evidencia fotografica no S3.

---

## Detalhes

### Objetivo Geral

Desenvolver uma solucao integrada (captura + Visao Computacional/IA + OCR + backend em nuvem + aplicativo web) para classificar, pesar e contar pacotes de alimentos arrecadados, registrando automaticamente a contagem por equipe e por categoria com evidencia auditavel.

## Design

<p align="center">
<a href="https://www.figma.com/design/fqrwteBKVsEbU7G7tvzIYv/FECAP---Projeto?node-id=0-1&t=6BmbwT1k2KUhZBXj-1"><strong>Figma do Projeto</strong></a>
</p>

---

## Tecnologias

**Backend:** Python, FastAPI, SQLAlchemy, Alembic, PostgreSQL, JWT, Pydantic, Boto3 (AWS S3)

**Camera AI (CLI local):** Python, Ultralytics YOLOv8, OpenCV, EasyOCR, SQLAlchemy

**Frontend:** React 19, TypeScript, Vite, MUI (Material UI), React Router DOM, Zod, Emotion

**Infra:** Render (backend + PostgreSQL), Vercel (frontend), Amazon S3 (evidencias fotograficas), EC2 (rota secundaria)

---

## Funcionalidades

- Deteccao em tempo real de pacotes de alimentos via YOLOv8n (5 sub-itens, 3 categorias)
- **Verificacao por OCR**: EasyOCR le rotulo da embalagem e sobrescreve classificacao/peso quando legivel
- Contagem por **janela deslizante com voto de maioria** (12 frames, 8 votos, confianca media >= 0.80)
- Prevencao de duplicatas com cooldown global (4s) e track ID
- **Estimativa de peso** por buckets de area da bbox (fallback) ou leitura direta do rotulo (preferencial via OCR)
- **Calculo de valor monetario** em tempo de escrita (peso x preco/kg por categoria)
- Upload assincrono de evidencia fotografica anotada para AWS S3 (thread daemon com retry 3x)
- Autenticacao com JWT (login, cadastro, selecao de papel)
- Gestao de **equipes** com convites, membros e papeis (operador, administrador, espectador)
- Dashboards: privado (com filtros e evidencias) e publico (sem login)
- Ranking competitivo entre equipes por volume e valor coletado
- Painel administrativo para gestao global de usuarios
- Comparacao lado-a-lado entre coletas manuais e automaticas
- Interface web responsiva com dark theme e glass-morphism
- API RESTful para gerenciamento de equipes, coletas, deteccoes e usuarios
- Backend deployado no Render com PostgreSQL gerenciado

---

## Estrutura de pastas

```
Projeto10/
├── documentos/
│   ├── Entrega1/                                # Documentacao da Entrega 1 (congelada)
│   └── Entrega2/
│       ├── IA-AprendizadoDeMaquina/             # Notebook food_classifier.ipynb
│       ├── ProjetoInterdisciplinarIA/           # Documento do PI
│       ├── PsicologiaLiderancaeSoftSkills/      # Entrega de Psicologia
│       └── SistemasOperacionaisEComputacaoEmNuvem/
│
├── src/
│   ├── Entrega1/                                # Codigo da Entrega 1 (congelado)
│   └── Entrega2/
│       ├── backend/                             # API unificada FastAPI (porta 8001)
│       │   ├── main.py                          # Entry point — registra todos os routers
│       │   ├── config.py                        # DATABASE_URL, JWT_SECRET, CORS_ORIGINS, S3_*
│       │   ├── database.py                      # SQLAlchemy engine + SessionLocal + Base
│       │   ├── requirements.txt
│       │   ├── alembic.ini
│       │   ├── models/
│       │   │   ├── user.py
│       │   │   ├── team.py
│       │   │   ├── invitation.py
│       │   │   └── ai_detection.py
│       │   ├── api/routes/
│       │   │   ├── auth.py                      # Login/cadastro JWT
│       │   │   ├── users.py                     # Gestao de usuarios e papeis
│       │   │   ├── teams.py                     # Equipes, membros, convites
│       │   │   ├── collections.py               # Lotes manuais e historico
│       │   │   ├── ai_detections.py             # Deteccoes da IA + presigned URLs S3
│       │   │   ├── dashboard.py                 # Dados agregados privados
│       │   │   ├── public_dashboard.py          # Dashboard publico sem login
│       │   │   ├── ranking.py                   # Ranking entre equipes
│       │   │   └── health.py                    # Status do servidor e banco
│       │   ├── services/
│       │   │   ├── auth_service.py              # JWT + bcrypt
│       │   │   ├── user_service.py
│       │   │   ├── team_service.py
│       │   │   ├── collection_service.py
│       │   │   ├── ai_detection_service.py
│       │   │   ├── dashboard_service.py
│       │   │   ├── public_dashboard_service.py
│       │   │   ├── ranking_service.py
│       │   │   └── s3_service.py                # Geracao de URLs presignadas
│       │   ├── migrations/                      # Alembic (ultima: f1a2b3c4d5e6_add_ai_detections)
│       │   └── camera-ai/                       # CLI standalone — NAO e FastAPI
│       │       ├── main.py                      # Menu interativo: seleciona equipe e roda captura
│       │       ├── config.py                    # MODEL_PATH, CAMERA_INDEX, STABILITY_*, S3_*
│       │       ├── requirements.txt             # inclui easyocr
│       │       ├── ml/
│       │       │   ├── model.py                 # Loader YOLOv8
│       │       │   ├── inference.py             # Deteccao com bboxes
│       │       │   └── ocr.py                   # EasyOCR — le peso e produto do rotulo
│       │       ├── tracking/
│       │       │   ├── tracker.py               # Centroid tracker com IDs estaveis
│       │       │   └── line_counter.py          # (legado, nao utilizado no fluxo atual)
│       │       ├── services/
│       │       │   ├── capture_service.py       # Loop webcam + janela de votacao
│       │       │   ├── detection_writer.py      # Insert sincrono em ai_detections
│       │       │   └── s3_uploader.py           # Upload assincrono S3 (thread + queue)
│       │       ├── training/                    # Pipeline YOLOv8 (generate_dataset, train, eval)
│       │       └── models/best.pt               # Modelo treinado
│       │
│       └── frontend/
│           ├── index.html
│           ├── package.json
│           ├── vite.config.ts
│           └── src/
│               ├── App.tsx
│               ├── main.tsx
│               ├── theme/                       # Paleta e tema MUI
│               ├── styles/                      # Estilos globais
│               ├── components/                  # Componentes reutilizaveis
│               │   ├── AppLayout/
│               │   ├── BackgroundGlow/
│               │   ├── BrandingHeader/
│               │   ├── CollectionBlock/
│               │   ├── CollectionHistory/
│               │   ├── ErrorBoundary/
│               │   ├── EvidenceModal/           # Modal de evidencia S3
│               │   ├── GlassPanel/
│               │   ├── MetricCard/
│               │   ├── NoTeamBanner/
│               │   ├── ProtectedRoute/
│               │   ├── RoleCard/
│               │   ├── Sidebar/
│               │   ├── SignupFlowRoute/
│               │   ├── StatusIndicator/
│               │   ├── StyledButton/
│               │   ├── StyledInput/
│               │   ├── TeamEditorModal/
│               │   └── TeamTabs/
│               ├── pages/
│               │   ├── admin/                   # Painel administrativo global
│               │   ├── dashboard/               # Dashboard privado com filtros
│               │   ├── home/                    # Tela principal pos-login
│               │   ├── login/
│               │   ├── publicDashboard/         # /overview — sem login
│               │   ├── ranking/                 # Ranking entre equipes
│               │   ├── register/
│               │   ├── select-role/             # Selecao de papel pos-cadastro
│               │   └── teams/                   # Gestao de equipes
│               ├── contexts/                    # AuthContext (JWT)
│               ├── hooks/                       # useForm e helpers
│               ├── services/                    # api.ts + teamDraft.ts
│               └── validation/                  # Schemas Zod
│
├── README.md
└── .gitignore
```

### Descricao dos diretorios

- **documentos/**: Documentacao academica do projeto, organizada por entrega e disciplina.
- **src/Entrega2/backend/**: Backend unificado FastAPI (porta 8001) — autenticacao, equipes, coletas, deteccoes IA, dashboards, ranking. Hospedado no Render com PostgreSQL gerenciado.
- **src/Entrega2/backend/camera-ai/**: CLI Python que roda LOCALMENTE na maquina do operador. Executa YOLOv8 + EasyOCR sobre a webcam e escreve diretamente no Postgres do backend. Sobe evidencias para S3 de forma assincrona.
- **src/Entrega2/frontend/**: Interface web React + TypeScript + MUI hospedada na Vercel. Comunica-se exclusivamente com o backend via API REST.

---

## Arquitetura

```
┌─────────────────────┐         ┌───────────────────────────┐
│   Frontend Web      │ ──REST──▶  Backend FastAPI          │
│   (Vercel)          │ ◀────────  (Render, porta 8001)     │
└─────────────────────┘         └──────────┬────────────────┘
                                           │
                                           ▼
┌─────────────────────┐         ┌───────────────────────────┐
│   camera-ai (CLI)   │ ──SQL──▶  PostgreSQL (Render)       │
│   webcam + YOLO+OCR │         │  schema unificado         │
│   (maquina local)   │         └───────────────────────────┘
└──────────┬──────────┘
           │ upload assincrono
           ▼
┌─────────────────────┐
│   Amazon S3         │   ◀── Frontend pede URL presignada
│   us-east-1         │       ao backend para exibir foto
└─────────────────────┘
```

- **Frontend e backend** se comunicam exclusivamente por HTTP/REST.
- **camera-ai e backend** compartilham o mesmo banco PostgreSQL — a IA escreve direto em `ai_detections`, sem hop intermediario.
- **Evidencias fotograficas** ficam no S3; o backend gera URLs presignadas sob demanda para o frontend exibir.
- Rota secundaria de deploy: AWS EC2 (caso o Render apresente indisponibilidade).

---

## Como rodar

### Pre-requisitos

- Python 3.10+
- Node.js 18+
- PostgreSQL (local ou Render)
- Webcam (para camera-ai)
- Credenciais AWS S3 (opcional, controlado por `S3_ENABLED`)

### Backend unificado (porta 8001)

```bash
cd src/Entrega2/backend
pip install -r requirements.txt
alembic upgrade head
JWT_SECRET=dev-secret python3 -m uvicorn main:app --reload --port 8001
```

### Frontend

```bash
cd src/Entrega2/frontend
npm install
npm run dev    # http://localhost:5173
```

### Camera AI (CLI interativo, executa LOCALMENTE)

```bash
cd src/Entrega2/backend/camera-ai
pip install -r requirements.txt
python3 main.py    # menu interativo: seleciona equipe e inicia loop de deteccao
```

A primeira execucao baixa automaticamente os modelos do EasyOCR (~64MB). Pressione `q` na janela OpenCV ou `Ctrl+C` no terminal para encerrar.

### Variaveis de ambiente principais

**Backend (`src/Entrega2/backend/.env`):**
- `JWT_SECRET` — obrigatorio
- `DATABASE_URL` — DSN do Postgres
- `CORS_ORIGINS` — default `http://localhost:3000,http://localhost:5173`
- `S3_ENABLED`, `S3_BUCKET`, `S3_REGION` — para presigned URLs

**Camera AI (`src/Entrega2/backend/camera-ai/.env`):**
- `DATABASE_URL` — mesmo Postgres do backend
- `CAMERA_INDEX` — default 1 (webcam externa)
- `MODEL_PATH` — default `models/best.pt`
- `CONFIDENCE_THRESHOLD`, `STABILITY_WINDOW`, `STABILITY_MAJORITY`, `STABILITY_MEAN_CONFIDENCE`, `RECOUNT_COOLDOWN_S`
- `S3_ENABLED`, `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`

**Frontend (`src/Entrega2/frontend/.env`):**
- `VITE_API_URL` — URL do backend

---

## Modelo de IA

- **Arquitetura**: YOLOv8n (nano, ~6MB, ~55ms/frame em CPU)
- **Classes**: arroz, feijao, acucar, cafe, macarrao (mapeadas para 3 categorias na API)
- **Dataset**: 88 imagens base expandidas com augmentation (10x — rotacao, flip, brilho, blur, ruido, zoom)
- **Metricas**: mAP50 = 0.995, Precision = 0.988, Recall = 0.999
- **Verificacao OCR**: EasyOCR (pt+en) roda no recorte da bbox no momento da contagem; quando consegue ler peso (regex `kg/g/quilo`) ou produto (regex de keywords), **sobrescreve** o palpite do YOLO

### Pipeline de contagem

1. YOLO detecta objetos no frame
2. CentroidTracker atribui IDs estaveis por proximidade entre frames
3. Cada track mantem janela deslizante de 12 frames com `(label, confianca, area_relativa)`
4. Contagem dispara quando: janela cheia + 8 de 12 votos para a mesma classe + confianca media >= 0.80
5. Cooldown global de 4s previne recontagem do mesmo item fisico
6. OCR roda no recorte da bbox → corrige label e/ou peso se rotulo for legivel
7. Insert sincrono em `ai_detections` (Postgres) + upload assincrono do frame anotado para S3

---

## Licenca

Este projeto foi desenvolvido como parte do **Projeto Interdisciplinar** da [FECAP - Fundacao de Comercio Alvares Penteado](https://www.fecap.br/).

Projeto de uso academico. 
<p xmlns:cc="http://creativecommons.org/ns#" xmlns:dct="http://purl.org/dc/terms/">
  <a property="dct:title" rel="cc:attributionURL" href="https://github.com/2026-1-NCC5/Projeto10">Lideranças Empáticas PI</a> 
  by <span property="cc:attributionName">Gustavo Demetrio, Felipe Soares, Guilhermy Mariano, Saulo Pereira,</span> 
  is licensed under 
  <a href="https://creativecommons.org/licenses/by-nc/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style="display:inline-block;">
    CC BY-NC 4.0
    <img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1" alt="">
    <img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1" alt="">
    <img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/nc.svg?ref=chooser-v1" alt="">
  </a>
</p>

---

## Referencias

### Professores

- [Marcos Minoru Nakatsugawa](https://www.linkedin.com/in/marcosminorunakatsugawa/)
- [Victor Bruno Alexander Rosetti de Quiroz](https://www.linkedin.com/in/victorbarq/)
- [Rodrigo da Rosa](https://www.linkedin.com/in/rodrigo-da-rosa-phd/)
- [Rodnil da Silva Moreira Lisboa](https://www.linkedin.com/in/professorrodnil/)
- [Rafael Diogo Rossetti](https://www.linkedin.com/in/rafael-diogo-rossetti/)

### Documentacao Tecnica

- [Ultralytics YOLOv8](https://docs.ultralytics.com/) — Modelo de deteccao de objetos
- [EasyOCR](https://github.com/JaidedAI/EasyOCR) — OCR multi-idioma em Python puro
- [FastAPI](https://fastapi.tiangolo.com/) — Framework web Python
- [React](https://react.dev/) — Biblioteca de UI
- [MUI (Material UI)](https://mui.com/) — Componentes React
- [SQLAlchemy](https://www.sqlalchemy.org/) — ORM Python
- [Alembic](https://alembic.sqlalchemy.org/) — Migrations de banco
- [PostgreSQL](https://www.postgresql.org/) — Banco de dados relacional
- [OpenCV](https://opencv.org/) — Visao computacional
- [Boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html) — SDK AWS para Python
- [Vite](https://vitejs.dev/) — Build tool frontend
- [Render](https://render.com/) — Hospedagem do backend e PostgreSQL
- [Amazon S3](https://aws.amazon.com/s3/) — Armazenamento de evidencias fotograficas

---

<p align="center">
  <strong>Desenvolvido com dedicacao pelos alunos da FECAP</strong><br>
  Felipe Vallim Soares &bull; Guilhermy Garcia &bull; Gustavo Demetrio &bull; Saulo Pereira<br>
  <em>Projeto Interdisciplinar — 5CCOMP — 2026/1</em>
</p>
