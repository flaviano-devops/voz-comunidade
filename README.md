# Voz Comunidade

Um prototipo em TypeScript inspirado na experiencia de comunidades do Amino, com uma unica comunidade universal nesta primeira fase.

## Rodando localmente

```bash
npm install
npm run dev
```

## Supabase

Crie um arquivo `.env.local` a partir do `.env.example`:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

No painel do Supabase, rode o SQL em `supabase/migrations/001_initial_schema.sql` para criar as tabelas iniciais.

## Escopo inicial

- Feed global com posts, tags, curtidas e salvos.
- Composer para publicar no feed.
- Chat global simples.
- Perfil inicial do usuario.
- Tema claro/escuro.

Comunidades separadas ficam fora deste MVP por enquanto.
