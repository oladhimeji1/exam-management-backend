import User from './User.js';
import Student from './Student.js';
import Teacher from './Teacher.js';
import Class from './Class.js';
import Subject from './Subject.js';
import Exam from './Exam.js';
import ExamSubmission from './ExamSubmission.js';
import Result from './Result.js';
import Question from './Question.js';

// Define associations
User.hasOne(Student, { foreignKey: 'userId', as: 'student' });
Student.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(Teacher, { foreignKey: 'userId', as: 'teacher' });
Teacher.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Class.hasMany(Student, { foreignKey: 'classId', as: 'students' });
Student.belongsTo(Class, { foreignKey: 'classId', as: 'class' });

Teacher.hasMany(Class, { foreignKey: 'teacherId', as: 'classex' });
Class.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });

Teacher.hasMany(Subject, { foreignKey: 'teacherId', as: 'subjectx' });
Subject.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });

Teacher.hasMany(Exam, { foreignKey: 'authorId', as: 'exams' });
Exam.belongsTo(Teacher, { foreignKey: 'authorId', as: 'teacher' });

Subject.hasMany(Exam, { foreignKey: 'subjectId', as: 'exams' });
Exam.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

Class.hasMany(Exam, { foreignKey: 'classId', as: 'exams' });
Exam.belongsTo(Class, { foreignKey: 'classId', as: 'class' });

Exam.hasMany(ExamSubmission, { foreignKey: 'examId', as: 'submissions' });
ExamSubmission.belongsTo(Exam, { foreignKey: 'examId', as: 'exam' });

Student.hasMany(ExamSubmission, { foreignKey: 'studentId', as: 'submissions' });
ExamSubmission.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

User.hasMany(ExamSubmission, { foreignKey: 'gradedBy', as: 'gradedSubmissions' });
ExamSubmission.belongsTo(User, { foreignKey: 'gradedBy', as: 'grader' });

Exam.hasMany(Result, { foreignKey: 'examId', as: 'results' });
Result.belongsTo(Exam, { foreignKey: 'examId', as: 'exam' });

Student.hasMany(Result, { foreignKey: 'studentId', as: 'results' });
Result.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

Exam.hasMany(Question, { foreignKey: 'examId', as: 'questions' });
Question.belongsTo(Exam, { foreignKey: 'examId', as: 'exam' });

export {
  User,
  Student,
  Teacher,
  Class,
  Subject,
  Exam,
  ExamSubmission,
  Result,
  Question,
};