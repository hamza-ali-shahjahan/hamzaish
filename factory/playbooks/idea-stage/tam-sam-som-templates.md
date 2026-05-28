# TAM / SAM / SOM Templates

## The framework in one paragraph

**TAM** (Total Addressable Market) = the entire revenue opportunity if you captured 100% of every customer who could conceivably use your product. **SAM** (Serviceable Addressable Market) = the realistic subset given your geo, language, segment, and regulatory constraints. **SOM** (Serviceable Obtainable Market) = what you can realistically capture in 3 years given your team and resources. The numbers nest: TAM ⊃ SAM ⊃ SOM. They get smaller as you constrain.

## When to use it

- Pitching investors (they ask)
- Sanity-checking whether a market is big enough for a $100K-ARR product (yes for almost anything) or for a $100M-ARR product (much smaller subset)
- Deciding between two ideas — same effort, which is bigger?

## Three calculation methods (use ≥2, triangulate)

### Top-down
> Industry size × your % capture = market opportunity

Example: "The B2B SaaS market is $200B (Gartner). Legal tech is 2% of B2B SaaS = $4B TAM. If we capture 0.5% = $20M opportunity."

Pros: fast. Cons: anchored on someone else's category definition.

### Bottom-up
> # of potential customers × $ they'd pay

Example: "50,000 in-house legal teams in mid-market US companies × $5K/yr = $250M TAM."

Pros: more concrete. Cons: requires real estimate of customer count.

### Value theory
> Total value created by solving this problem × % captured

Example: "Each customer saves 200 hrs/yr × $150/hr = $30K/customer of value. Price at 15% capture = $4.5K. × 50K customers = $225M TAM."

Pros: ties price to value. Cons: assumes price reflects value (often doesn't).

## Templates

### TAM
```
[# of entities in the universe] × [revenue per entity if fully captured]
=
e.g. 1.2M SMBs in US × $1,200/yr = $1.44B TAM
```

### SAM
```
TAM × % serviceable
=
$1.44B × 40% (only US + only SMBs with 10+ employees) = $576M SAM
```

### SOM
```
SAM × % obtainable in 3 years
=
$576M × 0.5% = $2.88M SOM
```

For an indie/$100K-ARR product, your SOM only needs to be ~$1M (10x your target). For a VC-backable startup, SOM is more like $10M+ in 3 years.

## Source citations to use

- **Statista** (free abstracts; paid for full reports)
- **Gartner / Forrester / IDC** (public quotes in press releases)
- **Public 10-K filings** of comparable companies (very rich data)
- **IndieHackers / Microacquire** (real revenue from comparable indie products)
- **Industry association reports** (often free)
- **SimilarWeb / SemRush** (competitor traffic estimates → revenue inference)

## Common failure modes

- **Using TAM to justify the idea.** "$50B market" means nothing if your SOM is $50K. Focus on SOM.
- **Conflating TAM with WTP.** A $50B market with $0.10 ARPU = bad market.
- **Ignoring CAC.** A market is only big if you can affordably reach the customers in it.
- **Top-down only.** "1% of a giant number" is the classic VC anti-pattern.

## What good looks like

A defensible TAM/SAM/SOM has:
- 2+ source citations
- Both top-down and bottom-up methods triangulating
- A realistic 3-year SOM (typically 0.1% – 2% of SAM)
- A note on what would have to change for SOM to grow 10x

## Source for follow-up

- "How to Calculate TAM, SAM, and SOM" — multiple decent intros
- Anything by Andy Rachleff on market sizing
- *Crossing the Chasm* — Geoffrey Moore (on what's actually obtainable vs theoretical)
