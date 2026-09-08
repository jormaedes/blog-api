import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import isAuth from "../middleware/isAuth.js";

// precisa disso pra ver o :postId do router pai
const commentRouter = Router({ mergeParams: true }); 

// GET /posts/:postId/comments
commentRouter.get('/', async (req, res) => {
	try {
		const { postId } = req.params;
		const comments = await prisma.comment.findMany({
			where: { postId: parseInt(postId) }
		});
		res.json(comments);
	} catch (error) {
		res.status(500).json({ message: 'Internal server error' });
	}
});

// GET /posts/:postId/comments/:commentId
commentRouter.get('/:commentId', async (req, res) => {
	try {
		const { postId, commentId } = req.params;
		const comment = await prisma.comment.findFirst({
			where: { id: parseInt(commentId), postId: parseInt(postId) }
		});
		if (!comment) return res.status(404).json({ message: 'Comment not found' });
		res.json(comment);
	} catch (error) {
		res.status(500).json({ message: 'Internal server error' });
	}
});

// POST /posts/:postId/comments
commentRouter.post('/', isAuth, async (req, res) => {
	try {
		const { postId } = req.params;
		const { content } = req.body;

		const post = await prisma.post.findUnique({ where: { id: parseInt(postId) } });
		if (!post) return res.status(404).json({ message: 'Post not found' });

		const comment = await prisma.comment.create({
			data: {
				content,
				userId: req.user.id,
				postId: parseInt(postId)
			}
		});
		res.status(201).json(comment);
	} catch (error) {
		res.status(500).json({ message: 'Internal server error' });
	}
});

export default commentRouter;