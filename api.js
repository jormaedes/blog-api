import express from 'express';
import { validateSignup, handleValidationErrors } from './middleware/validation.js';
import bcrypt from 'bcryptjs';
import { prisma } from './lib/prisma.js'


const PORT = process.env.PORT || 3300;
const api = express();

api.use(express.json());

api.post('/signup', validateSignup, handleValidationErrors, async (req, res)=>{
	const { firstname, lastname, username, password } = req.body;

	const hashPassword = await bcrypt.hash(password, parseInt(process.env.NUMBER_SECRET));

	try {
		const user = await prisma.user.create({
			data: {
				firstName: firstname,
				lastName: lastname,
				username,
				password: hashPassword
			}
		});
		res.status(201).json({ message: 'User created successfully', user });
	} catch (error) {
		if(error.code === "P2002") return res.status(409).json({message: "Username already exists"})
		res.status(500).json({ message: 'Internal server error', error });
	}
});

api.listen(PORT, () => {
	console.log(`API running on port: ${PORT}`);
})