'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import TogetherPanel from '@/components/TogetherPanel';

const SANDBOX_DEMO_KEY =
  process.env.NEXT_PUBLIC_DEMO_API_KEY ||
  ['sh_live', 'homepagedemo0001', '0123456789abcdef0123456789abcdef'].join('_);

type SpeechRec = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: { results: ArrayLike<{ isFinal?: boolean; 0?: { transcript?: string }]> }) => void) | null;
  start: () => void;
  stop: () => void;
};