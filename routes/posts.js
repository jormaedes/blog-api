import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import isAuth from "../middleware/isAuth.js";
import isAuthor from "../middleware/isAuthor.js"

const postRouter = Router();

// GET /posts
postRouter.get('/', isAuth, async (req, res) => {
	try {
		let posts;
		if (req.user.userType === 'READER')
			posts = await prisma.post.findMany({ where: { published: true } });
		else
			posts = await prisma.post.findMany();

		return res.json(posts);
	} catch (error) {
		res.status(500).json({ message: 'Internal server error' });
	}
});

// GET /posts/:postId
postRouter.get('/:postId', isAuth, async (req, res) => {
	try {
		const { postId } = req.params;
		let post;
		if (req.user.userType === 'AUTHOR')
			post = await prisma.post.findUnique({ where: { id: parseInt(postId) } });
		else
			post = await prisma.post.findFirst({
				where: {
					id: parseInt(postId),
					published: true
				}
			})
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
			data: {
				authorId: req.user.id,
				title: title,
				content: content,
				published: published
			}
		});
		res.json(post);
	} catch (error) {
		res.status(500).json({ message: 'Internal server error' });
	}
});

// PUT /posts/:postId
postRouter.put('/:postId', isAuth, isAuthor, async (req, res) => {
	try {
		const { postId } = req.params;

		const { title, content } = req.body;

		const post = await prisma.post.update({
			where: { id: parseInt(postId) },
			data: {
				title: title,
				content: content
			}
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
		const post = await prisma.post.delete({ where: { id: parseInt(postId) } })
		res.json(post);
	} catch (error) {
		res.status(500).json({ message: 'Internal server error' });
	}
});


export default postRouter;