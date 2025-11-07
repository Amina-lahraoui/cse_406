## DermFridge AI

Proposal: This project presents an AI-powered personal assistant designed to connect nutrition and skincare through intelligent data analysis. By combining facial image recognition with food identification, the system determines the user’s skin type and analyzes the contents of their refrigerator to recommend personalized meals, snacks, and beverages that promote healthier skin. Beyond personalized dietary guidance, the application encourages users to make optimal use of their available ingredients, thus reducing food waste. Driven by the rise of personalized health technologies, the popularity of skincare beauty in South Korea, and the increasing accessibility of computer vision tools, this assistant bridges the gap between skincare and nutrition-focused applications. It supports both personal well-being and environmental sustainability by helping users understand the impact of dietary habits on their skin condition and guiding them toward smarter, skin-friendly food choices. Ultimately, the project aims to empower users to maintain healthy skin naturally while fostering more sustainable and informed eating practices.


| Name                     | Organization        | Email                                  |
|--------------------------|---------------------|----------------------------------------|
| Daniel Vaughn Kenneth    | Computer Science    | [vaughndanielsiburian@gmail.com)       |
| Amina Lahraoui           | Computer Science    | [aminalahraoui12@gmail.com)            |
| Leo Belarbi              | Computer Science    | [leomehdibelarbi@gmail.com)            |
| Shajnin Howlader         | Computer Science    | [Shajninhowlader@gmail.com)            |
| Henrik Lam               | Computer Science    | [henriklam5555@gmail.com)              |

```
/cse_406
│── front/                     # App public : vite.js react typescript tailwind i18n 
│── back/                      # API : FastAPI Python 
│── ai/.                       # Module AI 
│── doc/                       # Documentation 
│── docker-compose.dev.yml     # Environment development (hot reload)
│── docker-compose.dev.yml     # Environment production (optimized build)
```

## Run :

```bash
docker compose -f docker-compose.prod.yml up --build
docker compose -f docker-compose.dev.yml up --build # (data persistence and hot code reloading) 
```

## Git

```bash
# Branch structure:
main                # Main branch
develop             # Development branch
feature             # New features
bugfix              # Bug fixes
hotfix              # Urgent fixes in production

# Commit format: commit -m 'type: short description'
- feat: new feature
- fix: bug fix
- docs: documentation
- style: formatting, missing semicolons, etc.
- refactor: code refactoring
- test: addition/modification of tests
- chore: maintenance tasks

# Workflow:
1. Create a branch from `develop`
2. Develop the feature
3. Before PR, rebase on `develop`
4. Create a PR to `develop`
5. Code review required
6. Merge after validation

# Pre-commit checklist:
- [ ] Code is formatted
- [ ] Imports are organized
- [ ] All variable/function names are in English
- [ ] The front end is responsive, dark mode, and translated with intl
- [ ] No forgotten console.logs
```

## TypeScript
```
- Variables and functions: camelCase (always in English)
- Constants: UPPER_SNAKE_CASE (always in English)
- Components: PascalCase (always in English)
- Types and interfaces: PascalCase (always in English)
- Organization of imports: external, internal, types, then icons
- Favor ternary operators for readability
```

## Python 
[...]
