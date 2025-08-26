import  mongoose from 'mongoose';

module.exports = mongoose.model(
  'messages',
  new mongoose.Schema({
    messageId : {type: String, required: true},
    senderName : {type: String, required: true},
    receiverName : {type: String, required: true}},
    {timestamps:true}
  ));

