"""Compatibilidade: o teste de navegador legado foi substituído por análise estática.

Este wrapper preserva o comando anterior. Não inicia Playwright nem Chromium.
Para fluxos reais, use a validação de navegador indicada em AUDITORIA-CLAUDE.md.
O teste original permanece no histórico Git.
"""
from pathlib import Path
import runpy
print('AVISO: interface.py executa somente o checker estático; não é teste de interface em navegador.')
runpy.run_path(str(Path(__file__).with_name('static_interface.py')), run_name='__main__')
