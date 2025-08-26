import  mongoose from 'mongoose';
const tokenCounterSchema = new mongoose.Schema({
    token: {
      type: Number,
      default: 1 // Start with 1
    },
    lastReset: {
      type: Date,
      default: Date.now // Store the date when it was last reset
    }
  },{timestamps:true});
  
export const TokenCounter  = mongoose.model('TokenCounter', tokenCounterSchema);
  