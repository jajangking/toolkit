import fs from 'fs';
import path from 'path';

export interface Tip {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  solvesId?: string; // ID of the article this post solves
  reactions?: {
    like: number;
    love: number;
    haha: number;
    wow: number;
    sad: number;
    angry: number;
  };
}

const dataFilePath = path.join(process.cwd(), 'data/tips.json');

export function getTips(): Tip[] {
  try {
    const jsonData = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Error reading tips data:', error);
    return [];
  }
}

export function getTipBySlug(slug: string): Tip | undefined {
  const tips = getTips();
  return tips.find((tip) => tip.slug === slug);
}

export function saveTip(newTip: Tip) {
  const tips = getTips();
  tips.unshift(newTip); // Add to beginning
  fs.writeFileSync(dataFilePath, JSON.stringify(tips, null, 2));
}
