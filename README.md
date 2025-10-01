# Smart snorting

Intelligent automatic waste sorting system.

```
/cse_406
│── front/                     # App public : vite.js react typescript tailwind i18n 
│── back/                      # ?
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