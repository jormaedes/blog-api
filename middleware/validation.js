import { body, validationResult } from "express-validator";

// firstname, lastname, username, password
export const validateSignup = [
	// Campo firstname
	body('firstname')
		.trim()
		.notEmpty()
		.withMessage('O primeiro nome é obrigatório.')
		.escape(),

	// Campo lastname
	body('lastname')
		.trim()
		.notEmpty()
		.withMessage('O último nome é obrigatório.')
		.escape(),

	// Campo username
	body('username')
		.trim()
		.notEmpty()
		.withMessage('O nome de utilizador é obrigatório.')
		.isLength({ min: 3 })
		.withMessage('O nome de utilizador deve ter pelo menos 3 caracteres.')
		.escape(),

	// Campo password
	body('password')
		.notEmpty()
		.withMessage('A palavra-passe é obrigatória.')
		.isLength({ min: 5 })
		.withMessage('A palavra-passe deve ter pelo menos 5 caracteres.')
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};