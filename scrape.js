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
  console.log('🔍 GAME_ID из ENV:', process.env.GAME_ID);
  console.log('🔍 LEAGUE из ENV:', process.env.LEAGUE);

  const id     = process.env.GAME_ID;
  const league = process.env.LEAGUE;

  if (!id || !league) {
    console.error('⛔ GAME_ID или LEAGUE не переданы');
    return;
  }

  const url = `https://site.web.api.espn.com/apis/v2/sports/basketball/${league}/summary?event=${id}`;
  console.log('📡 GET', url);

  const res = await fetch(url);
  if (!res.ok) {
    console.log('⚠️ ESPN вернул статус', res.status, '— boxscore недоступен');
    return;
  }

  const j = await res.json();
  if (!j.boxscore || !j.boxscore.teams) {
  console.log('⛔ boxscore.teams отсутствует или пуст');
} else {
  console.log('📦 Содержимое boxscore.teams:', JSON.stringify(j.boxscore.teams, null, 2));
  }
  console.log('📦 j.boxscore.teams =', JSON.stringify(j.boxscore?.teams, null, 2));
  if (!j.boxscore || !j.boxscore.teams) {
    console.log('⚠️ Нет блока boxscore.teams — выходим без ошибки');
    return;
  }
  console.log(JSON.stringify(j.boxscore.teams, null, 2));
  const extract = key =>
  j.boxscore.teams.reduce((sum, t) => {
    const m = (t.statistics || []).find(s => s.name === key);
    return sum + (m?.value ? Number(m.value) : 0);
  }, 0);

const out = {
  FGA: extract('fgAtt'),
  FTA: extract('freeThrowAtt'),
  TOV: extract('turnovers'),
  ORB: extract('offReb'),
  PTS: extract('points'),
  ts: new Date().toISOString()
};

  fs.mkdirSync('live', { recursive: true });
  fs.writeFileSync('live/box.json', JSON.stringify(out, null, 2));
  console.log('✅ live/box.json обновлён');
})();
