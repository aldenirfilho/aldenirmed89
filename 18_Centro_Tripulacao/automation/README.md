# Template inativo de newsletter

Esta pasta **não é** um workflow ativo. O arquivo YAML está propositalmente fora
de `.github/workflows`.

Execução de inspeção (não envia):

```bash
SUPABASE_URL="https://SEU-PROJETO.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="secret-do-servidor" \
SITE_URL="https://aldenirfilho.github.io/aldenirmed89/" \
NEWSLETTER_FROM="equipe@dominio-oficial.example" \
UNSUBSCRIBE_BASE_URL="https://api.dominio-oficial.example/unsubscribe" \
node ./send_daily_newsletter.mjs
```

Envio real exige adicionalmente:

- `--send`;
- `CONFIRM_NEWSLETTER_SEND=YES`;
- `EMAIL_PROVIDER_ENDPOINT`;
- `EMAIL_PROVIDER_ALLOWED_HOSTS`;
- `EMAIL_PROVIDER_API_KEY`;
- conteúdo editorial revisado em `NEWSLETTER_SUBJECT` e `NEWSLETTER_TEXT`.

Não ative cron antes de validar consentimento, cancelamento, idempotência,
limites do provedor, retorno de bounces e revisão humana.
