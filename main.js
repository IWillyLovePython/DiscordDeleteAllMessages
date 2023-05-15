const uid = "";
const cid = "";
const token = "";
const cooldown = 120000;

function deleteMessage(messageId) {
  return fetch(`https://discord.com/api/v9/channels/${cid}/messages/${messageId}`, {
    headers: {
      authorization: token
    },
    method: "DELETE"
  })
    .then(response => {
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        const delay = retryAfter === "1" ? cooldown : retryAfter * 1000;
        console.log(`[429] Ratelimited | ${delay} Cooldown`);

        return new Promise(resolve => setTimeout(resolve, delay)).then(() =>
          deleteMessage(messageId)
        );
      }
    });
}

function start() {
  fetch(`https://discord.com/api/v9/channels/${cid}/messages/search?author_id=${uid}`, {
    headers: {
      authorization: token
    },
    method: "GET"
  })
    .then(response => response.json())
    .then(data => {
      const totalResults = data.total_results;
      const repetitions = Math.ceil(totalResults / 25);

      const deleteFunction = () => {
        for (let i = 0; i < repetitions; i++) {
          setTimeout(() => {
            fetchMessages(i);
          }, i * cooldown);
        }
      };

      const fetchMessages = (page) => {
        fetch(`https://discord.com/api/v9/channels/${cid}/messages/search?author_id=${uid}&page=${page}`, {
          headers: {
            authorization: token
          },
          method: "GET"
        })
          .then(response => response.json())
          .then(data => {
            const messageIds = data.messages.map(message => message[0].id);
            messageIds.forEach((messageId, index) => {
              setTimeout(() => {
                deleteMessage(messageId);
                console.log(`Deleted Message #${messageId}`);
              }, (index + 1) * 1000);
            });
          });
      };

      deleteFunction();
    });
}

start();
