# Loop insight engine

This package gives you a lightweight rules-based insight engine for the Loop prototype.

It turns hole-by-hole round data into:

- a round summary
- scoring metrics
- rolling trend metrics
- prioritised insights
- next-round rules
- practice recommendations
- updated advice history

## Files

- `loop-insight-engine.js` contains the engine
- `sample-round-data.js` contains realistic test data
- `integration-example.html` lets you test the output in a browser

## Data shape

Each round should contain a `holes` array:

```js
{
  id: 'round_001',
  date: '2026-05-08',
  courseName: 'Test Golf Club',
  holes: [
    {
      hole: 1,
      par: 4,
      score: 5,
      putts: 2,
      teeShot: 'miss_right',
      approach: 'short',
      penalties: 0,
      shortGame: 'missed_up_down'
    }
  ]
}
```

## Basic usage

```js
const result = LoopInsightEngine.generateRoundInsights({
  currentRound,
  previousRounds,
  adviceHistory
});

console.log(result.insights);
console.log(result.nextRoundRules);
```

## Recommended prototype integration

1. Save each completed round in local storage.
2. Pass the latest round as `currentRound`.
3. Pass older rounds as `previousRounds`.
4. Save `updatedAdviceHistory` back to local storage.
5. Render `roundSummary`, `insights`, `nextRoundRules` and `practicePlan` on the post-round screens.

## Local storage example

```js
const rounds = JSON.parse(localStorage.getItem('loopRounds') || '[]');
const adviceHistory = JSON.parse(localStorage.getItem('loopAdviceHistory') || '[]');
const currentRound = rounds[rounds.length - 1];
const previousRounds = rounds.slice(0, -1);

const result = LoopInsightEngine.generateRoundInsights({
  currentRound,
  previousRounds,
  adviceHistory
});

localStorage.setItem('loopAdviceHistory', JSON.stringify(result.updatedAdviceHistory));
```
