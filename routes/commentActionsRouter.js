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

		// dono do comentário OU autor do post pode apagar (moderação)
		const isOwner = existing.userId === req.user.id;
		const isPostAuthor = existing.post.authorId === req.user.id;
		if (!isOwner && !isPostAuthor) return res.status(403).json({ message: 'Forbidden' });

		await prisma.comment.delete({ where: { id: parseInt(commentId) } });
		res.status(204).send();
	} catch (error) {
		res.status(500).json({ message: 'Internal server error' });
	}
});

export default commentActionsRouter;