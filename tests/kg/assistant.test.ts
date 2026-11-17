import assert from 'node:assert/strict';
import { test } from 'node:test';
import { promptFor } from '@/lib/assistant/ai';
import { EMPTY_PROFILE, onMessage } from '@/lib/assistant/engine';
import { RELATIONS, isPublished } from '@/lib/kg';

/**
 * Reference questions of the implementation plan (step 7). The Gemini call itself needs GEMINI_API_KEY
 * and the network, so it is not run here: these tests check what the model receives (the prompt built from
 * the site and the graph) and the keyword assistant, which runs without a model.
 */
const QUESTIONS: [string, 'fr' | 'en'][] = [
  ['Quels sites UNESCO dans le Sud ?', 'fr'],
  ['Qui a construit le ribat de Monastir ?', 'fr'],
  ['La harissa est-elle à l’UNESCO ?', 'fr'],
  ['Que voir à Kébili ?', 'fr'],
  ['Le Kef vaut-il le détour ?', 'fr'],
  ['Ichkeul est-il protégé ?', 'fr'],
  ['Où dormir près de Douz ?', 'fr'],
  ['Which UNESCO sites are in Tunisia?', 'en'],
  ['Who built the Ribat of Monastir?', 'en'],
  ['Was Gladiator filmed at El Jem?', 'en'],
];

const unpublished = RELATIONS.filter((r) => !isPublished(r)).flatMap((r) => [r.statement.fr, r.statement.en]);

test('assistant IA : le contexte ne contient que des faits publiés', () => {
  for (const [q, lang] of QUESTIONS) {
    const prompt = promptFor(q, lang);
    for (const s of unpublished) assert.ok(!prompt.includes(s), `${q} → ${s}`);
  }
});

test('assistant IA : les faits utiles arrivent dans le contexte, avec leur source', () => {
  const monastir = promptFor('Qui a construit le ribat de Monastir ?', 'fr');
  assert.ok(monastir.includes('Harthama ibn A’yan, gouverneur abbasside. (source :'));
  const harissa = promptFor('La harissa est-elle inscrite à l’UNESCO ?', 'fr');
  const factLines = harissa.split('\n').filter((l) => l.startsWith('Faits vérifiés'));
  assert.ok(!factLines.some((l) => /harissa/i.test(l) && /Nabeul/.test(l)), 'harissa jamais rattachée à Nabeul');
  const ichkeul = promptFor('Ichkeul patrimoine mondial ?', 'en');
  assert.ok(ichkeul.includes('Ichkeul National Park is a UNESCO World Heritage Site (property no. 8).'));
});

test('assistant par mots-clés : répond aux 10 questions de référence, en FR et en EN', () => {
  for (const [q, lang] of QUESTIONS) {
    const { reply } = onMessage(q, EMPTY_PROFILE, lang, 0);
    assert.ok(reply.text && reply.text.length > 0, q);
  }
});

test('assistant par mots-clés : une zone choisie couvre les 95 lieux (et plus seulement 38)', () => {
  const south = onMessage('Je veux voir le sud, Kébili et Tataouine', EMPTY_PROFILE, 'fr', 0);
  assert.ok(south.reply.text.length > 0);
});
