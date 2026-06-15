#!/usr/bin/env python3
"""Gera supabase/seed.sql a partir de data/sections.csv e data/stickers.csv.

Uso:  python3 data/csv_to_seed.py
Saída: supabase/seed.sql (idempotente — usa upsert via ON CONFLICT).
"""
import csv
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
OUT = ROOT / "supabase" / "seed.sql"


# colunas numéricas/booleanas → literal sem aspas
RAW_COLS = {"position", "n", "tradeable"}


def q(value: str, col: str) -> str:
    """Literal SQL: NULL se vazio; número/bool cru; senão string escapada."""
    if value is None or value == "":
        return "NULL"
    if col in RAW_COLS:
        return value
    return "'" + value.replace("'", "''") + "'"


def read(name: str) -> tuple[list[str], list[list[str]]]:
    with (DATA / name).open(encoding="utf-8") as f:
        rows = [r for r in csv.reader(f, delimiter=";") if r]
    return rows[0], rows[1:]


def insert(table: str, cols: list[str], rows: list[list[str]], conflict: str) -> str:
    header = f"insert into public.{table} ({', '.join(cols)}) values"
    values = ",\n".join(
        "  (" + ", ".join(q(v, c) for v, c in zip(row, cols)) + ")" for row in rows
    )
    sets = ", ".join(f"{c} = excluded.{c}" for c in cols if c != conflict)
    return f"{header}\n{values}\non conflict ({conflict}) do update set {sets};\n"


def main() -> None:
    sec_cols, sec_rows = read("sections.csv")
    stk_cols, stk_rows = read("stickers.csv")

    parts = [
        "-- ============================================================================",
        "-- Trocaê — seed do catálogo (GERADO por data/csv_to_seed.py — não editar à mão)",
        f"-- {len(sec_rows)} seções + {len(stk_rows)} cromos. Rodar DEPOIS de schema.sql.",
        "-- ============================================================================",
        "",
        insert("sections", sec_cols, sec_rows, "code"),
        insert("stickers", stk_cols, stk_rows, "code"),
    ]
    OUT.write_text("\n".join(parts), encoding="utf-8")
    print(f"OK: {OUT.relative_to(ROOT)} — {len(sec_rows)} seções, {len(stk_rows)} cromos")


if __name__ == "__main__":
    main()
