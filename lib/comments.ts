import fs from 'fs';
import path from 'path';

export interface Comment {
  id: string;
  tipId: string;
  name: string;
  text: string;
  date: string;
}

const commentsFilePath = path.join(process.cwd(), 'data/comments.json');

export function getComments(tipId: string): Comment[] {
  try {
    const jsonData = fs.readFileSync(commentsFilePath, 'utf8');
    const allComments: Comment[] = JSON.parse(jsonData);
    return allComments.filter(c => c.tipId === tipId);
  } catch (error) {
    return [];
  }
}

export function saveComment(comment: Comment) {
  try {
    const jsonData = fs.readFileSync(commentsFilePath, 'utf8');
    const allComments: Comment[] = JSON.parse(jsonData);
    allComments.push(comment);
    fs.writeFileSync(commentsFilePath, JSON.stringify(allComments, null, 2));
  } catch (error) {
    fs.writeFileSync(commentsFilePath, JSON.stringify([comment], null, 2));
  }
}
