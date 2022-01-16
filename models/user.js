const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    requires: true,
  },
  name: String,
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExp: Date,
  card: {
    items: [
      {
        count: {
          type: Number,
          required: true,
          default: 1,
        },
        courseId: {
          type: Schema.Types.ObjectId,
          ref: "Course",
          required: true,
        },
      },
    ],
  },
});

userSchema.methods.addToCard = function (course) {
  const items = [...this.card.items]; //this.card.items.concat()
  const idx = items.findIndex((c) => {
    return c.courseId.toString() === course._id.toString();
  });
  if (idx >= 0) {
    items[idx].count = items[idx].count + 1;
  } else {
    items.push({
      courseId: course._id,
      count: 1,
    });
  }

  //   const newCard = {items: clonedItems};
  //   this.card = newCard;

  this.card = { items };
  return this.save();
};

userSchema.methods.removeFromCard = function (id) {
  let items = [...this.card.items];

  let idx = items.findIndex((c) => {
    return c.courseId.toString() === id.toString();
  });

  if (items[idx].count === 1) {
    items = items.filter((c) => {
      if (c.courseId.toString() !== id.toString()) {
        return c;
      }
    });
  } else {
    items[idx].count--;
  }
  this.card = { items };
  return this.save();
};

userSchema.methods.clearCard = function(){
  this.card = {items: []};
  return this.save()
};

module.exports = model("User", userSchema);
