import { describe, expect, it } from 'vitest';
import { parseTechStack } from './types';

describe('parseTechStack', () => {
  it('passes an array through unchanged', () => {
    expect(parseTechStack(['React', 'Laravel'])).toEqual(['React', 'Laravel']);
  });

  it('parses a JSON string, which is how the column has been seen to arrive', () => {
    expect(parseTechStack('["React","Docker"]')).toEqual(['React', 'Docker']);
  });

  it('returns an empty array for null', () => {
    expect(parseTechStack(null)).toEqual([]);
  });

  it('returns an empty array for an empty string rather than throwing', () => {
    expect(parseTechStack('')).toEqual([]);
  });

  it('returns an empty array for malformed JSON rather than throwing', () => {
    expect(parseTechStack('{not json')).toEqual([]);
  });

  it('returns an empty array when the JSON parses to a non-array', () => {
    expect(parseTechStack('{"a":1}')).toEqual([]);
  });
});
