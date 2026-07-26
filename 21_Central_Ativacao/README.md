# Central de Ativação e Próximas Etapas

Hub operacional público do Antigravity para transformar o roadmap em
microações curtas, verificáveis e separadas por responsabilidade.

## O que funciona

- leitura do plano versionado em `data/roadmap.json`;
- filtros `Agora`, `Depende de mim`, `Codex executa`, `Concluído` e `Tudo`;
- marcações locais, sem telemetria e sem efeito sobre o estado público;
- modo foco de 15 minutos;
- exportação e cópia de um retorno seguro contendo apenas IDs de tarefas;
- visualização aeroespacial escura e alternativa clara;
- falha fechada quando o roadmap está ausente ou inválido.

## O que esta página não faz

- não cria contas, banco, CAPTCHA, e-mail ou backend;
- não recebe nem armazena credenciais;
- não considera uma caixa marcada como prova de homologação;
- não publica mudanças automaticamente;
- não coleta dados de uso.

Nunca registre em JSON, chat, issue, commit ou formulário público uma senha,
`sb_secret_…`, `service_role`, token de e-mail, segredo de CAPTCHA, chave
privada ou string de conexão do banco.

## Contrato de conteúdo

O arquivo `data/roadmap.json` usa `schemaVersion: "1.0.0"` e é validado por:

```bash
python3 scripts_admin/validate_activation_roadmap.py \
  21_Central_Ativacao/data/roadmap.json
python3 -m unittest tests.test_activation_roadmap
```

O guia humano completo está em
[`docs_usuario/PROXIMAS_ETAPAS.md`](../docs_usuario/PROXIMAS_ETAPAS.md).
