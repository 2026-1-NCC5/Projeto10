# Liderancas Empaticas (LE) - Contagem Inteligente de Alimentos

<p align="center">
<strong>Classificacao e contagem automatizada de doacoes com Visao Computacional</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/Entrega-1_de_2-blue?style=for-the-badge" alt="Entrega">
  <img src="https://img.shields.io/badge/Semestre-5%C2%BA_CCOMP_2026-green?style=for-the-badge" alt="Semestre">
</p>

---

## FECAP - Fundacao de Comercio Alvares Penteado

<p align="center">
<a href="https://www.fecap.br/"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhZPrRa89Kma0ZZogxm0pi-tCn_TLKeHGVxywp-LXAFGR3B1DPouAJYHgKZGV0XTEf4AE&usqp=CAU" alt="FECAP - Fundacao de Comercio Alvares Penteado" border="25.0px"></a>
</p>

---

## Integrantes

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

Uma das dificuldades operacionais do LE e realizar a **contagem confiavel da arrecadacao por equipe arrecadadora e por tipo de alimento**. Este projeto resolve esse problema com uma solucao baseada em **Visao Computacional e IA** para identificar, classificar e contar pacotes de alimentos colocados em um ambiente controlado.

O sistema detecta **3 categorias**: Arroz, Feijao e Outros (acucar, cafe e demais itens), registrando automaticamente a contagem por equipe com timestamp e evidencia.

---

## Detalhes

### Objetivo Geral

Desenvolver uma solucao integrada (captura + Visao Computacional/IA + backend em nuvem + aplicativo web) para classificar e contar pacotes de alimentos arrecadados, registrando automaticamente a contagem por equipe e por categoria.

## Design

<p align="center">
<a href="https://www.figma.com/design/fqrwteBKVsEbU7G7tvzIYv/FECAP---Projeto?node-id=0-1&t=6BmbwT1k2KUhZBXj-1"><strong>Figma do Projeto</strong></a>
</p>

---

## Tecnologias

**Backend:** Python, FastAPI, Ultralytics YOLOv8, OpenCV, SQLAlchemy, Alembic, PostgreSQL, JWT, Pydantic, WebSocket

**Frontend:** React 19, TypeScript, Vite, MUI (Material UI), React Router DOM, Zod, Emotion

---

## Funcionalidades

- Deteccao e classificacao em tempo real de pacotes de alimentos (Arroz, Feijao, Outros)
- Contagem automatica com prevencao de duplicatas (estabilidade + cooldown)
- Sessoes de contagem com inicio/encerramento e resultado consolidado
- Stream via WebSocket para acompanhamento ao vivo
- Autenticacao com JWT (login, cadastro, selecao de papel)
- Interface web responsiva com dark theme e glass-morphism
- API RESTful para gerenciamento de sessoes e usuarios
- Backend de auth deployado em EC2 com PostgreSQL

---

## Estrutura de pastas

