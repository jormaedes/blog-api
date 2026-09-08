import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import isAuth from "../middleware/isAuth.js";

const commentActionsRouter = Router();

// PUT /comments/:commentId
commentActionsRouter.put('/:commentId', isAuth, async (req, res) => {
	try {
		const { commentId } = req.params;
		const { content } = req.body;

		const existing = await prisma.comment.findUnique({ where: { id: parseInt(commentId) } });
		if (!existing) return res.status(404).json({ message: 'Comment not found' });
		if (existing.userId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

		const comment = await prisma.comment.update({
			where: { id: parseInt(commentId) },
			data: { content }
		});
		res.json(comment);
	} catch (error) {
		res.status(500).json({ message: 'Internal server error' });
	}
});

// DELETE /comments/:commentId
commentActionsRouter.delete('/:commentId', isAuth, async (req, res) => {
	try {
		const { commentId } = req.params;

		const existing = await prisma.comment.findUnique({
			where: { id: parseInt(commentId) },
			include: { post: true }
		});
		if (!existing) return res.status(404).json({ message: 'Comment not found' });

		const isOwner = existing.userId === req.user.id;
		const isPostAuthor = existing.post.authorId === req.user.id;
		if (!isOwner && !isPostAuthor) return res.status(403).json({ message: 'Forbidden' });

		await prisma.comment.delete({ where: { id: parseInt(commentId) } });
		res.status(204).send();
	} catch (error) {
		res.status(500).json({ message: 'Internal server error' });
	}
});

// POST /comments/:commentId/like
commentActionsRouter.post('/:commentId/like', isAuth, async (req, res) => {
	try {
		const { commentId } = req.params;
		const like = await prisma.commentLike.create({
			data: { userId: req.user.id, commentId: parseInt(commentId) }
		});
		res.status(201).json(like);
	} catch (error) {
		if (error.code === "P2002") return res.status(409).json({ message: 'Already liked' });
		res.status(500).json({ message: 'Internal server error' });
	}
});

// DELETE /comments/:commentId/like
commentActionsRouter.delete('/:commentId/like', isAuth, async (req, res) => {
	try {
		const { commentId } = req.params;
		await prisma.commentLike.delete({
			where: { userId_commentId: { userId: req.user.id, commentId: parseInt(commentId) } }
		});
		res.status(204).send();
	} catch (error) {
		if (error.code === "P2025") return res.status(404).json({ message: 'Like not found' });
		res.status(500).json({ message: 'Internal server error' });
	}
});
export default commentActionsRouter;