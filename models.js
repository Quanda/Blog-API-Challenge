'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;


// this is our schema to represent a blog post
const blogPostSchema = mongoose.Schema({
  author: {
    firstName: String,
    lastName: String
  },
  title: {type: String, required: true},
  content: {type: String, required: true},
  publishDate: {type: Date, default: Date.now}
});

blogPostSchema.virtual('authorName').get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogPostSchema.methods.serialize = function() {
  return {
    id: this._id,
    author: this.authorName,
    title: this.title,
    content: this.content,
    publishDate: this.publishDate
  };
}


const BlogPost = mongoose.model('blogpost', blogPostSchema);

module.exports = {BlogPost};