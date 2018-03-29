const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require('./config');
const { BlogPost } = require('./models');


const app = express();

app.use(bodyParser.json());
app.use(morgan('common'));


// GET requests to /posts => return all blog posts
app.get('/posts', (req, res) => {
    BlogPost
      .find()
      .then(posts => {
        res.json({
          blogposts: posts.map(
            (post) => post.serialize())
        });
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
      });
});

// GET requests to /posts/:id => return a single blog post
app.get('/posts/:id', (req, res) => {
    BlogPost
      .findById(req.params.id)
      .then(post => res.json(post.serialize()))
      .catch(err => {
          console.error(err);
          res.status(500).json({ error: 'Internal server error' });
      });
})


// POST requests to /posts => creates and returns a new post 
app.post('/posts', (req, res) => {
    const requiredFields = ['title', 'content', 'author'];
    requiredFields.forEach((field) => {
        if(!(field in req.body)) {
            // missing a required field
            const message = `Missing required field ${field} in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    })
    
    BlogPost
      .create({
          title: req.body.title,
          content: req.body.content,
          author: req.body.author
      })
      .then( blogPost => {
          res.status(201).json(blogPost.serialize());
      })
      .catch( err => {
          console.error(err);
          res.status(590).json({error: 'Internal server error'});
      })
})


// PUT requests to /posts/:id => updates a post
app.put('/posts/:id', (req, res) => {
    if(!(req.body.id)) {
        res.status(400).json({error: 'Request body must contain an ID'});
    }
    if(req.body.id !== req.params.id) {
        res.status(400).json({error: 'IDs must match'});
    }
    
    const updated = {};
    const updatableFields = ['title', 'content', 'author'];
    updatableFields.forEach(field => {
        if(field in req.body) {
            updated[field] = req.body[field];
        }
    })
    
    BlogPost.findByIdAndUpdate(req.body.id, { $set: updated }, { new: true })
      .then( updatedPost => res.status(204).end())
      .catch( err => res.status(500).json({error: 'Internal server error'}));
})

// DELETE requests to posts/:id
app.delete('/posts/:id', (req, res) => {
    BlogPost
      .findByIdAndRemove(req.params.id)
      .then( () => res.status(204).json({message: `deleted post ${req.params.id}`}))
      .catch( err => {
          console.error(err);
          res.status(500).json({error: 'Internal server error'})
      })
       
})


let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl, port = PORT) {

  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
