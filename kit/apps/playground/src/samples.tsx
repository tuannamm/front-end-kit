// Real samples from project 1266 (internal, git-ignored): run scripts/import_1266.py to (re)create public/samples/.
import { useEffect, useState } from 'react';
import type { OcrDocument } from '@dtx/ui';

export type SampleMeta = { id: string; title: string; docType: string; words: number; fields: number; lowConfidence: number };

export function useSampleIndex() {
  const [index, setIndex] = useState<SampleMeta[] | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    fetch('/samples/index.json').then(r => (r.ok ? r.json() : Promise.reject())).then(setIndex, () => setError(true));
  }, []);
  return { index, error };
}

export function useSample(id: string | null) {
  const [doc, setDoc] = useState<OcrDocument | null>(null);
  useEffect(() => {
    if (!id) return;
    let live = true;
    setDoc(null);
    fetch(`/samples/${id}.json`).then(r => r.json()).then(d => { if (live) setDoc(d); });
    return () => { live = false; };
  }, [id]);
  return doc;
}

export const sampleOptions = (index: SampleMeta[]) => index.map(s => ({ value: s.id, label: s.title, description: `${s.words} từ · ${s.fields} trường · ${s.lowConfidence} từ < 80%` }));
