const mongoose = require('mongoose')

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: [3, 'Name must be 3 characters long at least'],
    required: [true, 'Name is required'],
  },
  number: {
    type: String,
    minLength: [8, 'Number must be 8 characters long at least'],
    required: [true, 'Number is required'],
    validate: {
      validator: function (v) {
        return /^\d{2,3}-\d+$/.test(v)
      },
      message: (props) =>
        `${props.value} is not a valid phone number! Format must be XX-XXXX...`,
    },
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Person', personSchema)
