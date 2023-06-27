const axios = require("axios");
const dayjs = require("dayjs");
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});
const discordApiUrl = "https://discord.com/api/v10";

const logErrorMessage = e => {
  console.log("Sorry, something went wrong:");
  console.log(e.message);
};


// Set variables to be collected
const variables = [
  {name: "token", display: "bot token"},
  {name: "userId", display: "Discord user ID"},
  {name: "messageId", display: "Message ID (leave blank for most recent 50 messages)"}
];
// Create object to store values
const inputs = {};

// Gather the specified input
const gatherInput = async (i = 0) => {
  const variable = variables[i];
  // If no variable name (i.e. at the end of the
  // array: call the handler
  if(!variable?.name){
    return handleInputs(readline, inputs);
  }

  // Otherwise: prompt user and save result,
  // then gather the input for the next variable
  const prompt = `\nEnter ${variable.display}:\n  `
  readline.question(prompt, input => {
    inputs[variable.name] = input.trim();
    gatherInput(i+1);
  });
};



const handleInputs = (readline, inputs) => {
  readline.close();
  const {token, userId, messageId} = inputs;
  
  // Simple function to display messages nicely
  const displayMessages = messageArray => {
    if(!Array.isArray(messageArray)){
      messageArray = [messageArray];
    }
    
    console.log();
    console.log("*".repeat(50));
    console.log("*".repeat(50));
    console.log("*".repeat(50));
    console.log();

    messageArray
      .reverse()
      .forEach(message =>
        console.log(`(${dayjs(message.timestamp).format("M/D/YY, H:mm:ss")})\n${message.author.username}#${message.author.discriminator}:\n  ${message.content}\n`)
      );
    console.log();
  };

  // Set auth headers with bot token
  const headers = {
    Authorization: `Bot ${token}`
  };

  // Get DM channel ID
  axios.post(
    `${discordApiUrl}/users/@me/channels`,
    {
      recipient_id: userId
    },
    {headers}
  )
    .then(rsp => {
      const dmChannelId = rsp?.data?.id;
      const messageUrl = `${discordApiUrl}/channels/${dmChannelId}/messages`
        + (messageId ? `/${messageId}` : "");
        
      axios.get(
        messageUrl,
        {headers}
      )
        .then(rsp => displayMessages(rsp.data))
        .catch(logErrorMessage);
    })
    .catch(logErrorMessage);
};

gatherInput();
