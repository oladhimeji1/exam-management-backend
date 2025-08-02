export const calculateGrade = (percentage) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C+';
  if (percentage >= 40) return 'C';
  if (percentage >= 30) return 'D';
  return 'F';
};

export const getRemarks = (percentage) => {
  if (percentage >= 90) return 'Excellent';
  if (percentage >= 80) return 'Very Good';
  if (percentage >= 70) return 'Good';
  if (percentage >= 60) return 'Above Average';
  if (percentage >= 50) return 'Average';
  if (percentage >= 40) return 'Below Average';
  if (percentage >= 30) return 'Poor';
  return 'Very Poor';
};

export const calculatePercentage = (score, totalPoints) => {
  if (totalPoints === 0) return 0;
  return Math.round((score / totalPoints) * 100 * 100) / 100; // Round to 2 decimal places
};