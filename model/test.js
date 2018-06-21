const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const SchemaType = mongoose.SchemaType;

const schema = new Schema({ name: Date });
schema.post('save', function (doc) {
  console.log('this fired after a document was saved');
});

schema.post('find', function(docs) {
  console.log('this fired after you run a find query');
});
console.log(schema.path('name').instance)
console.log(schema.path('name') instanceof SchemaType); // true

var Model = mongoose.model('Model', schema);

var m = new Model({name: new Date()});
m.save(function(err) {
  console.log('this fires after the `post` hook');
});

