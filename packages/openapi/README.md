# @uhuru/openapi

The HTTP contract between the Uhuru frontend (`apps/web`) and any backend
that implements it (`apps/api`, later `apps/api-dotnet`).

- `uhuru.yaml`: OpenAPI 3.1 spec, generated from `apps/api` by
  `apps/api/scripts/openapi.ts`
- `uhuru.d.ts`: TypeScript types generated from `uhuru.yaml` with
  `openapi-typescript`. The frontend uses them with `openapi-fetch`.

Both files are committed and generated. Don't edit them by hand. To regenerate
both after changing an API route, run this from the repo root:

```bash
bun run openapi
```

CI runs the same command and fails if the committed files are out of date.

Authentication (`/api/auth/*`) is not part of this spec. It's specified in
[`docs/auth-contract.md`](../../docs/auth-contract.md).
