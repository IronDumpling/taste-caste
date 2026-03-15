import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { loadScoringConfig, aggregateSelectionScores } from './score-aggregator.js';
import { resolveCaste } from './caste-resolver.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

let casteTemplates = null;
let sentenceTemplates = null;

function loadCasteTemplates() {
  if (casteTemplates) return casteTemplates;
  const path = join(__dirname, '../../data/caste-templates.json');
  casteTemplates = JSON.parse(readFileSync(path, 'utf-8'));
  return casteTemplates;
}

function loadSentenceTemplates() {
  if (sentenceTemplates) return sentenceTemplates;
  const path = join(__dirname, '../../data/sentence-templates.json');
  sentenceTemplates = JSON.parse(readFileSync(path, 'utf-8'));
  return sentenceTemplates;
}

/**
 * Compute final (P, C) from initial selection scores and answers.
 * @param {{ popularity: number, critic: number }} initial - P0, C0 from selection
 * @param {Array<{ questionId: string, choice: 'left'|'right' }>} answers
 * @param {Array<{ questionId: string, left: { p: number, c: number }, right: { p: number, c: number } }>} questions - with p,c per option
 * @returns {{ popularity: number, critic: number }}
 */
export function blendAnswersWithInitial(initial, answers, questions) {
  const config = loadScoringConfig();
  const alpha = config.answerBlendAlpha ?? 0.4;
  let P = initial.popularity;
  let C = initial.critic;
  const qMap = new Map(questions.map((q) => [q.questionId, q]));
  for (const a of answers) {
    const q = qMap.get(a.questionId);
    if (!q) continue;
    const side = a.choice === 'left' ? q.left : q.right;
    if (side?.p != null && side?.c != null) {
      P = alpha * P + (1 - alpha) * side.p;
      C = alpha * C + (1 - alpha) * side.c;
    }
  }
  return { popularity: P, critic: C };
}

/**
 * Build sentences for result card: opening, tag line, closing.
 * @param {string} casteId
 * @param {string[]} gameNames - e.g. first game name
 * @param {string} [tag] - optional tag for sentence 2
 */
export function buildSentences(casteId, gameNames, tag = 'default') {
  const caste = loadCasteTemplates();
  const sentences = loadSentenceTemplates();
  const t = caste[casteId] || caste.default;
  const out = [];
  if (t.opening) out.push(t.opening);
  const gameName = gameNames[0] || '未知作品';
  const tagTpl = sentences?.tag?.[tag] || sentences?.tag?.default;
  if (tagTpl) {
    out.push(tagTpl.replace('{gameName}', gameName).replace('{tag}', tag));
  }
  if (t.closing) out.push(t.closing);
  return out;
}

/**
 * Mock percentile from final (P, C) - higher critic + lower popularity -> higher percentile.
 * @param {number} popularity
 * @param {number} critic
 */
export function mockPercentile(popularity, critic) {
  const score = (100 - popularity) * 0.4 + critic * 0.6;
  return Math.max(5, Math.min(95, Math.round(score)));
}

/**
 * Full result computation: initial scores from games, blend with answers, resolve caste, build text.
 * @param {Array<{ popularity: number, critic: number }>} selectionScores - one per selected game
 * @param {Array<{ questionId: string, choice: 'left'|'right' }>} answers
 * @param {Array<{ questionId: string, left: { p: number, c: number }, right: { p: number, c: number } }>} questions
 * @param {string[]} gameNames
 * @param {string} [tag]
 */
export function computeResult(selectionScores, answers, questions, gameNames, tag = 'default') {
  const initial = aggregateSelectionScores(selectionScores);
  const final = blendAnswersWithInitial(initial, answers, questions);
  const casteId = resolveCaste(final.popularity, final.critic);
  const title = (loadCasteTemplates()[casteId] || loadCasteTemplates().default).title;
  const sentences = buildSentences(casteId, gameNames, tag);
  const percentile = mockPercentile(final.popularity, final.critic);
  return {
    caste: casteId,
    title,
    sentences,
    percentile,
    popularity: Math.round(final.popularity * 10) / 10,
    critic: Math.round(final.critic * 10) / 10,
  };
}
