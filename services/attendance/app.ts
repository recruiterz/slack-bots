import { createMessageAdapter } from '@slack/interactive-messages';
import { WebClient } from '@slack/web-api';
import { config } from 'dotenv';
import { scheduleJob } from 'node-schedule';

const env = process.env.NODE_ENV ?? 'development';

config({
  path: `.env.${env}`,
});

const port = process.env.PORT != null ? Number(process.env.PORT) : 3000;
const client = new WebClient(process.env.SLACK_BOT_ACCESS_TOKEN);
const slackInteractions = createMessageAdapter(process.env.SLACK_SIGNING_SECRET);

async function main() {
  // Listening on path '/slack/actions' by default
  const server = await slackInteractions.start(port);

  slackInteractions.action({ type: 'button' }, ({ actions, channel, message, user }) => {
    let messageText = `<@${user.id}> 다음에 참석할게요 :man-gesturing-no:`;

    if (actions[0].value === 'true') {
      messageText = `<@${user.id}> 참석합니다 :man-raising-hand:`;
    }

    client.chat.postMessage({
      channel: channel.id,
      text: messageText,
      thread_ts: message.ts,
    });
  });

  console.log(`server listening on port ${server.address().port}`);
}

main();

// NOTE: 매주 월/수요일 오전 10시에 스터디 참석 확인 메시지를 보낸다.
scheduleJob('0 10 * * 1,3', async () => {
  await client.chat.postMessage({
    channel: '#general',
    text: '오늘 스터디 가능하신분?! :raised_hands:',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'plain_text',
          text: '오늘 스터디 가능하신분?! :raised_hands:',
          emoji: true,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: ':white_check_mark: 가능해요',
              emoji: true,
            },
            value: 'true',
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: ':negative_squared_cross_mark: 오늘은 어려워요',
              emoji: true,
            },
            value: 'false',
          },
        ],
      },
    ],
  });
});
