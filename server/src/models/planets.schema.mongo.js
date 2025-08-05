const mongoose = require('mongoose');
// schema, an object which is like creating a table in SQL, it defines the structure of the data, but hardCoded
const planetSchema = new mongoose.Schema({
  keplerName: {
    type: String,
    required: true,
  },
});
module.exports = mongoose.model('Planet', planetSchema); // compiling a mongoose schema into a model (collection "planets" will be created in MongoDB)