```
Projeto10/
├── documentos/
│   └── Entrega1/
│       ├── AlgebraLinear/                        # Representacao matricial de imagens
│       ├── IA-AprendizadoDeMaquina/              # Pipeline de treino YOLOv8
│       ├── ProjetoInterdisciplinarIA/            # Documento do PI
│       ├── PsicologiaLiderancaeSoftSkills/       # Entrega de Psicologia
│       └── SistemasOperacionaisEComputacaoEmNuvem/ # Config de ambiente cloud
│
├── src/
│   └── Entrega1/
│       ├── backend/
│       │   ├── main.py                           # Entry point FastAPI (camera)
│       │   ├── config.py                         # Config runtime
│       │   ├── requirements.txt
│       │   ├── webcam_demo.py                    # Demo visual standalone
│       │   ├── models/
│       │   │   └── best.pt                       # Modelo YOLOv8n treinado
│       │   ├── ml/
│       │   │   ├── model.py                      # Loader YOLO
│       │   │   └── inference.py                  # Deteccao com bboxes
│       │   ├── tracking/
│       │   │   ├── tracker.py                    # Centroid tracker
│       │   │   └── line_counter.py               # Contador por linha virtual
│       │   ├── services/
│       │   │   ├── webcam_service.py             # Loop de captura + contagem
│       │   │   └── session_manager.py            # Lifecycle de sessoes
│       │   ├── api/
│       │   │   ├── schemas.py                    # Pydantic models
│       │   │   └── routes/
│       │   │       ├── health.py                 # GET /api/health
│       │   │       └── sessions.py               # CRUD sessoes + WebSocket
│       │   ├── training/                         # Copia dos scripts de treino
│       │   └── backend-api/                      # Auth API (deploy independente)
│       │       ├── main.py                       # Entry point FastAPI (auth)
│       │       ├── config.py
│       │       ├── database.py                   # SQLAlchemy + PostgreSQL
│       │       ├── requirements.txt
│       │       ├── alembic.ini
│       │       ├── models/
│       │       │   └── user.py                   # Modelo de usuario
│       │       ├── services/
│       │       │   ├── auth_service.py           # JWT + bcrypt
│       │       │   └── user_service.py           # CRUD de usuarios
│       │       ├── api/
│       │       │   ├── schemas.py
│       │       │   ├── dependencies.py
│       │       │   └── routes/
│       │       │       ├── auth.py               # Login/signup
│       │       │       ├── health.py             # Status
│       │       │       └── users.py              # Gerenciamento de usuarios
│       │       └── migrations/                   # Alembic migrations
│       │
│       └── frontend/
│           ├── index.html
│           ├── package.json
│           ├── vite.config.ts
│           └── src/
│               ├── App.tsx
│               ├── main.tsx
│               ├── theme/                        # Paleta e tema MUI
│               ├── styles/                       # Estilos globais
│               ├── components/                   # Componentes reutilizaveis
│               │   ├── BackgroundGlow/
│               │   ├── BrandingHeader/
│               │   ├── GlassPanel/
│               │   ├── ProtectedRoute/
│               │   ├── RoleCard/
│               │   ├── SignupFlowRoute/
│               │   ├── StatusIndicator/
│               │   ├── StyledButton/
│               │   └── StyledInput/
│               ├── pages/                        # Paginas da aplicacao
│               │   ├── home/
│               │   ├── login/
│               │   ├── register/
│               │   └── select-role/
│               ├── contexts/                     # AuthContext (JWT)
│               ├── hooks/                        # useForm
│               ├── services/                     # api.ts (dois backends)
│               └── validation/                   # Schemas Zod
│
├── README.md
└── .gitignore
```

### Descricao dos diretorios

- **documentos/**: Documentacao academica do projeto, organizada por entrega e disciplina.
- **src/Entrega1/backend/**: Backend local que acessa a webcam, executa o modelo YOLOv8 e expoe a API de contagem (porta 8000).
- **src/Entrega1/backend/backend-api/**: Backend de autenticacao e persistencia com PostgreSQL, deployado em EC2 (porta 8001).
- **src/Entrega1/frontend/**: Interface web React + TypeScript + MUI com autenticacao e fluxo de sessao.

---

## Como rodar

### Pre-requisitos

- Python 3.10+
- Node.js 18+
- PostgreSQL (para o backend-api)
- Webcam (para deteccao em tempo real)

### Backend Camera (porta 8000)

```bash
cd src/Entrega1/backend
pip install -r requirements.txt
CAMERA_INDEX=1 python3 -m uvicorn main:app --reload --port 8000
```

### Backend Auth API (porta 8001)

```bash
cd src/Entrega1/backend/backend-api
pip install -r requirements.txt
JWT_SECRET=dev-secret python3 -m uvicorn main:app --reload --port 8001
```

### Frontend

```bash
cd src/Entrega1/frontend
npm install
npm run dev    # http://localhost:5173
```

### Demo visual (sem frontend)

```bash
cd src/Entrega1/backend
python3 webcam_demo.py 1    # 1 = indice da webcam externa
```

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
- [FastAPI](https://fastapi.tiangolo.com/) — Framework web Python
- [React](https://react.dev/) — Biblioteca de UI
- [MUI (Material UI)](https://mui.com/) — Componentes React
- [SQLAlchemy](https://www.sqlalchemy.org/) — ORM Python
- [PostgreSQL](https://www.postgresql.org/) — Banco de dados relacional
- [OpenCV](https://opencv.org/) — Visao computacional
- [Vite](https://vitejs.dev/) — Build tool frontend

---

<p align="center">
  <strong>Desenvolvido com dedicacao pelos alunos da FECAP</strong><br>
  Felipe Vallim Soares &bull; Guilhermy Garcia &bull; Gustavo Demetrio &bull; Saulo Pereira<br>
  <em>Projeto Interdisciplinar — 5CCOMP — 2026/1</em>
</p>
