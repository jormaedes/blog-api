import { Router } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import isAuth from "../middleware/isAuth.js";
import isAuthor from "../middleware/isAuthor.js";
import commentRouter from "./comments.js";

const postRouter = Router();

function optionalAuth(req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader?.split(' ')[1];
	if (!token) return next();

	jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
		if (!error) req.user = decoded;
		next();
	});
}

// GET /posts
postRouter.get('/', optionalAuth, async (req, res) => {
	try {
		const isAuthorUser = req.user?.userType === 'AUTHOR';
		const posts = await prisma.post.findMany({
			where: isAuthorUser ? {} : { published: true }
		});
		res.json(posts);
	} catch (error) {
		res.status(500).json({ message: 'Internal server error' });
	}
});

// GET /posts/:postId
postRouter.get('/:postId', optionalAuth, async (req, res) => {
	try {
		const { postId } = req.params;
		const isAuthorUser = req.user?.userType === 'AUTHOR';

		const post = isAuthorUser
			? await prisma.post.findUnique({ where: { id: parseInt(postId) } })
			: await prisma.post.findFirst({ where: { id: parseInt(postId), published: true } });

		if (!post) return res.status(404).json({ message: 'Post not found' });
		res.json(post);
	} catch (error) {
		res.status(500).json({ message: 'Internal server error' });
	}
});

// POST /posts
postRouter.post('/', isAuth, isAuthor, async (req, res) => {
	try {
		const { title, content, published } = req.body;
		const post = await prisma.post.create({
			data: { authorId: req.user.id, title, content, published }
		});
		res.status(201).json(post);
	} catch (error) {
		res.status(500).json({ message: 'Internal server error' });
	}
});

// PUT /posts/:postId
postRouter.put('/:postId', isAuth, isAuthor, async (req, res) => {
	try {
		const { postId } = req.params;
		const { title, content } = req.body;

		const existing = await prisma.post.findUnique({ where: { id: parseInt(postId) } });
		if (!existing) return res.status(404).json({ message: 'Post not found' });
		if (existing.authorId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

		const post = await prisma.post.update({
			where: { id: parseInt(postId) },
			data: { title, content }
		});
		res.json(post);
	} catch (error) {
		res.status(500).json({ message: 'Internal server error' });
	}
});

// PATCH /posts/:postId/publish
postRouter.patch('/:postId/publish', isAuth, isAuthor, async (req, res) => {
	try {
		const { postId } = req.params;
		const { published } = req.body;

		const existing = await prisma.post.findUnique({ where: { id: parseInt(postId) } });
		if (!existing) return res.status(404).json({ message: 'Post not found' });
		if (existing.authorId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

		const post = await prisma.post.update({
			where: { id: parseInt(postId) },
			data: { published }
		});
		res.json(post);
	} catch (error) {
		res.status(500).json({ message: 'Internal server error' });
	}
});

// DELETE /posts/:postId
postRouter.delete('/:postId', isAuth, isAuthor, async (req, res) => {
	try {
		const { postId } = req.params;

		const existing = await prisma.post.findUnique({ where: { id: parseInt(postId) } });
		if (!existing) return res.status(404).json({ message: 'Post not found' });
		if (existing.authorId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

		const post = await prisma.post.delete({ where: { id: parseInt(postId) } });
		res.json(post);
	} catch (error) {
		res.status(500).json({ message: 'Internal server error' });
	}
});

postRouter.post('/:postId/like', isAuth, async (req, res) => {
	try {
		const { postId } = req.params;
		const like = await prisma.postLike.create({
			data: { userId: req.user.id, postId: parseInt(postId) }
		});
		res.status(201).json(like);
	} catch (error) {
		if (error.code === "P2002") return res.status(409).json({ message: 'Already liked' });
		res.status(500).json({ message: 'Internal server error' });
	}
});

// DELETE /posts/:postId/like
postRouter.delete('/:postId/like', isAuth, async (req, res) => {
	try {
		const { postId } = req.params;
		await prisma.postLike.delete({
			where: { userId_postId: { userId: req.user.id, postId: parseInt(postId) } }
		});
		res.status(204).send();
	} catch (error) {
		if (error.code === "P2025") return res.status(404).json({ message: 'Like not found' });
		res.status(500).json({ message: 'Internal server error' });
	}
});

postRouter.use('/:postId/comments', commentRouter);

export default postRouter;