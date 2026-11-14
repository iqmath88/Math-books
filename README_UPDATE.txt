# v1.30.0 — 3D scene activation fix

- Corrected the scene-to-3D bridge: renderer now emits mathbooks:scene-update with active scene and value.
- The 3D canvas uses direct event updates, not wrappers that depend on scene timing.
- Preserved the 2D view and existing lesson layout.
- Conical and square-base tank meshes retain the source lesson mathematical values.
- Built from the supplied v1.29.0 ZIP and retained one folder, flat files, under 100 files.

Known limitation: no interactive browser or iPad verification in this environment.
