#!/usr/bin/env python3
"""Entrada compatível para a normalização convencional dos cartões clínicos.

Usa a mesma migração idempotente do integrador; não recria o banner HAA, não
altera o módulo e não regride a versão de cache do service worker.
"""
from __future__ import annotations

from insert_haa_home_block import main


if __name__ == "__main__":
    main()
