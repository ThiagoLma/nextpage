# nextpage — Gerenciador de Projetos de Landing Pages

Um hub minimalista para organizar e acompanhar seus projetos de landing pages. Interface dark, tema violet, parallax suave, CRUD completo com persistência local.

## Stack

- **HTML5** semântico
- **CSS3** — Custom properties, Grid/Flex, animações, parallax via scroll
- **JavaScript Vanilla** — ES6+, localStorage, IntersectionObserver
- **Google Fonts: Inter** (weights 400–800)

## Estrutura

```
nextpage/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
├── assets/
│   ├── images/
│   └── icons/
└── README.md
```

## Funcionalidades

- **Dashboard** com estatísticas em tempo real (Total, Concluídos, Em andamento, Em revisão)
- **CRUD de projetos** — Adicionar, editar, excluir via modal
- **Persistência local** — `localStorage`, dados sobrevivem ao refresh
- **Busca e filtros** — Por nome/categoria/descrição + status
- **Parallax suave** no fundo (grid) ao rolar a página
- **Status minimalista** — Indicador quadrado colorido + label
- **Totalmente responsivo** (mobile-first)
- **Tema dark** com accent violet (`#a78bfa`)

## Como usar

```bash
# Servidor local simples
npx serve nextpage
# ou
python3 -m http.server 8000 -d nextpage
```

Abra `http://localhost:3000` (ou porta indicada).

## Dados

Os projetos são salvos no `localStorage` sob a chave `nextpage_projects_v1`. O arquivo `script.js` inclui 4 projetos de exemplo que são carregados na primeira execução.

## Deploy

Basta servir a pasta `nextpage/` como site estático (Netlify, Vercel, GitHub Pages, Cloudflare Pages, etc.).