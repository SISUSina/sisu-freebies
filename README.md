# SISU Freebies

Mini-Webseiten für interaktive Freebies aus Sinas LinkedIn-DM-Outreach.

**Live unter:** `frei.sisu-coaching.de`

## Projekte

- `stress-check/` — 2-Minuten-Stress-Check mit adaptiver 60-Sek-Übung. Editorial-Look, personalisierbar via URL-Parameter `?n=vorname`.

## Stack

- Reines HTML + CSS + Vanilla JS, **kein Framework**
- Self-hosted Fonts (DSGVO)
- Deploy auf Vercel (statisch)
- Keine Datenbank, keine Cookies, kein Tracking

## Lokal entwickeln

```bash
cd stress-check
python3 -m http.server 8000
# → http://localhost:8000?n=anna
```

## Brand

Tokens (Farben, Fonts) in `shared/brand-tokens.css`. Quelle: SISU Brand-Assets in [sisu-coaching-Vault](../sisu-coaching/vault/00_Foundation/brand-assets/farben.md).
