import csv from 'csv-parser';
import { Readable } from 'stream';

export const parseQuestionsFromCSV = (buffer) => {
  return new Promise((resolve, reject) => {
    const questions = [];
    const stream = Readable.from(buffer);

    stream
      .pipe(csv())
      .on('data', (row) => {
        try {
          const question = {
            id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: row.type.toLowerCase() === 'multiple_choice' ? 'multiple_choice' : 'theory',
            question: row.question.trim(),
            points: parseInt(row.points) || 1,
            explanation: row.explanation?.trim(),
          };

          if (question.type === 'multiple_choice') {
            const options = [
              row.option1?.trim(),
              row.option2?.trim(),
              row.option3?.trim(),
              row.option4?.trim(),
            ].filter(Boolean);

            if (options.length < 2) {
              throw new Error(`Question "${row.question}" must have at least 2 options`);
            }

            question.options = options;
            
            // Convert correct answer to index if it's a letter (A, B, C, D)
            const correct_answer = row.correct_answer.trim().toUpperCase();
            if (['A', 'B', 'C', 'D'].includes(correct_answer)) {
              question.correct_answer = ['A', 'B', 'C', 'D'].indexOf(correct_answer);
            } else {
              question.correct_answer = parseInt(correct_answer) || 0;
            }
          } else {
            question.correct_answer = row.correct_answer.trim();
          }

          questions.push(question);
        } catch (error) {
          console.error('Error parsing CSV row:', error);
        }
      })
      .on('end', () => {
        resolve(questions);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

export const validateCSVHeaders = (headers) => {
  const requiredHeaders = ['type', 'question', 'correct_answer', 'points'];
  return requiredHeaders.every(header => headers.includes(header));
};