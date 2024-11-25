const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: String,
  ingredients: String,
  instructions: String
});

module.exports = mongoose.model('Recipe', recipeSchema);
