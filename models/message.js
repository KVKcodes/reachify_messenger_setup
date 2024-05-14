import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  messageId: {
    type: String,
    required: true,
  },
  platform: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    enum: ["txt", "media", "location", "contact"],
    required: true,
  },
  messageObj: {
    type: Object,
    default: {},
  },
  files: [
    {
      url: {
        type: String,
        // required: true,
      },
      metadata: {
        type: {
          type: String,
          // required: true,
        },
        size: {
          type: Number,
          // required: true,
        },
      },
    },
  ],
  isDelivered: {
    type: Object,
    default: {
      watermark
    },
  },
  replyFrom: {
    type: String,
  },
  senderType: {
    type: String,
    enum: ["client", "bot", "me"],
    required: true,
  },
  metadata: [
    {
      key: {
        type: String,
        required: true,
      },
      value: {
        type: String,
        required: true,
      },
    },
  ],
  isRead: {
    type: Boolean,
    default: false,
  },
  isHandled: {
    type: Boolean,
    default: false,
  },
  error: {
    code: {
      type: String,
    },
    message: {
      type: String,
    },
  },

  //added by kvk siddartha
  deliveryStatus: {
    isDelivered: {
      type: Boolean,
      default: false
    },
    deliveryTimestamp: {
      type: Date
    }
  }
});

export default mongoose.model("Message", messageSchema);
