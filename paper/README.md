# Pains & Gains / HelpPS Paper Artifacts

This folder contains the publication package for the current paper draft.

## Files

- `pains_gains_helpps_paper.tex` - LaTeX manuscript.
- `references.bib` - BibTeX reference library.
- `pains_gains_helpps_paper.pdf` - Generated PDF artifact.
- `pains_gains_helpps_paper.html` - Generated HTML used for the PDF when no TeX compiler is installed.
- `build-paper-pdf.mjs` - Local PDF renderer using Google Chrome headless.

## Compile With LaTeX

If TeX Live, MacTeX, or another LaTeX distribution is installed:

```bash
cd paper
pdflatex pains_gains_helpps_paper.tex
bibtex pains_gains_helpps_paper
pdflatex pains_gains_helpps_paper.tex
pdflatex pains_gains_helpps_paper.tex
```

The compiled output will be `pains_gains_helpps_paper.pdf`.

## Render PDF Without LaTeX

The current machine did not have `pdflatex`, `bibtex`, `tectonic`, or `pandoc` available. The included PDF can therefore be regenerated from `PUBLICATION_DRAFT.md` using Google Chrome:

```bash
node paper/build-paper-pdf.mjs
```

