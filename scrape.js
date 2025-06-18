const fs    = require("fs");

const league = process.env.LEAGUE  || "nba";
const id     = process.env.GAME_ID || "401661615";
const url    = `https://site.web.api.espn.com/apis/v2/sports/basketball/${league}/summary?event=${id}`;

(async () => {
  const j  = await (await fetch(url)).json();
  if (!j.boxscore || !j.boxscore.teams) {
  console.error("ESPN не вернул данные boxscore — возможно, матч ещё не начался или ID неверный.");
  process.exit(1);
  }
  const t  = j.boxscore.teams;
  if (!j.boxscore || !j.boxscore.teams) {

  const sum = k => t.reduce((s,tm)=>
                s + Number(tm.statistics.find(x=>x.name===k).value),0);

  const out = {
    FGA: sum("FGA"),
    FTA: sum("FTA"),
    TOV: sum("TO"),
    ORB: sum("OREB"),
    PTS: sum("PTS"),
    ts : new Date().toISOString()
  };
  fs.mkdirSync("live", { recursive:true });
  fs.writeFileSync("live/box.json", JSON.stringify(out,null,2));
  }
