/*
  Loop Insight Engine
  MVP rules-based logic for turning hole-by-hole round data into dynamic golf insights.

  How to use:
    const result = LoopInsightEngine.generateRoundInsights({
      currentRound,
      previousRounds,
      adviceHistory
    });

  Exports:
    - Browser: window.LoopInsightEngine
    - Node/Vite/React: module.exports where available
*/

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.LoopInsightEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const LOOKBACK_ROUNDS = 10;

  const CATEGORY_LABELS = {
    tee: 'Tee shots',
    approach: 'Approach play',
    shortGame: 'Short game',
    putting: 'Putting',
    penalties: 'Penalty shots',
    scoring: 'Scoring control',
    recovery: 'Recovery shots',
    positive: 'Positive pattern'
  };

  const PRACTICE_PLANS = {
    three_putts: {
      title: 'Lag putting ladder',
      duration: '15 minutes',
      blocks: [
        'Hit 5 putts each to 20, 30 and 40 feet. The goal is to finish inside a club length.',
        'Repeat the same drill uphill and downhill if the green allows it.',
        'Finish with 10 putts from 3 to 6 feet. Do not leave until you hole 7.'
      ]
    },
    short_putts: {
      title: 'Short putt gate',
      duration: '10 minutes',
      blocks: [
        'Set two tees just wider than your putter head, 3 feet from the hole.',
        'Hole 10 putts through the gate before moving back to 5 feet.',
        'Keep your routine identical on every putt.'
      ]
    },
    penalties: {
      title: 'Safe tee shot rehearsal',
      duration: '12 minutes',
      blocks: [
        'Pick a fairway-width target and hit 10 balls with your safest tee club.',
        'Score each ball as in play or in trouble. Your target is 7 in play.',
        'Before your next round, choose the safe club on holes where out of bounds or water is in play.'
      ]
    },
    miss_left: {
      title: 'Start line control',
      duration: '15 minutes',
      blocks: [
        'Pick a clear intermediate target 2 feet in front of the ball.',
        'Hit 10 tee shots focused only on starting the ball on that line.',
        'Use the same target routine on the first tee next round.'
      ]
    },
    miss_right: {
      title: 'Commitment tee routine',
      duration: '15 minutes',
      blocks: [
        'Pick one target and one shape before each tee shot.',
        'Hit 10 balls where the only goal is a committed finish, not distance.',
        'Use this on tight holes rather than trying to guide the ball.'
      ]
    },
    approach_short: {
      title: 'Club-up approach check',
      duration: '15 minutes',
      blocks: [
        'Hit 12 approach shots where you deliberately take one more club than instinct suggests.',
        'Track whether the miss finishes pin high, short or long.',
        'Next round, club for the back half of the green when there is no danger long.'
      ]
    },
    blow_ups: {
      title: 'Bogey reset rule',
      duration: 'On-course focus',
      blocks: [
        'After a bad shot, choose the shot that removes double bogey rather than chasing par.',
        'Aim for the widest safe area, even if it leaves a longer next shot.',
        'Judge success by avoiding doubles, not by saving heroic pars.'
      ]
    },
    par3_scoring: {
      title: 'Par 3 centre-green rule',
      duration: 'On-course focus',
      blocks: [
        'Choose club based on the middle of the green, not the flag.',
        'Avoid the short-side miss even if it means a longer putt.',
        'Accept par as a strong result and remove double bogey from play.'
      ]
    },
    good_driving: {
      title: 'Keep your tee routine',
      duration: 'Before next round',
      blocks: [
        'Write down the tee routine that worked today.',
        'Use it on the first three driving holes next round.',
        'Do not change club choice unless the hole clearly demands it.'
      ]
    },
    good_putting: {
      title: 'Protect the putting rhythm',
      duration: 'Before next round',
      blocks: [
        'Spend 5 minutes on pace before holing short putts.',
        'Use the same read, feel, roll routine that worked today.',
        'Keep the goal simple: no three-putts in the first six holes.'
      ]
    }
  };

  function generateRoundInsights({ currentRound, previousRounds = [], adviceHistory = [] }) {
    if (!currentRound || !Array.isArray(currentRound.holes)) {
      throw new Error('currentRound with a holes array is required.');
    }

    const rounds = [...previousRounds, currentRound].filter(Boolean).slice(-LOOKBACK_ROUNDS);
    const currentMetrics = calculateRoundMetrics(currentRound);
    const rollingMetrics = calculateRollingMetrics(rounds);
    const candidates = buildInsightCandidates(currentRound, previousRounds, currentMetrics, rollingMetrics);
    const scored = candidates
      .map((candidate) => scoreInsight(candidate, adviceHistory))
      .filter((candidate) => candidate.score >= 45)
      .sort((a, b) => b.score - a.score);

    const selected = selectBalancedInsights(scored, adviceHistory, 3);
    const insights = selected.map((candidate) => formatInsight(candidate, adviceHistory));

    return {
      roundSummary: buildRoundSummary(currentRound, currentMetrics, rollingMetrics),
      metrics: currentMetrics,
      rollingMetrics,
      insights,
      nextRoundRules: buildNextRoundRules(insights),
      updatedAdviceHistory: updateAdviceHistory(adviceHistory, insights, currentRound)
    };
  }

  function calculateRoundMetrics(round) {
    const holes = round.holes || [];
    const totalScore = sum(holes.map((h) => number(h.score)));
    const totalPar = sum(holes.map((h) => number(h.par)));
    const putts = sum(holes.map((h) => number(h.putts)));
    const threePutts = holes.filter((h) => number(h.putts) >= 3).length;
    const onePutts = holes.filter((h) => number(h.putts) === 1).length;
    const penalties = sum(holes.map((h) => number(h.penalties || (h.penalty ? 1 : 0))));
    const doublesOrWorse = holes.filter((h) => number(h.score) - number(h.par) >= 2).length;
    const parsOrBetter = holes.filter((h) => number(h.score) <= number(h.par)).length;
    const fairwayMissLeft = holes.filter((h) => normalise(h.teeShot) === 'miss_left').length;
    const fairwayMissRight = holes.filter((h) => normalise(h.teeShot) === 'miss_right').length;
    const teeInPlay = holes.filter((h) => ['fairway', 'in_play', 'good', 'safe'].includes(normalise(h.teeShot))).length;
    const approachShort = holes.filter((h) => normalise(h.approach) === 'short').length;
    const approachLong = holes.filter((h) => normalise(h.approach) === 'long').length;
    const missedUpDown = holes.filter((h) => normalise(h.shortGame) === 'missed_up_down').length;
    const par3OverPar = holes.filter((h) => number(h.par) === 3 && number(h.score) > number(h.par)).length;
    const backNineScore = sum(holes.filter((h) => number(h.hole) >= 10).map((h) => number(h.score - h.par)));
    const frontNineScore = sum(holes.filter((h) => number(h.hole) <= 9).map((h) => number(h.score - h.par)));

    return {
      totalScore,
      totalPar,
      scoreToPar: totalScore - totalPar,
      putts,
      threePutts,
      onePutts,
      penalties,
      doublesOrWorse,
      parsOrBetter,
      fairwayMissLeft,
      fairwayMissRight,
      teeInPlay,
      approachShort,
      approachLong,
      missedUpDown,
      par3OverPar,
      frontNineScore,
      backNineScore,
      holesPlayed: holes.length
    };
  }

  function calculateRollingMetrics(rounds) {
    const metrics = rounds.map(calculateRoundMetrics);
    const last3 = metrics.slice(-3);
    const last5 = metrics.slice(-5);
    return {
      roundsCount: metrics.length,
      last3: averageMetrics(last3),
      last5: averageMetrics(last5),
      last10: averageMetrics(metrics),
      trend: {
        threePutts: trendDirection(metrics.map((m) => m.threePutts)),
        penalties: trendDirection(metrics.map((m) => m.penalties)),
        doublesOrWorse: trendDirection(metrics.map((m) => m.doublesOrWorse)),
        scoreToPar: trendDirection(metrics.map((m) => m.scoreToPar)),
        approachShort: trendDirection(metrics.map((m) => m.approachShort))
      }
    };
  }

  function buildInsightCandidates(currentRound, previousRounds, current, rolling) {
    const recentRounds = previousRounds.slice(-5);
    const recentMetrics = recentRounds.map(calculateRoundMetrics);
    const candidates = [];

    if (current.threePutts >= 2 || rolling.last5.threePutts >= 2) {
      candidates.push(makeCandidate('three_putts', 'putting', current.threePutts, rolling.last5.threePutts, {
        observation: `You had ${current.threePutts} three-putt${plural(current.threePutts)} today.`,
        meaning: current.threePutts >= rolling.last5.threePutts
          ? 'That points to distance control costing shots, especially when the first putt is long.'
          : 'This is still worth watching because it has appeared in your recent rounds.',
        actionKey: 'three_putts',
        severity: current.threePutts >= 4 ? 5 : 4,
        frequency: countWhere(recentMetrics, (m) => m.threePutts >= 2) + (current.threePutts >= 2 ? 1 : 0),
        trend: rolling.trend.threePutts
      }));
    }

    if (current.penalties >= 2 || rolling.last5.penalties >= 1.5) {
      candidates.push(makeCandidate('penalties', 'penalties', current.penalties, rolling.last5.penalties, {
        observation: `Penalty shots showed up ${current.penalties} time${plural(current.penalties)} today.`,
        meaning: 'For a mid-handicap golfer, removing penalties is often the quickest way to protect the scorecard.',
        actionKey: 'penalties',
        severity: current.penalties >= 3 ? 5 : 4,
        frequency: countWhere(recentMetrics, (m) => m.penalties >= 1) + (current.penalties >= 1 ? 1 : 0),
        trend: rolling.trend.penalties
      }));
    }

    if (current.doublesOrWorse >= 3 || rolling.last5.doublesOrWorse >= 2.5) {
      candidates.push(makeCandidate('blow_ups', 'scoring', current.doublesOrWorse, rolling.last5.doublesOrWorse, {
        observation: `${current.doublesOrWorse} hole${plural(current.doublesOrWorse)} got away from you today.`,
        meaning: 'The scoring opportunity is not about chasing more birdies. It is about turning doubles into bogeys.',
        actionKey: 'blow_ups',
        severity: current.doublesOrWorse >= 4 ? 5 : 4,
        frequency: countWhere(recentMetrics, (m) => m.doublesOrWorse >= 2) + (current.doublesOrWorse >= 2 ? 1 : 0),
        trend: rolling.trend.doublesOrWorse
      }));
    }

    if (current.approachShort >= 4 || rolling.last5.approachShort >= 3.5) {
      candidates.push(makeCandidate('approach_short', 'approach', current.approachShort, rolling.last5.approachShort, {
        observation: `Approaches finished short ${current.approachShort} time${plural(current.approachShort)} today.`,
        meaning: 'That usually means you are leaving yourself harder chips and longer first putts than needed.',
        actionKey: 'approach_short',
        severity: 3,
        frequency: countWhere(recentMetrics, (m) => m.approachShort >= 3) + (current.approachShort >= 3 ? 1 : 0),
        trend: rolling.trend.approachShort
      }));
    }

    if (current.fairwayMissLeft >= 4) {
      candidates.push(makeCandidate('miss_left', 'tee', current.fairwayMissLeft, rolling.last5.fairwayMissLeft, {
        observation: `Your tee miss was left ${current.fairwayMissLeft} time${plural(current.fairwayMissLeft)} today.`,
        meaning: 'A repeated one-sided miss is useful because you can plan for it instead of fighting every shot.',
        actionKey: 'miss_left',
        severity: 3,
        frequency: countWhere(recentMetrics, (m) => m.fairwayMissLeft >= 3) + 1,
        trend: 'watch'
      }));
    }

    if (current.fairwayMissRight >= 4) {
      candidates.push(makeCandidate('miss_right', 'tee', current.fairwayMissRight, rolling.last5.fairwayMissRight, {
        observation: `Your tee miss was right ${current.fairwayMissRight} time${plural(current.fairwayMissRight)} today.`,
        meaning: 'A repeated one-sided miss is useful because you can plan for it instead of fighting every shot.',
        actionKey: 'miss_right',
        severity: 3,
        frequency: countWhere(recentMetrics, (m) => m.fairwayMissRight >= 3) + 1,
        trend: 'watch'
      }));
    }

    if (current.par3OverPar >= 3) {
      candidates.push(makeCandidate('par3_scoring', 'scoring', current.par3OverPar, rolling.last5.par3OverPar, {
        observation: `Par 3s cost shots on ${current.par3OverPar} hole${plural(current.par3OverPar)} today.`,
        meaning: 'Par 3s reward simple decisions. Centre-green targets can remove the short-side miss.',
        actionKey: 'par3_scoring',
        severity: 3,
        frequency: countWhere(recentMetrics, (m) => m.par3OverPar >= 2) + 1,
        trend: 'watch'
      }));
    }

    if (current.teeInPlay >= 10 && current.penalties <= 1) {
      candidates.push(makeCandidate('good_driving', 'positive', current.teeInPlay, rolling.last5.teeInPlay, {
        observation: `Your tee game gave you a platform today, with ${current.teeInPlay} tee shots safely in play.`,
        meaning: 'That matters because avoiding trouble keeps double bogey off the card.',
        actionKey: 'good_driving',
        severity: 3,
        frequency: countWhere(recentMetrics, (m) => m.teeInPlay >= 9) + 1,
        trend: 'positive'
      }));
    }

    if (current.threePutts === 0 && current.putts <= 34) {
      candidates.push(makeCandidate('good_putting', 'positive', current.putts, rolling.last5.putts, {
        observation: `No three-putts today is a strong scoring sign.`,
        meaning: 'Your pace control protected the card and helped avoid unnecessary doubles.',
        actionKey: 'good_putting',
        severity: 3,
        frequency: countWhere(recentMetrics, (m) => m.threePutts === 0) + 1,
        trend: 'positive'
      }));
    }

    return candidates;
  }

  function makeCandidate(id, category, currentValue, rollingValue, props) {
    return {
      id,
      category,
      categoryLabel: CATEGORY_LABELS[category] || category,
      currentValue,
      rollingValue,
      ...props
    };
  }

  function scoreInsight(candidate, adviceHistory) {
    const lastShown = findLastAdvice(candidate.id, adviceHistory);
    const repeatPenalty = lastShown && lastShown.roundsAgo <= 1 ? 18 : 0;
    const stalePenalty = lastShown && lastShown.timesShown >= 3 ? 10 : 0;
    const positiveBoost = candidate.category === 'positive' ? 8 : 0;
    const worseningBoost = candidate.trend === 'worsening' ? 12 : 0;
    const improvingPenalty = candidate.trend === 'improving' && candidate.category !== 'positive' ? 7 : 0;

    const score =
      candidate.severity * 16 +
      Math.min(candidate.frequency, 6) * 8 +
      positiveBoost +
      worseningBoost -
      repeatPenalty -
      stalePenalty -
      improvingPenalty;

    return { ...candidate, score: Math.round(score), lastShown };
  }

  function selectBalancedInsights(scored, adviceHistory, limit) {
    const selected = [];
    const usedCategories = new Set();

    const positive = scored.find((i) => i.category === 'positive');
    const issues = scored.filter((i) => i.category !== 'positive');

    for (const insight of issues) {
      if (selected.length >= limit) break;
      if (usedCategories.has(insight.category) && selected.length < 2) continue;
      selected.push(insight);
      usedCategories.add(insight.category);
    }

    if (positive && selected.length < limit) selected.push(positive);
    if (positive && selected.length === limit && !selected.some((i) => i.category === 'positive')) {
      selected[limit - 1] = positive;
    }

    return selected.slice(0, limit);
  }

  function formatInsight(candidate, adviceHistory) {
    const state = getAdviceState(candidate);
    const practice = PRACTICE_PLANS[candidate.actionKey];
    return {
      id: candidate.id,
      category: candidate.category,
      categoryLabel: candidate.categoryLabel,
      state,
      priorityScore: candidate.score,
      title: buildTitle(candidate, state),
      observation: candidate.observation,
      meaning: buildMeaning(candidate, state),
      action: buildAction(candidate, state, practice),
      practicePlan: practice || null,
      uiTone: candidate.category === 'positive' ? 'positive' : candidate.score >= 80 ? 'urgent' : 'steady'
    };
  }

  function getAdviceState(candidate) {
    if (candidate.category === 'positive') return 'strength';
    if (!candidate.lastShown) return 'new';
    if (candidate.trend === 'improving') return 'improving';
    if (candidate.trend === 'worsening') return 'escalating';
    return 'recurring';
  }

  function buildTitle(candidate, state) {
    const titles = {
      three_putts: 'Distance control is the putting priority',
      penalties: 'Penalty shots are the quickest saving opportunity',
      blow_ups: 'The next gain is fewer blow-up holes',
      approach_short: 'Approach shots are finishing short too often',
      miss_left: 'Your tee miss has a left pattern',
      miss_right: 'Your tee miss has a right pattern',
      par3_scoring: 'Par 3s need a simpler plan',
      good_driving: 'Your tee game gave you a platform',
      good_putting: 'Your putting protected the card'
    };

    if (state === 'improving') return `This is improving: ${titles[candidate.id] || candidate.categoryLabel}`;
    if (state === 'escalating') return `This needs attention: ${titles[candidate.id] || candidate.categoryLabel}`;
    return titles[candidate.id] || candidate.categoryLabel;
  }

  function buildMeaning(candidate, state) {
    if (state === 'recurring') {
      return `${candidate.meaning} This has appeared before, so it is worth treating as a pattern rather than a one-off.`;
    }
    if (state === 'improving') {
      return `${candidate.meaning} The trend is moving the right way, so the aim is to keep the same focus rather than change everything.`;
    }
    if (state === 'escalating') {
      return `${candidate.meaning} The trend is getting worse, so this should be your main focus next round.`;
    }
    return candidate.meaning;
  }

  function buildAction(candidate, state, practice) {
    if (!practice) return 'Use this as your main focus next round.';
    if (candidate.category === 'positive') return `${practice.title}: ${practice.blocks[0]}`;
    if (state === 'recurring') return `Repeat the focus, but make it more specific: ${practice.title}.`;
    if (state === 'improving') return `Stay with it for one more round: ${practice.title}.`;
    if (state === 'escalating') return `Make this your first practice block before the next round: ${practice.title}.`;
    return `Try this before your next round: ${practice.title}.`;
  }

  function buildRoundSummary(round, metrics, rolling) {
    const scoreLine = `${metrics.totalScore}${metrics.totalPar ? ` (${formatToPar(metrics.scoreToPar)})` : ''}`;
    const bestSignal = metrics.penalties === 0 ? 'No penalty shots' : metrics.threePutts === 0 ? 'No three-putts' : `${metrics.parsOrBetter} pars or better`;
    const riskSignal = metrics.doublesOrWorse >= 3 ? 'blow-up holes' : metrics.threePutts >= 2 ? 'three-putts' : metrics.penalties >= 2 ? 'penalty shots' : 'scoring consistency';

    return {
      scoreLine,
      headline: `You shot ${scoreLine}. ${bestSignal} was the strongest signal.`,
      mainOpportunity: `The main scoring opportunity is ${riskSignal}.`,
      trend: rolling.roundsCount >= 3 ? `This is based on your last ${rolling.roundsCount} round${plural(rolling.roundsCount)}.` : 'Add a few more rounds and Loop will become more personalised.'
    };
  }

  function buildNextRoundRules(insights) {
    return insights
      .filter((insight) => insight.category !== 'positive')
      .slice(0, 3)
      .map((insight) => {
        const rules = {
          three_putts: 'On long putts, judge success by finishing inside a club length, not by holing it.',
          penalties: 'On danger holes, choose the club that keeps the ball in play rather than the longest club.',
          blow_ups: 'After a bad shot, choose the option that removes double bogey from play.',
          approach_short: 'When there is no danger long, club for the back half of the green.',
          miss_left: 'Aim with your left miss in mind and pick a target that leaves room for it.',
          miss_right: 'Aim with your right miss in mind and pick a target that leaves room for it.',
          par3_scoring: 'On par 3s, aim at the centre of the green unless the flag is genuinely safe.'
        };
        return rules[insight.id] || insight.action;
      });
  }

  function updateAdviceHistory(history, insights, round) {
    const now = round.date || new Date().toISOString().slice(0, 10);
    const existing = Array.isArray(history) ? [...history] : [];
    insights.forEach((insight) => {
      const index = existing.findIndex((item) => item.id === insight.id);
      if (index >= 0) {
        existing[index] = {
          ...existing[index],
          lastShownDate: now,
          lastState: insight.state,
          timesShown: number(existing[index].timesShown) + 1
        };
      } else {
        existing.push({
          id: insight.id,
          lastShownDate: now,
          lastState: insight.state,
          timesShown: 1
        });
      }
    });
    return existing;
  }

  function findLastAdvice(id, adviceHistory) {
    const item = (adviceHistory || []).find((entry) => entry.id === id);
    if (!item) return null;
    return {
      ...item,
      roundsAgo: number(item.roundsAgo ?? 99)
    };
  }

  function averageMetrics(metrics) {
    if (!metrics.length) return {};
    const keys = Object.keys(metrics[0]);
    return keys.reduce((acc, key) => {
      acc[key] = round(sum(metrics.map((m) => number(m[key]))) / metrics.length, 1);
      return acc;
    }, {});
  }

  function trendDirection(values) {
    const clean = values.filter((v) => typeof v === 'number' && !Number.isNaN(v));
    if (clean.length < 3) return 'watch';
    const first = average(clean.slice(0, Math.ceil(clean.length / 2)));
    const second = average(clean.slice(Math.floor(clean.length / 2)));
    if (second >= first + 0.8) return 'worsening';
    if (second <= first - 0.8) return 'improving';
    return 'stable';
  }

  function normalise(value) {
    return String(value || '').trim().toLowerCase().replace(/\s+/g, '_');
  }

  function number(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function sum(values) {
    return values.reduce((total, value) => total + number(value), 0);
  }

  function average(values) {
    return values.length ? sum(values) / values.length : 0;
  }

  function round(value, decimals = 0) {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  function plural(value) {
    return Number(value) === 1 ? '' : 's';
  }

  function countWhere(items, predicate) {
    return items.filter(predicate).length;
  }

  function formatToPar(value) {
    if (value > 0) return `+${value}`;
    if (value < 0) return `${value}`;
    return 'E';
  }

  return {
    generateRoundInsights,
    calculateRoundMetrics,
    calculateRollingMetrics,
    PRACTICE_PLANS
  };
});


export default globalThis.LoopInsightEngine;
export const LoopInsightEngine = globalThis.LoopInsightEngine;
