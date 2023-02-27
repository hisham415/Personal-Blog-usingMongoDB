const express = require("express");
const multer = require('multer')
const db = require("../data/database");
const mongodb = require("mongodb");
const router = express.Router();

const objectId = mongodb.ObjectId;
const storageConfig = multer.diskStorage({
  destination: (req,file,cb)=>{
    cb(null, 'images');
  },
  filename: (req,file,cb)=>{
      cb(null,Date.now()+'-'+file.originalname);
      //console.log("gggg"+ Date.now()+'-'+file.originalname)
  },
});
const upload = multer({ storage: storageConfig });

router.get("/", function (req, res) {
  res.redirect("/posts");
});

router.get("/posts", async (req, res) => {
  const posts = await db
    .getDb()
    .collection("posts")
    .find({}, { title: 1, summary: 1, "author.name": 1 })
    .toArray();
  //console.log(posts);
  res.render("posts-list", { posts: posts });
});

router.get("/new-post", async function (req, res) {
  const authors = await db.getDb().collection("authors").find().toArray();
  res.render("create-post", { authors: authors });
});

router.post("/posts",upload.single('image'), async (req, res) => {
  const uploadImageFile = req.file;
  //console.log(uploadImageFile);
  const authorId = new objectId(req.body.author);
  const author = await db
    .getDb()
    .collection("authors")
    .findOne({ _id: authorId });
  const newPost = {
    title: req.body.title,
    summary: req.body.summary,
    body: req.body.content,
    date: new Date(),
    imagePath: uploadImageFile.path, 
    author: {
      id: objectId(req.body.author.id),
      name: author.name,
      email: author.email,
    },
  };
  const result = await db.getDb().collection("posts").insertOne(newPost);
  //console.log(result);
  res.redirect("/posts");
});
router.get("/posts/:id", async (req, res) => {
  const post = await db
    .getDb()
    .collection("posts")
    .findOne({ _id: new objectId(req.params.id) });
  if (!post) {
    return res.status(404).render("404");
  } else {
    post.humanReadableDate = post.date.toLocaleDateString("en-us", {
      weekday: "long",
      year: "numeric",
      month: "long",
      date: "numeric",
    });
    if(post.imagePath){

      post.imagePath = '/' + post.imagePath.replace('\\' , '/');
    }
    // console.log('xd'+ post.imagePath)
    post.date = post.date.toISOString();
    res.render("post-detail", { post: post, comments: null });
  }
});
router.get("/posts/:id/edit", async (req, res) => {
  const post = await db
    .getDb()
    .collection("posts")
    .findOne(
      { _id: new objectId(req.params.id) },
      { title: 1, summary: 1, body: 1 }
    );
  if (!post) {
    return res.status(404).render("404");
  }
  res.render("update-post", { post: post });
});
router.post("/posts/:id/edit", async (req, res) => {
  const postId = new objectId(req.params.id);
  const result = await db
    .getDb()
    .collection("posts")
    .updateOne(
      { _id: postId },
      {
        $set: {
          title: req.body.title,
          summary: req.body.summary,
          body: req.body.content,
          date: new Date(),
        },
      }
    );
  res.redirect("/posts");
});
router.post("/posts/:id/delete", async (req, res) => {
  await db
    .getDb()
    .collection("posts")
    .deleteOne({ _id: new objectId(req.params.id) });
  res.redirect("/posts");
});


router.get('/posts/:id/comments', async function (req, res) {
  const postId = new objectId(req.params.id);
  // const post = await db.getDb().collection('posts').findOne({ _id: postId });
  const comments = await db
    .getDb()
    .collection('comments')
    .find({ postId: postId }).toArray();

  // return res.render('post-detail', { post: post, comments: comments });
  res.json({comments});
});

router.post('/posts/:id/comments', async function (req, res) {
  const postId = new objectId(req.params.id);
  const newComment = {
    postId: postId,
    title: req.body.title,
    text: req.body.text,
  };
  await db.getDb().collection('comments').insertOne(newComment);
  // res.redirect('/posts/' + req.params.id);
  res.json({message: 'Comment added!'});
  // res.status(500).json({message: 'error'});
});




module.exports = router;
