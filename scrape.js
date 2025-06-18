const fs = require('fs');

const league = process.env.LEAGUE  || 'nba';
const id     = process.env.GAME_ID || '401661615';

const url = `https://site.web.api.espn.com/apis/v2/sports/basketball/${league}/summary?event=${id}`;

(async () => {
  try {
    const res = await fetch(url);
    const j   = await res.json();

    if (!j.boxscore || !j.boxscore.teams) {
      console.log("🎈 Данных пока нет — матч ещё не начался или ID неактивен. Ждём следующий запуск.");
      process.exit(0);  // ← мягкое завершение без ошибки
    }

    const t = j.boxscore.teams;
    const sum = k => t.reduce((s, tm) =>
      s + Number(tm.statistics.find(x => x.name === k)?.value || 0), 0);

    const out = {
      FGA: sum("FGA"),
      FTA: sum("FTA"),
      TOV: sum("TO"),
      ORB: sum("OREB"),
      PTS: sum("PTS"),
      ts : new Date().toISOString()
    };

    fs.mkdirSync('live', { recursive: true });
    fs.writeFileSync('live/box.json', JSON.stringify(out, null, 2));
    console.log("✅ Успешно обновлён box.json");
  } catch (e) {
    console.error("⚠️ Ошибка при выполнении запроса:", e);
    process.exit(0);  // ← даже при ошибке завершаем без сбоя
  }
})();
