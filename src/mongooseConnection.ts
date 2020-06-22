import mongoose from 'mongoose';
mongoose.connect('mongodb://localhost/forest', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

export { mongoose };
