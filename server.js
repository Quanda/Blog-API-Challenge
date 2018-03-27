
const express = require('express');
const morgan = require('morgan');

const app = express();

const blogPostsRouter = require('./BlogPostsRouter');

// log the http layer
app.use(morgan('common'));

// import static assets
app.use(express.static('public'));

// import blog-posts router
app.use('/blog-posts', blogPostsRouter);

let server;

function runServer() {
    const port = process.env.PORT || 8080;
    return new Promise((resolve, reject) => {
        server = app.listen(port, () => {
            console.log(`App listening on port ${port}`);
            resolve(server);
        }).on('error', err => {
            reject(err);
        });
    });
}

function closeServer() {
    return new Promise((resolve, reject) => {
        console.log('Closing server');
        server.close(err => {
            if (err) {
                reject(err);
                return;
            } 
            resolve();
        });
    });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
};


module.exports = {app, runServer, closeServer};