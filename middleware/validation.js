import { body, validationResult } from "express-validator";

// firstname, lastname, username, password
export const validateSignup = [
	body('firstname')
		.trim()
		.notEmpty()
		.withMessage('O primeiro nome é obrigatório.')
		.escape(),

	body('lastname')
		.trim()
		.notEmpty()
		.withMessage('O último nome é obrigatório.')
		.escape(),

	body('username')
		.trim()
		.notEmpty()
		.withMessage('O nome de utilizador é obrigatório.')
		.isLength({ min: 3 })
		.withMessage('O nome de utilizador deve ter pelo menos 3 caracteres.')
		.escape(),

	body('password')
		.notEmpty()
		.withMessage('A palavra-passe é obrigatória.')
		.isLength({ min: 5 })
		.withMessage('A palavra-passe deve ter pelo menos 5 caracteres.')
];

// username, password
export const validateLogin = [
	body('username')
		.trim()
		.notEmpty()
		.withMessage('O nome de utilizador é obrigatório.')
		.escape(),

	body('password')
		.notEmpty()
		.withMessage('A palavra-passe é obrigatória.'),
];

export const handleValidationErrors = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	next();
};