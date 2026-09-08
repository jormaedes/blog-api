import { Router } from "express";
import isAuth from "../middleware/isAuth.js";
import { prisma } from "../lib/prisma.js";

const postRouter = Router();

postRouter.get('/', isAuth, async (req, res) => {
	try {
		const posts = await prisma.post.findMany({where: {published: true}});
		return res.json(posts);
	} catch (error) {
		res.status(500).json({message: 'Internal server error'});	
	}
});

export default postRouter;