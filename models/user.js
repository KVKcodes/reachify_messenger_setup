import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  clientId: {
    type: String,
    required: true,
    unique: true,
  },
  details: {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
  },
  contacts: [
    {
      platform: {
        type: String,
        required: true,
      },
      username: {
        type: String,
        required: true,
      },
    },
  ],
  salesStage: {
    type: String,
    enum: ["new", "prospected", "contacted"],
    default: "new",
  },
  marketingStage: {
    type: String,
    default: "",
  },
  projectStage: {
    type: String,
    default: "",
  },
  tags: [
    {
      type: String,
      enum: ["vip", "important", "recurring"],
    },
  ],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
});

module.exports = mongoose.model("User", userSchema);
