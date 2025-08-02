import jwt from 'jsonwebtoken';
// import User from '../models/User.js';
import { jwtConfig } from '../config/jwt.js';
import { AppError } from '../middleware/errorHandler.js';
// import Student from '../models/Student.js';
// import Class from '../models/Class.js';
import { User, Student, Class } from '../models/index.js'; 

export class StudentService {

    static async createStudentRecord(studentData) {
        const student = await Student.create(studentData);

        // Update class student count if classId is provided
        if (studentData.classId) {
            await Class.increment('studentsCount', { where: { id: studentData.classId } });
        }

        const createdStudent = await Student.findByPk(student.id, {
            include: [
            { model: User, as: 'user' },
            { model: Class, as: 'class' },
            ],
        });

        return createdStudent;
    };

}