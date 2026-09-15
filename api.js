import cors from 'cors';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './lib/prisma.js'
import userRouter from './routes/users.js';
import postRouter from './routes/posts.js';
import commentActionsRouter from './routes/commentActionsRouter.js';
import { validateSignup, validateLogin, handleValidationErrors } from './middleware/validation.js';

const PORT = process.env.PORT || 3300;
const api = express();

const allowedOrigins = [
	process.env.ADMIN_ORIGIN,
	process.env.READER_ORIGIN
];

api.use(express.json());

api.use(cors({
	origin: allowedOrigins,
	allowedHeaders: ['Content-Type', 'Authorization']
}));

api.post('/signup', validateSignup, handleValidationErrors, async (req, res) => {
	const { firstname, lastname, username, password, user_type } = req.body;

	const hashPassword = await bcrypt.hash(password, parseInt(process.env.NUMBER_SECRET));

	try {
		const user = await prisma.user.create({
			data: {
				firstName: firstname,
				lastName: lastname,
				username,
				password: hashPassword,
				...(user_type && { userType: user_type })
			},
			select: {
				id: true,
				firstName: true,
				lastName: true,
				username: true,
				userType: true,
			}
		});
		res.status(201).json({ message: 'User created successfully', user });
	} catch (error) {
		if (error.code === "P2002") return res.status(409).json({ message: "Username already exists" })
		res.status(500).json({ message: 'Internal server error', error });
	}
});

api.post('/login', validateLogin, handleValidationErrors, async (req, res) => {
	try {
		const { username, password } = req.body;
		const user = await prisma.user.findUnique({ where: { username: username } });
		if (!user) return res.status(401).json({ message: 'Invalid credentials' });

		const match = await bcrypt.compare(password, user.password);
		if (!match) return res.status(401).json({ message: 'Invalid credentials' })

		const payload = {
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			username: user.username,
			userType: user.userType
		};
		const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
		return res.json({ token: token, user: payload });
	} catch (error) {
		res.status(500).json({ message: 'Internal server error', error });
	}
});

api.use('/posts', postRouter);
api.use('/users', userRouter);
api.use('/comments', commentActionsRouter);

api.use((req, res) => {
	res.status(404).json({ message: 'Route not found' });
});

api.listen(PORT, () => {
	console.log(`API running on port: ${PORT}`);
});
