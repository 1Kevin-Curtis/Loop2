# Loop production-ready GitHub package v3 visible

Verified in this package:

- Course setup uses dropdown selectors.
- Five courses are loaded from `src/courseData.js`.
- Main logo is available at `public/loop-logo.png` and rendered by `LogoMark`.
- Hole input tags are single-select per section.
- Review screen displays `Insight engine · Connected and running`.
- Welcome screen shows `Loop build v3 · course selector + insight engine` so you can confirm this version is live.

Build check run:

```bash
npm ci
npm run build
```
