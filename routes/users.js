import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import isAuth from "../middleware/isAuth.js";

const userRouter = Router();

// GET /users
userRouter.get('/', isAuth, async (req, res) => {
	try {
		const users = await prisma.user.findMany({
			select: {
				id: true,
				firstName: true,
				lastName: true,
				username: true,
				userType: true,
			},
		});

		res.json(users);
	} catch (error) {
		res.status(500).json({
			message: 'Internal server error',
		});
	}
});

// GET /users/me
userRouter.get('/me', isAuth, async (req, res) => {
	try {
		const user = await prisma.user.findUnique({
			where: { id: req.user.id },
			select: {
				id: true,
				firstName: true,
				lastName: true,
				username: true,
				userType: true,
			}
		});

		if (!user) return res.status(404).json({ message: 'User not found' });
		res.json(user);
	} catch (error) {
		res.status(500).json({ message: 'Internal server error' });
	}
});

// GET /users/:id
userRouter.get('/:id', isAuth, async (req, res) => {
	try {
		const { id } = req.params;
		const user = await prisma.user.findUnique({
			where: { id: parseInt(id) },
			select: {
				id: true,
				firstName: true,
				lastName: true,
				username: true,
				userType: true,
			}
		});

		if (!user) return res.status(404).json({ message: 'User not found' });
		res.json(user);
	} catch (error) {
		res.status(500).json({ message: 'Internal server error' });
	}
});

// PUT /users/:id
userRouter.put('/:id', isAuth, async (req, res) => {
	try {
		const { id } = req.params;

		if (req.user.id !== parseInt(id)) {
			return res.status(403).json({ message: 'Forbidden' });
		}

		const {
			firstname,
			lastname,
			username,
			password,
		} = req.body;

		const data = {
			...(firstname && { firstName: firstname }),
			...(lastname && { lastName: lastname }),
			...(username && { username }),
		};

		if (password) {
			data.password = await bcrypt.hash(
				password,
				parseInt(process.env.NUMBER_SECRET)
			);
		}

		const user = await prisma.user.update({
			where: { id: parseInt(id) },
			data,
			select: {
				id: true,
				firstName: true,
				lastName: true,
				username: true,
				userType: true,
			},
		});

		res.json(user);
	} catch (error) {
		if (error.code === "P2025") {
			return res.status(404).json({ message: 'User not found' });
		}

		if (error.code === "P2002") {
			return res
				.status(409)
				.json({ message: 'Username already exists' });
		}

		res.status(500).json({
			message: 'Internal server error',
		});
	}
});
export default userRouter;