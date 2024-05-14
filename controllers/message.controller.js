import request from "request";``
import User from "../models/user.js";
import Message from "../models/message.js";

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

// Function to handle incoming messages
export async function handleMessage(req, res) {
  let body = req.body;

  // !handle incomming message from messanger
  if (body.object === "page") {
    body.entry.forEach(async function (entry) {
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      let sender_psid = webhook_event.sender.id;
      console.log("Sender PSID: " + sender_psid);

      // Get the message data
      if (webhook_event.message) {
        let messageText = webhook_event.message.text;
        let messageId = webhook_event.message.mid;
        let timestamp = webhook_event.timestamp;

        try {
          let user = await User.findOne({ clientId: sender_psid });
          if (!user) {
            // If user doesn't exist, create a new one
            user = await User.create({
              clientId: sender_psid,
              details: {
                name: "New User",
                email: "newuser@example.com",
              },
              contacts: [], // Add user's contacts if available
              salesStage: "new", // Set default sales stage
            });
          }

          // Save the message to the database
          const newMessage = new Message({
            user: user._id,
            messageId: messageId,
            platform: "Messenger",
            timestamp: new Date(timestamp),
            type: "txt",
            messageObj: { text: messageText },
            senderType: "client",
            isRead: false,
            isHandled: false,
          });

          await newMessage.save();
          console.log("Message saved successfully");
        } catch (error) {
          console.error("Error occurred while saving message:", error);
        }
        //send automatically to the user
        try {
          const response_message= `You sent the message: "${ messageText }". UwU`;
          const response = {
            text: response_message,
          };
          respondMessenger(sender_psid, response)
        } catch(error) {
          console.error("Error sending the response to the user:", error);
        }
      }
    });

    res.status(200).send("EVENT_RECEIVED");
  }
  // !handle incomming message from Instagram
  else if (body.object == "instagram") {
    body.entry.forEach(async function (entry) {
      // Gets the body of the webhook event
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      // Get the sender ID
      let sender_id = webhook_event.sender.id;
      console.log("Sender ID: " + sender_id);
      if (webhook_event.message) {
        let messageText = webhook_event.message.text;
        let messageId = webhook_event.message.mid;
        let timestamp = webhook_event.timestamp;
        const received_message = webhook_event.message;
        if (received_message.text) {
          // save user to database
          try {
            let user = await User.findOne({ clientId: sender_id });
            if (!user) {
              // if user does not exist create one
              user = await User.create({
                clientId: sender_id,
                details: {
                  name: "New User",
                  email: "newuser@example.com",
                },
                contacts: [],
                salesStage: "new",
              });
            }
            const newMessage = new Message({
              user: user._id,
              messageId: messageId,
              platform: "instagram",
              timestamp: new Date(timestamp),
              type: "txt",
              messageObj: { text: messageText },
              senderType: "client",
              isRead: false,
              isHandled: false,
            });
            await newMessage.save();
            console.log("Message saved successfully");
          } catch (error) {
            console.error("Error occurred while saving message:", error);
          }
        }
      }
    });
  } else {
    res.sendStatus(404);
  }
}

// webhook setup
export const getWebhook = (req, res) => {
  //  TODO: Update verify_token
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  // Parse params from the webhook verification request
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Respond with 200 OK and challenge token from the request
      console.log("WEBHOOK_VERIFIED");

      res.set("Content-Type", "text/plain");

      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
};

// handle sending messages
export async function send(req, res) {
  const { platform, recipientId, messageText } = req.body;

  try {
    let success = false;
    if (platform === "messenger") {
      // Correct recipientId format
      const recipientPSID = parseInt(recipientId);
      // success = await sendMessageToMessenger(recipientPSID, messageText);
      success = await sendMessageToMessenger(recipientId, messageText);
    } else if (platform === "instagram") {
      success = await sendMessageToInstagram(recipientId, messageText);
    } else {
      throw new Error("Invalid platform specified");
    }

    if (success) {
      res.status(200).send("Message sent successfully");
    } else {
      throw new Error("Failed to send message");
    }
  } catch (error) {
    console.error("Error sending message:", error.message);
    res.status(500).send("Error sending message");
  }
}

// send message via facebook messanger
async function sendMessageToMessenger(recipientId, messageText) {
  const requestBody = {
    recipient: {
      id: recipientId.toString(), // Convert recipientId to string
    },
    message: {
      text: messageText,
    },
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/v11.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to send message to Messenger");
    }

    console.log("Message sent successfully to Messenger");
    return true;
  } catch (error) {
    console.error("Error sending message to Messenger:", error.message);
    return false;
  }
}

// Function to send a message via Instagram
async function sendMessageToInstagram(recipientId, messageText) {
  try {
    //TODO  Instagram message sending logic here
    return true; // Return true if the message is sent successfully
  } catch (error) {
    console.error("Error sending message to Instagram:", error.message);
    return false; // Return false if there's an error sending the message
  }
}

function respondMessenger(sender_psid, response) {
  // Construct the message body
  let request_body = {
    recipient: {
      id: sender_psid,
    },
    message: { text: response },
  };

  // Send the HTTP request to the Messenger Platform
  request(
    {
      uri: "https://graph.facebook.com/v7.0/me/messages",
      qs: { access_token: process.env.FB_PAGE_TOKEN },
      method: "POST",
      json: request_body,
    },
    (err, res, body) => {
      if (!err) {
        console.log("message sent!");
      } else {
        console.error("Unable to send message:" + err);
      }
    }
  );
}