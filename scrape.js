const fs = require('fs');
const https = require('https');

global.fetch ??= (...args) =>
  import('node:https').then(({ request }) =>
    new Promise((res, rej) => {
      const url = new URL(args[0]);
      const options = { method: 'GET', headers: { 'User-Agent': 'GH-Action' } };
      request(url, options, r => {
        let data = '';
        r.on('data', c => (data += c));
        r.on('end', () => res({ ok: r.statusCode === 200, json: () => JSON.parse(data) }));
      }).on('error', rej).end();
    })
  );

(async () => {
  const id = process.env.GAME_ID;
  const league = process.env.LEAGUE;
  if (!id || !league) throw new Error('env не переданы');

  const url = `https://site.web.api.espn.com/apis/v2/sports/basketball/${league}/summary?event=${id}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('ESPN вернул статус ' + res.status);

  const j = await res.json();
  if (!j.boxscore) {
    console.log('boxscore ещё пуст — выходим без ошибки');
    return;
  }

  const need = k =>
    j.boxscore.teams.reduce((sum, t) => {
      const m = t.statistics.find(s => s.name === k);
      return sum + (m ? Number(m.value) : 0);
    }, 0);

  const out = {
    FGA: need('FGA'),
    FTA: need('FTA'),
    TOV: need('TO'),
    ORB: need('OREB'),
    PTS: need('PTS'),
    ts: new Date().toISOString()
  };

  fs.mkdirSync('live', { recursive: true });
  fs.writeFileSync('live/box.json', JSON.stringify(out, null, 2));
  console.log('✅ live/box.json обновлён');
})();
