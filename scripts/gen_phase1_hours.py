"""Generate slow.md (500h) and fast.md (420h) from temp.md with FE/BE hour columns."""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEMP = ROOT / "temp.md"
HEADER = "| 模組 | 功能分類 | 小功能 | FE | BE | 後台 | 串接 | Priority | Owner | Sprint | 備註 |"
NEW_HEADER = (
    "| 模組 | 功能分類 | 小功能 | FE | BE | 後台 | 串接 | Priority | Owner | Sprint | "
    "FE(h) | BE(h) | 小計(h) | 備註 |"
)
OLD_SEP = "|---|---|---|---|---|---|---|---|---|---|---|"
NEW_SEP = "|---|---|---|---|---|---|---|---|---|---|---|---|---|---|"

UNITS = 178  # 61 FE=Y + 117 BE=Y across all feature rows
SLOW_TOTAL = 500.0
FAST_TOTAL = 420.0
PER_SLOW = SLOW_TOTAL / UNITS
PER_FAST = FAST_TOTAL / UNITS
FE_SLOTS = 61
BE_SLOTS = 117


def fmt_h(x: float) -> str:
    return f"{x:.2f}"


def row_line(cells: list[str]) -> str:
    return "| " + " | ".join(cells) + " |"


def inject_section_totals(text: str) -> str:
    """After each feature table (NEW_HEADER + NEW_SEP + data rows), append a 本節小計 row."""
    lines = text.splitlines()
    out: list[str] = []
    i = 0
    n = len(lines)
    while i < n:
        line = lines[i]
        if line == NEW_HEADER and i + 1 < n and lines[i + 1] == NEW_SEP:
            out.append(line)
            out.append(lines[i + 1])
            i += 2
            sum_fe = 0.0
            sum_be = 0.0
            sum_tot = 0.0
            while i < n and lines[i].startswith("|"):
                inner = lines[i]
                parts = [p.strip() for p in inner.split("|")]
                is_feature = (
                    len(parts) >= 15
                    and parts[4] in ("Y", "N")
                    and parts[5] in ("Y", "N")
                )
                if is_feature:
                    try:
                        sum_fe += float(parts[11])
                        sum_be += float(parts[12])
                        sum_tot += float(parts[13])
                    except ValueError:
                        pass
                out.append(inner)
                i += 1
            tot_cells = [
                "**— 本節小計 —**",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                f"**{fmt_h(sum_fe)}**",
                f"**{fmt_h(sum_be)}**",
                f"**{fmt_h(sum_tot)}**",
                "",
            ]
            out.append(row_line(tot_cells))
            continue
        out.append(line)
        i += 1
    return "\n".join(out)


def verification_block(total: float) -> str:
    fe_theory = total * FE_SLOTS / UNITS
    be_theory = total * BE_SLOTS / UNITS
    return "\n".join(
        [
            "## 工時校核（理論合計）",
            "",
            "| 項目 | 小時 |",
            "|---|---|",
            f"| 全表 FE 權重（{FE_SLOTS}）× 單位工時 | **{fe_theory:.2f}** |",
            f"| 全表 BE 權重（{BE_SLOTS}）× 單位工時 | **{be_theory:.2f}** |",
            f"| **FE + BE** | **{total:.2f}** |",
            "",
            "",
        ]
    )


def process(text: str, per_unit: float, label: str, total: float) -> str:
    lines = text.splitlines()
    out: list[str] = []
    first = True
    for line in lines:
        if first and line.startswith("# "):
            out.append(line + f"（{label}）")
            first = False
            continue
        if line == HEADER:
            out.append(NEW_HEADER)
            continue
        if line == OLD_SEP and out and out[-1] == NEW_HEADER:
            out.append(NEW_SEP)
            continue
        if not line.startswith("|"):
            out.append(line)
            continue
        parts = [p.strip() for p in line.split("|")]
        if len(parts) < 12:
            out.append(line)
            continue
        mod = parts[1]
        if mod in ("模組", "欄位", "Sprint"):
            out.append(line)
            continue
        fe, be = parts[4], parts[5]
        if fe not in ("Y", "N") or be not in ("Y", "N"):
            out.append(line)
            continue
        fe_u = 1 if fe == "Y" else 0
        be_u = 1 if be == "Y" else 0
        if fe_u + be_u == 0:
            out.append(line)
            continue
        fe_h = fe_u * per_unit
        be_h = be_u * per_unit
        tot = fe_h + be_h
        cells = parts[1:11] + [fmt_h(fe_h), fmt_h(be_h), fmt_h(tot), parts[11]]
        out.append(row_line(cells))

    intro = (
        "\n> **{}**：全表 **FE(h) + BE(h) = {:.0f} 小時**（理論值；列表為四捨五入至小數 2 位）。"
        "估時規則：每列 `FE=Y` 或 `BE=Y` 各占 **1** 個工時權重（全表共 **{}** 個；FE **{}**、BE **{}**）。"
        "單位工時 = {:.0f} ÷ {} = **{:.4f} h**；該列 `FE(h)` / `BE(h)` 為是否 Y 乘以單位，`小計(h)` 為兩者之和。\n"
    ).format(label, total, UNITS, FE_SLOTS, BE_SLOTS, total, UNITS, per_unit)

    merged: list[str] = []
    inserted = False
    for i, line in enumerate(out):
        merged.append(line)
        if not inserted and line.strip() == "---" and i > 5:
            merged.append(intro.rstrip("\n"))
            inserted = True
    if not inserted:
        merged.insert(2, intro.rstrip("\n"))

    text_out = "\n".join(merged)
    extra_rows = (
        "| FE(h) | 該列若 FE=Y 則計 1 權重 × 單位工時，否則 0 |\n"
        "| BE(h) | 該列若 BE=Y 則計 1 權重 × 單位工時，否則 0 |\n"
        "| 小計(h) | FE(h) + BE(h) |"
    )
    text_out = text_out.replace(
        "| Sprint | 建議落點 |\n| 備註 | 規則 / 補充 |",
        "| Sprint | 建議落點 |\n" + extra_rows + "\n| 備註 | 規則 / 補充 |",
        1,
    )
    text_out = inject_section_totals(text_out)
    milestone = "# 建議的里程碑切法"
    if milestone in text_out:
        text_out = text_out.replace(milestone, verification_block(total) + milestone)
    else:
        text_out += "\n" + verification_block(total)

    return text_out + "\n"


def main() -> None:
    raw = TEMP.read_text(encoding="utf-8")
    (ROOT / "slow.md").write_text(process(raw, PER_SLOW, "慢速版 · 500h", SLOW_TOTAL), encoding="utf-8")
    (ROOT / "fast.md").write_text(process(raw, PER_FAST, "較快版 · 420h（slow × 0.84）", FAST_TOTAL), encoding="utf-8")
    print("Wrote slow.md, fast.md")


if __name__ == "__main__":
    main()
