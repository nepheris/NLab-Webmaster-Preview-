#!/usr/bin/env python3
import html
import json
import sys
from pathlib import Path

STATUS = {
    'validated': ('✓', 'Validé'),
    'reference': ('★', 'Référence'),
    'in_progress': ('◉', 'En cours'),
    'to_validate': ('◉', 'À valider'),
    'partial': ('◐', 'Partiel'),
    'planned': ('○', 'Prévu'),
    'issue': ('!', 'Problème'),
    'regression': ('!', 'Régression'),
    'rejected': ('×', 'Rejeté'),
    'historical': ('·', 'Historique'),
    'auto': ('⚙', 'Contrôle auto'),
    'unknown': ('?', 'Non documenté'),
}


def esc(value):
    return html.escape(str(value), quote=True)


def read_validated(path):
    rows = []
    for line in Path(path).read_text(encoding='utf-8').splitlines():
        if not line.strip():
            continue
        slot, review, date, sha, status = line.split('\t')
        rows.append({'slot': int(slot), 'review': int(review), 'date': date, 'sha': sha, 'status': status})
    return rows


def badge(status):
    icon, label = STATUS.get(status, ('?', status))
    return f'<span class="badge {esc(status)}">{esc(icon)} {esc(label)}</span>'


def point_row(point):
    status = point.get('status', 'unknown')
    icon, label = STATUS.get(status, ('?', status))
    return (
        f'<div class="point"><span class="badge {esc(status)}">{esc(icon)} {esc(label)}</span>'
        f'<span>{esc(point.get("name", "Point sans nom"))}</span></div>'
    )


def progress(points):
    if not points:
        return 0
    weights = {'validated': 1.0, 'reference': 1.0, 'auto': .8, 'partial': .5, 'to_validate': .35, 'in_progress': .35, 'planned': 0, 'issue': 0, 'regression': 0, 'rejected': 0, 'unknown': 0}
    return round(100 * sum(weights.get(p.get('status', 'unknown'), 0) for p in points) / len(points))


def main():
    if len(sys.argv) != 5:
        raise SystemExit('usage: build_preview.py validated.tsv reviews.json index.html output.json')
    validated_path, registry_path, index_path, output_json = sys.argv[1:]
    validated = read_validated(validated_path)
    registry = json.loads(Path(registry_path).read_text(encoding='utf-8'))
    metadata = {int(item['review']): item for item in registry.get('reviews', [])}

    filters = []
    cards = []
    exported = []
    for position, item in enumerate(validated):
        meta = metadata.get(item['review'], {})
        status = meta.get('status', item.get('status', 'historical'))
        label = meta.get('label') or f'Review V{item["review"]}'
        summary = meta.get('summary', '')
        points = meta.get('points', [])
        default_visible = bool(meta.get('default_visible', position == 0))
        pct = progress(points)
        checked = ' checked' if default_visible else ''
        filters.append(
            f'<label class="review-switch"><input type="checkbox" data-toggle-review value="{item["review"]}"{checked}>'
            f'<span>V{item["review"]}</span>{badge(status)}</label>'
        )
        points_html = ''.join(point_row(p) for p in points) or '<div class="point"><span class="badge unknown">? Non documenté</span><span>Aucun point détaillé.</span></div>'
        cards.append(f'''<article class="card" data-review-card="{item['review']}"{' hidden' if not default_visible else ''}>
          <div class="card-head">
            <div class="version-no">V{item['review']}</div>
            <div class="card-title"><h2>{esc(label)}</h2><div class="meta">{esc(item['date'])} · commit {esc(item['sha'][:8])}</div></div>
            {badge(status)}
          </div>
          <div class="card-body">
            <p class="summary">{esc(summary)}</p>
            <div class="meta">Avancement indicatif des points documentés : {pct}%</div>
            <div class="progress-line" aria-label="Avancement {pct}%"><span style="width:{pct}%"></span></div>
            <details class="points"><summary>Points validés / à valider ({len(points)})</summary><div class="points-list">{points_html}</div></details>
            <div class="checks">✓ Structure · ✓ DataWiz · ✓ QRWiz · ✓ JSON Studio · ✓ Theme Workshop · ✓ JS/imports</div>
            <div class="actions"><a href="reviews/review-{item['review']}/">Ouvrir la review</a><a class="secondary" href="https://github.com/nepheris/nLab-Web-Framework/tree/{esc(item['sha'])}/dev/framework">Voir la source</a></div>
          </div>
        </article>''')
        exported.append({**item, **{k: meta.get(k) for k in ('label', 'summary', 'points', 'default_visible')}, 'status': status})

    index = Path(index_path)
    text = index.read_text(encoding='utf-8')
    text = text.replace('<!-- REVIEW_FILTERS -->', '\n'.join(filters) if filters else '<span class="meta">Aucune review disponible.</span>')
    start = text.find('<!-- REVIEWS -->')
    if start < 0:
        raise SystemExit('REVIEWS marker missing')
    empty_start = text.find('<div class="empty">', start)
    empty_end = text.find('</div>', empty_start)
    if empty_start >= 0 and empty_end >= 0:
        text = text[:start] + '\n'.join(cards) + text[empty_end + len('</div>'):]
    else:
        text = text.replace('<!-- REVIEWS -->', '\n'.join(cards))
    index.write_text(text, encoding='utf-8')
    Path(output_json).write_text(json.dumps(exported, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
