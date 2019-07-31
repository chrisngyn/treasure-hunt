const crypto = require('crypto');
const mongoose = require('mongoose');
mongoose.plugin(schema => { schema.options.usePushEach = true });

const ChallengeSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  num: String,
  name: String,
  detail: String,
  points: Number,
  isValid : Number,
  depletionLeft: Number,
  depletionBy: Number,
  teams: Array
}, { timestamps: true }
  );

const Challenge = mongoose.model('Challenge', ChallengeSchema);

module.exports = Challenge;