'use client';
import { useState } from 'react';
import { SPORT_KEYWORD_HINTS } from '@/lib/assessment/questions';

const CHIP_BASE =
  'px-3 py-1.5 rounded-full text-sm border transition-colors';
const CHIP_ON = 'bg-nys-red border-nys-red text-white';
const CHIP_OFF = 'bg-nys-card border-nys-border text-nys-dim';

function guessSportRelated(word) {
  const lower = word.toLowerCase();
  return SPORT_KEYWORD_HINTS.some((hint) => lower.includes(hint));
}

function MultiSelectChipsFreeform({ question, value, onChange }) {
  const selected = value ?? [];
  const [customWord, setCustomWord] = useState('');

  function toggle(opt) {
    const exists = selected.some((s) => s.value === opt.value);
    onChange(exists ? selected.filter((s) => s.value !== opt.value) : [...selected, opt]);
  }

  function addCustom() {
    const word = customWord.trim();
    if (!word) return;
    const opt = { value: word.toLowerCase(), label: word, sportRelated: guessSportRelated(word) };
    if (!selected.some((s) => s.value === opt.value)) {
      onChange([...selected, opt]);
    }
    setCustomWord('');
  }

  const customSelected = selected.filter(
    (s) => !question.options.some((opt) => opt.value === s.value)
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {question.options.map((opt) => {
          const isSelected = selected.some((s) => s.value === opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt)}
              className={`${CHIP_BASE} ${isSelected ? CHIP_ON : CHIP_OFF}`}
            >
              {opt.label}
            </button>
          );
        })}
        {customSelected.map((custom) => (
          <button
            key={custom.value}
            type="button"
            onClick={() => toggle(custom)}
            className={`${CHIP_BASE} ${CHIP_ON}`}
          >
            {custom.label}
          </button>
        ))}
      </div>
      {question.allowCustom && (
        <div className="flex gap-2">
          <input
            type="text"
            value={customWord}
            onChange={(e) => setCustomWord(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustom();
              }
            }}
            placeholder="Add your own word"
            className="flex-1 rounded-lg px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={addCustom}
            className="px-3 py-2 rounded-lg text-sm border border-nys-border text-white"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}

export function QuestionRenderer({ question, value, onChange }) {
  switch (question.type) {
    case 'single_choice':
      return (
        <div className="flex flex-wrap gap-2">
          {question.options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`${CHIP_BASE} rounded-lg ${value === opt.value ? CHIP_ON : CHIP_OFF}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      );

    case 'scale_1_10':
      return (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`h-10 w-10 rounded-lg text-sm font-medium border ${
                value === n ? CHIP_ON : CHIP_OFF
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      );

    case 'labeled_scale': {
      const steps = question.steps ?? 5;
      return (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            {Array.from({ length: steps }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onChange(n)}
                className={`h-10 flex-1 rounded-lg text-sm font-medium border ${
                  value === n ? CHIP_ON : CHIP_OFF
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-nys-faint">
            <span>{question.lowLabel}</span>
            <span>{question.highLabel}</span>
          </div>
        </div>
      );
    }

    case 'level_low_mod_high':
      return (
        <div className="flex gap-2">
          {['Low', 'Moderate', 'High'].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              className={`flex-1 px-3 py-2.5 rounded-lg text-sm border ${
                value === level ? CHIP_ON : CHIP_OFF
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      );

    case 'multi_select_chips': {
      const selected = value ?? [];
      function toggle(v) {
        onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
      }
      return (
        <div className="flex flex-wrap gap-2">
          {question.options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`${CHIP_BASE} ${selected.includes(opt.value) ? CHIP_ON : CHIP_OFF}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      );
    }

    case 'multi_select_chips_freeform':
      return <MultiSelectChipsFreeform question={question} value={value} onChange={onChange} />;

    case 'open_text':
      return (
        <textarea
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="w-full rounded-lg px-3 py-2.5 text-sm"
        />
      );

    case 'checklist': {
      const selected = value ?? [];
      function toggle(v) {
        onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
      }
      return (
        <div className="flex flex-col gap-2">
          {question.options.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2.5 text-sm text-white">
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => toggle(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      );
    }

    default:
      return null;
  }
}
