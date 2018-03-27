const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

// load the BlogPosts model
const {BlogPosts} = require('./models');

// create a blog post
BlogPosts.create('Blog 1', 'A fun blog', 'Eric F', '2018-03-02')

// handle GET requests
// respond with all blog posts in json
router.get('/', (req, res) => {
  res.json(BlogPosts.get());
});

// handle POST requests
// validate the request by making sure the required fields are in the request body
// creates a blog post item with the data in the request body
// if successful, responds with 201 status code and the item in json
router.post('/', jsonParser, (req, res) => {
  const requiredFields = ['title', 'content', 'author'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  const item = BlogPosts.create(req.body.title, req.body.content, req.body.author, req.body.publishDate);
  res.status(201).json(item);
});

// handle DELETE requests
// deletes the blog post based on the supplied id
// responds with 204 status code
router.delete('/:id', (req, res) => {
  BlogPosts.delete(req.params.id);
  console.log(`Deleted blog post \`${req.params.ID}\``);
  res.status(204).end();
});

// handle PUT requests
// validate the request by making sure the required fields are in the request body
// validates the id in the endpoint and the id in the body match
// updates the blog post with the data in the request body
// if successful, responds with 204 status code
router.put('/:id', jsonParser, (req, res) => {
  const requiredFields = ['title', 'content', 'author'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  if (req.params.id !== req.body.id) {
    const message = (
      `Request path id (${req.params.id}) and request body id `
      `(${req.body.id}) must match`);
    console.error(message);
    return res.status(400).send(message);
  }
  console.log(`Updating blog post \`${req.params.id}\``);
  const updatedPost = BlogPosts.update({
    id: req.params.id,
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
    publishDate: req.body.publishDate
  });
  res.status(204).end();
})

// expose the router
module.exports = router;