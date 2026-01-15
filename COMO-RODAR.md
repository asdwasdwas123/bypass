# Como Rodar o Projeto

## Opção 1: Usar pnpm (Recomendado)

```bash
pnpm run dev
```

Se o pnpm não estiver no PATH, use:
```bash
node node_modules\.bin\pnpm.cmd run dev
```

## Opção 2: Usar npm diretamente

O comando `npm run dev` deve funcionar porque os pacotes já estão instalados:

```bash
npm run dev
```

## Opção 3: Usar npx diretamente

```bash
npx cross-env NODE_ENV=development npx tsx watch server/_core/index.ts
```

## Opção 4: Usar os scripts wrapper

No Windows PowerShell:
```powershell
.\npm-run-dev.ps1
```

No Windows CMD:
```cmd
npm-run-dev.bat
```

---

## Nota Importante

Este projeto usa **pnpm** como gerenciador de pacotes. Se você precisar instalar dependências novamente, use:

```bash
pnpm install
```

Ou:

```bash
node node_modules\.bin\pnpm.cmd install
```

---

## Porta do Servidor

O servidor vai rodar em `http://localhost:3000/` (ou outra porta se a 3000 estiver ocupada).
