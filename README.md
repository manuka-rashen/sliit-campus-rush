# SLIIT Campus Rush

A 3D campus endless runner by **Manuka Rashen**, using the architectural models from [The SLIIT UNI, in 3d](https://manuka-rashen.github.io/sliit-campus-explorer/).

**[Play Campus Rush](https://manuka-rashen.github.io/sliit-campus-rush/)**

Run along a terracotta campus route past the main academic block, Faculty of Computing, auditorium, both New building towers, Engineering, CAHM, and Business school. The original campus geometry is reused and rearranged around an endless game course.

## Play

- Left / Right or A / D: change lanes.
- Up / W / Space: jump orange barriers.
- Down / S: slide under blue signs. Press in the air to land faster.
- Dodge the tall crates; collect gold coins and cyan shields.
- P / Esc: pause or resume. Runs also pause when the tab is hidden.
- On touchscreens, swipe or use the four on-screen buttons.
- A shield absorbs one hit. The pace increases as you run. Best scores are saved only on your device. Sound is optional and starts muted.

## Develop

Node.js 22.13 or newer. Install with `npm install`, run with `npm run dev`, test game logic with `npm test`, and build with `npm run build`.

React, TypeScript, Three.js, Vite, and the existing Base UI button primitive. The game logic is separated from rendering so collision physics, pause, pickups, difficulty, and course generation can be tested deterministically.

GitHub Actions tests and builds the game, checks the generated Pages paths, and deploys `dist/`. In the repository's Pages settings, the publishing source is **GitHub Actions**.

## Credits

Campus interpretation, game, and project: **Manuka Rashen**. Campus geometry comes from the user's SLIIT campus explorer and supplied reference photos. SLIIT's logo belongs to its respective owner. This is an independent fan/student project, with an original character and game presentation; it is not an official SLIIT release or affiliated with Subway Surfers.
