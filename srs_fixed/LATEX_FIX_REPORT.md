LATEX_FIX_REPORT.md

Scope
-----
This report documents the changes made to make the SRS LaTeX project compatible with Overleaf / standard TeX distributions, and provides instructions to compile the project and generate the final PDF.

Files inspected
---------------
- SRS.tex
- api_reference.tex
- architecture.tex
- usecases.tex
- api_reference.tex
- api_reference.tex (checked repeated)
- references.bib

Summary of issues found
-----------------------
1. Duplicate top-level section headings in included files (`api_reference.tex`, `architecture.tex`, `usecases.tex`). These caused duplicate section nesting when included by `SRS.tex` which defines section titles itself.
2. `architecture.tex` had a partially-empty itemize list due to earlier edits; restored the three-layer bullets.
3. The environment used to run the compilation in this workspace does not have LaTeX binaries (`pdflatex`, `latexmk`, `bibtex`), so I could not run an end-to-end compile here.
4. Bibliography entries use `\url{...}`; adding `\usepackage{url}` ensures compatibility in some TeX configurations (though `hyperref` often supplies `\url`).

Fixes applied
-------------
- `d:\canteen_test\api_reference.tex`: removed duplicate `\section{API Reference}` so that `SRS.tex` controls the section heading.
- `d:\canteen_test\architecture.tex`: removed top-level `\section{Architecture Overview}` and restored the three bullet items for the architecture layers to avoid duplication and missing content.
- `d:\canteen_test\usecases.tex`: removed duplicate `\section{Use Cases}` header so `SRS.tex` controls the section heading.
- `d:\canteen_test\SRS.tex`: added `\usepackage{url}` to preamble to support `\url` usage in `references.bib` entries.

Remaining manual steps (must be run locally or in an environment with LaTeX tools)
---------------------------------------------------------------------------------
1. Ensure a TeX distribution is installed (TeX Live or MiKTeX recommended).
2. Ensure `latexmk` and `bibtex` are available. If you prefer `biber`, migrate the bibliography to `biblatex`.
3. From the project root (`d:\canteen_test`) run one of the following sequences:

Recommended (latexmk):
```powershell
latexmk -pdf -interaction=nonstopmode SRS.tex
```

Manual (pdflatex + bibtex):
```powershell
pdflatex -interaction=nonstopmode SRS.tex
bibtex SRS
pdflatex -interaction=nonstopmode SRS.tex
pdflatex -interaction=nonstopmode SRS.tex
```

If Overleaf shows bibliography warnings or missing URLs, ensure `references.bib` is uploaded and that Overleaf runs `pdflatex`+`bibtex` automatically (Overleaf normally does this).

Packages required
-----------------
The following packages are required (usually included in standard TeX distributions):
- geometry
- hyperref
- url
- booktabs
- longtable
- tikz (pgf) and tikz library `positioning`
- graphicx
- enumitem
- titlesec
- bibtex (or biber if migrating to biblatex)
- latexmk (recommended)

Notes on Overleaf
-----------------
- Upload the entire project folder including `SRS.tex`, `api_reference.tex`, `architecture.tex`, `usecases.tex`, and `references.bib` to Overleaf. Make sure `SRS.tex` is the main file (set as the project main file in Overleaf).
- Overleaf runs the full TeX toolchain and will produce the PDF and log; if compilation fails there, copy the log and I can iterate further.

If you want, I can:
- Create a Dockerfile that installs TeX Live and runs `latexmk` to produce the PDF here (requires Docker availability), or
- Convert bibliography to `biblatex`+`biber` if you'd prefer `biber` features, or
- Run further cleanup of LaTeX warnings/labels and add figure/table floats with proper captions.

