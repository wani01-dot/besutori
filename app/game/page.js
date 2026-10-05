"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  onValue,
  ref,
  update,
} from "firebase/database";
import { db } from "../../lib/firebase";
import "../style.css";

const RANDOM_TOPICS = [
  "好きなコンビニ飯",
  "好きなお菓子",
  "好きな飲み物",
  "好きな季節",
  "好きな曜日",
  "好きな時間帯",
  "好きな食べ物",
  "好きな果物",
  "好きなアイス",
  "好きなファストフード",
  "好きな寿司ネタ",
  "好きなラーメン",
  "好きなパン",
  "好きな麺料理",
  "好きな丼もの",
  "好きな鍋料理",
  "好きな朝ごはん",
  "好きな夜食",
  "旅行で行きたい場所",
  "住んでみたい都道府県",
  "行ってみたい国",
  "好きな観光地",
  "好きな乗り物",
  "好きな動物",
  "飼ってみたい動物",
  "好きな色",
  "好きな天気",
  "好きな香り",
  "好きなスポーツ",
  "やってみたいスポーツ",
  "好きな学校行事",
  "好きだった教科",
  "好きな漫画",
  "好きなアニメ",
  "好きな映画",
  "好きなドラマ",
  "好きなゲーム",
  "好きなYouTubeジャンル",
  "好きな音楽ジャンル",
  "カラオケで歌いたい曲",
  "無人島に持っていきたいもの",
  "一生無料なら嬉しいもの",
  "もらって嬉しいプレゼント",
  "テンションが上がる瞬間",
  "休日にしたいこと",
  "寝る前にしたいこと",
  "朝起きて最初にしたいこと",
  "生まれ変わったらなりたいもの",
  "使ってみたい超能力",
  "欲しいひみつ道具",
  "一番落ち着く場所",
  "つい買ってしまうもの",
  "コンビニで最初に見る場所",
  "お祭りで食べたいもの",
  "冬に食べたいもの",
  "夏に食べたいもの",
  "雨の日にしたいこと",
  "友達とやりたいこと",
  "デートで行きたい場所",
  "100万円あったら買いたいもの",
];

function shuffleArray(items) {
  const result = [...items];

  for (
    let i = result.length - 1;
    i > 0;
    i--
  ) {
    const j = Math.floor(
      Math.random() * (i + 1)
    );

    [result[i], result[j]] = [
      result[j],
      result[i],
    ];
  }

  return result;
}

function getPlayers(room) {
  return Object.values(
    room?.players || {}
  ).sort(
    (a, b) =>
      (a.joinedAt || 0) -
      (b.joinedAt || 0)
  );
}

export default function Game() {
  const router = useRouter();

  const [localRoom, setLocalRoom] =
    useState(null);

  const [room, setRoom] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [topic, setTopic] =
    useState("");

  const [first, setFirst] =
    useState("");

  const [second, setSecond] =
    useState("");

  const [third, setThird] =
    useState("");

  const [answerOrder, setAnswerOrder] =
    useState([]);

  const [submitting, setSubmitting] =
    useState(false);

  useEffect(() => {
    const saved =
      localStorage.getItem(
        "besutori-room"
      );

    if (!saved) {
      setLoading(false);
      return;
    }

    let parsed;

    try {
      parsed = JSON.parse(saved);
    } catch {
      localStorage.removeItem(
        "besutori-room"
      );

      setLoading(false);
      return;
    }

    if (!parsed?.roomCode) {
      setLoading(false);
      return;
    }

    setLocalRoom(parsed);

    const roomRef = ref(
      db,
      `rooms/${parsed.roomCode}`
    );

    const unsubscribe = onValue(
      roomRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setRoom(null);
          setLoading(false);
          return;
        }

        const nextRoom =
          snapshot.val();

        setRoom(nextRoom);
        setLoading(false);

        if (
          nextRoom.status ===
          "waiting"
        ) {
          router.replace("/room");
        }
      }
    );

    return () => unsubscribe();
  }, [router]);

  const players = useMemo(
    () => getPlayers(room),
    [room]
  );

  const game = room?.game || {};

  const phase =
    game.phase || "setting";

  const presenter = players.find(
    (player) =>
      player.id ===
      game.presenterId
  );

  const isPresenter =
    localRoom?.role === "player" &&
    localRoom?.playerId ===
      game.presenterId;

  const isSpectator =
    localRoom?.role === "spectator";

  const isHost =
    Boolean(localRoom?.isHost);

  const answers =
    game.answers || {};

  const answeringPlayers =
    players.filter(
      (player) =>
        player.id !==
        game.presenterId
    );

  const answerCount =
    Object.keys(answers).length;

  const allAnswered =
    answeringPlayers.length === 0 ||
    answeringPlayers.every(
      (player) =>
        Boolean(answers[player.id])
    );

  const myAnswer =
    localRoom?.playerId
      ? answers[
          localRoom.playerId
        ]
      : null;

  useEffect(() => {
    if (
      phase !== "answering" ||
      !game.options
    ) {
      return;
    }

    const options =
      Array.isArray(game.options)
        ? game.options
        : Object.values(
            game.options
          );

    if (
      options.length !== 3
    ) {
      return;
    }

    /*
      Firebaseのoptionsは既に
      出題時にシャッフル済み。
      全員に同じ初期順を表示する。
    */
    setAnswerOrder(options);
  }, [
    phase,
    game.round,
    game.options,
  ]);

  function randomTopic() {
    let nextTopic =
      RANDOM_TOPICS[
        Math.floor(
          Math.random() *
            RANDOM_TOPICS.length
        )
      ];

    if (
      RANDOM_TOPICS.length > 1 &&
      nextTopic === topic
    ) {
      const currentIndex =
        RANDOM_TOPICS.indexOf(
          nextTopic
        );

      nextTopic =
        RANDOM_TOPICS[
          (currentIndex + 1) %
            RANDOM_TOPICS.length
        ];
    }

    setTopic(nextTopic);
  }

  async function publishQuestion() {
    if (
      !isPresenter ||
      !localRoom?.roomCode ||
      submitting
    ) {
      return;
    }

    const cleanTopic =
      topic.trim();

    const ranking = [
      first.trim(),
      second.trim(),
      third.trim(),
    ];

    if (!cleanTopic) {
      alert(
        "お題を入力してください"
      );
      return;
    }

    if (
      ranking.some(
        (item) => !item
      )
    ) {
      alert(
        "1位〜3位をすべて入力してください"
      );
      return;
    }

    const normalized =
      ranking.map((item) =>
        item.toLowerCase()
      );

    if (
      new Set(normalized).size !== 3
    ) {
      alert(
        "1位〜3位には違う内容を入力してください"
      );
      return;
    }

    setSubmitting(true);

    try {
      const options =
        shuffleArray(ranking);

      await update(
        ref(
          db,
          `rooms/${localRoom.roomCode}/game`
        ),
        {
          phase: "answering",
          topic: cleanTopic,

          ranking: {
            first: ranking[0],
            second: ranking[1],
            third: ranking[2],
          },

          options,

          answers: null,
          revealed: false,
          updatedAt: Date.now(),
        }
      );
    } catch (error) {
      console.error(error);

      alert(
        "出題できませんでした"
      );
    } finally {
      setSubmitting(false);
    }
  }

  function moveAnswer(
    index,
    direction
  ) {
    if (myAnswer) {
      return;
    }

    const nextIndex =
      index + direction;

    if (
      nextIndex < 0 ||
      nextIndex >=
        answerOrder.length
    ) {
      return;
    }

    const next = [
      ...answerOrder,
    ];

    [next[index], next[nextIndex]] =
      [
        next[nextIndex],
        next[index],
      ];

    setAnswerOrder(next);
  }

  async function submitAnswer() {
    if (
      isPresenter ||
      isSpectator ||
      myAnswer ||
      submitting ||
      answerOrder.length !== 3
    ) {
      return;
    }

    setSubmitting(true);

    try {
      await update(
        ref(
          db,
          `rooms/${localRoom.roomCode}/game/answers/${localRoom.playerId}`
        ),
        {
          playerId:
            localRoom.playerId,

          playerName:
            localRoom.playerName ||
            localRoom.name ||
            "ゲスト",

          order: answerOrder,

          submittedAt:
            Date.now(),
        }
      );
    } catch (error) {
      console.error(error);

      alert(
        "回答を送信できませんでした"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function revealAnswers() {
    if (
      !isPresenter ||
      !allAnswered ||
      !localRoom?.roomCode
    ) {
      return;
    }

    try {
      await update(
        ref(
          db,
          `rooms/${localRoom.roomCode}/game`
        ),
        {
          phase: "result",
          revealed: true,
          revealedAt:
            Date.now(),
        }
      );
    } catch (error) {
      console.error(error);

      alert(
        "答え合わせを開始できませんでした"
      );
    }
  }

  function getCorrectCount(
    answer
  ) {
    if (!answer?.order) {
      return 0;
    }

    const correct = [
      game.ranking?.first,
      game.ranking?.second,
      game.ranking?.third,
    ];

    const order =
      Array.isArray(answer.order)
        ? answer.order
        : Object.values(
            answer.order
          );

    return correct.reduce(
      (count, item, index) =>
        item === order[index]
          ? count + 1
          : count,
      0
    );
  }

  async function nextRound() {
    if (
      !isPresenter ||
      !localRoom?.roomCode
    ) {
      return;
    }

    if (players.length === 0) {
      return;
    }

    const currentIndex =
      players.findIndex(
        (player) =>
          player.id ===
          game.presenterId
      );

    const nextIndex =
      currentIndex === -1
        ? 0
        : (currentIndex + 1) %
          players.length;

    const nextPresenter =
      players[nextIndex];

    try {
      await update(
        ref(
          db,
          `rooms/${localRoom.roomCode}/game`
        ),
        {
          round:
            Number(
              game.round || 1
            ) + 1,

          phase: "setting",

          presenterId:
            nextPresenter.id,

          topic: "",

          ranking: {
            first: "",
            second: "",
            third: "",
          },

          options: null,
          answers: null,
          revealed: false,
          updatedAt: Date.now(),
        }
      );

      setTopic("");
      setFirst("");
      setSecond("");
      setThird("");
      setAnswerOrder([]);
    } catch (error) {
      console.error(error);

      alert(
        "次のお題へ進めませんでした"
      );
    }
  }

  async function finishGame() {
    if (
      !isHost ||
      !localRoom?.roomCode
    ) {
      return;
    }

    const ok = window.confirm(
      "ゲームを終了してルームに戻りますか？"
    );

    if (!ok) {
      return;
    }

    try {
      await update(
        ref(
          db,
          `rooms/${localRoom.roomCode}`
        ),
        {
          status: "waiting",
          game: null,
        }
      );

      router.replace("/room");
    } catch (error) {
      console.error(error);

      alert(
        "ゲームを終了できませんでした"
      );
    }
  }

  if (loading) {
    return (
      <main className="app">
        <section className="screen">
          <div className="emptyRoom">
            <h1>
              ゲームを読み込んでいます
            </h1>
          </div>
        </section>
      </main>
    );
  }

  if (
    !localRoom ||
    !room ||
    !room.game
  ) {
    return (
      <main className="app">
        <section className="screen">
          <div className="emptyRoom">
            <h1>
              ゲームが見つかりません
            </h1>

            <Link
              href="/"
              className="emptyRoomButton"
            >
              ホームへ戻る
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app">
      <section className="screen gameScreen">
        <header className="gameHeader">
          <div>
            <span className="gameRound">
              ROUND{" "}
              {game.round || 1}
            </span>

            <strong>
              ベストリ
            </strong>
          </div>

          <button
            type="button"
            className="gameRoomCode"
            onClick={() => {
              navigator.clipboard?.writeText(
                localRoom.roomCode
              );
            }}
          >
            {localRoom.roomCode}
          </button>
        </header>

        <div className="gameContent">
          <div className="presenterCard">
            <span>
              今回の出題者
            </span>

            <strong>
              {presenter?.name ||
                "出題者"}
            </strong>
          </div>

          {phase ===
            "setting" && (
            <>
              {isPresenter ? (
                <PresenterSetting
                  topic={topic}
                  setTopic={setTopic}
                  randomTopic={
                    randomTopic
                  }
                  first={first}
                  setFirst={setFirst}
                  second={second}
                  setSecond={setSecond}
                  third={third}
                  setThird={setThird}
                  publishQuestion={
                    publishQuestion
                  }
                  submitting={
                    submitting
                  }
                />
              ) : (
                <WaitingCard
                  title={`${presenter?.name || "出題者"}がお題を考えています`}
                  text={
                    isSpectator
                      ? "観覧モードでお待ちください"
                      : "BEST3が決まるまで少し待ってね"
                  }
                />
              )}
            </>
          )}

          {phase ===
            "answering" && (
            <>
              <div className="topicCard">
                <span>
                  今回のお題
                </span>

                <h2>
                  {game.topic}
                </h2>
              </div>

              {isPresenter ? (
                <PresenterWaiting
                  answerCount={
                    answerCount
                  }
                  total={
                    answeringPlayers.length
                  }
                  allAnswered={
                    allAnswered
                  }
                  revealAnswers={
                    revealAnswers
                  }
                />
              ) : isSpectator ? (
                <SpectatorWaiting
                  answerCount={
                    answerCount
                  }
                  total={
                    answeringPlayers.length
                  }
                />
              ) : myAnswer ? (
                <AnsweredWaiting
                  answer={myAnswer}
                  answerCount={
                    answerCount
                  }
                  total={
                    answeringPlayers.length
                  }
                />
              ) : (
                <AnswerArea
                  answerOrder={
                    answerOrder
                  }
                  moveAnswer={
                    moveAnswer
                  }
                  submitAnswer={
                    submitAnswer
                  }
                  submitting={
                    submitting
                  }
                />
              )}
            </>
          )}

          {phase ===
            "result" && (
            <ResultArea
              game={game}
              players={players}
              presenter={
                presenter
              }
              answers={answers}
              getCorrectCount={
                getCorrectCount
              }
              isPresenter={
                isPresenter
              }
              nextRound={
                nextRound
              }
            />
          )}

          {isHost && (
            <button
              type="button"
              className="finishGameButton"
              onClick={finishGame}
            >
              ゲームを終了
            </button>
          )}
        </div>
      </section>
    </main>
  );
}

function PresenterSetting({
  topic,
  setTopic,
  randomTopic,
  first,
  setFirst,
  second,
  setSecond,
  third,
  setThird,
  publishQuestion,
  submitting,
}) {
  return (
    <div className="gamePanel">
      <div className="gameSectionTitle">
        お題を決めよう
      </div>

      <p className="gameHelp">
        自分で入力するか、
        ランダムボタンで決められます
      </p>

      <input
        className="textInput gameTopicInput"
        value={topic}
        onChange={(event) =>
          setTopic(
            event.target.value
          )
        }
        placeholder="例：好きなコンビニ飯"
        maxLength={40}
      />

      <button
        type="button"
        className="randomTopicButton"
        onClick={randomTopic}
      >
        <span>🎲</span>
        ランダムで決める
      </button>

      <div className="rankingEditor">
        <div className="rankingInputRow firstRank">
          <span className="rankMedal">
            1
          </span>

          <div>
            <label>
              1位
            </label>

            <input
              value={first}
              onChange={(event) =>
                setFirst(
                  event.target.value
                )
              }
              placeholder="1番好きなもの"
              maxLength={30}
            />
          </div>
        </div>

        <div className="rankingInputRow secondRank">
          <span className="rankMedal">
            2
          </span>

          <div>
            <label>
              2位
            </label>

            <input
              value={second}
              onChange={(event) =>
                setSecond(
                  event.target.value
                )
              }
              placeholder="2番目"
              maxLength={30}
            />
          </div>
        </div>

        <div className="rankingInputRow thirdRank">
          <span className="rankMedal">
            3
          </span>

          <div>
            <label>
              3位
            </label>

            <input
              value={third}
              onChange={(event) =>
                setThird(
                  event.target.value
                )
              }
              placeholder="3番目"
              maxLength={30}
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        className="publishQuestionButton"
        onClick={publishQuestion}
        disabled={submitting}
      >
        {submitting
          ? "出題中..."
          : "この内容で出題する"}
      </button>
    </div>
  );
}

function WaitingCard({
  title,
  text,
}) {
  return (
    <div className="gameWaitingCard">
      <div className="waitingDots">
        <span />
        <span />
        <span />
      </div>

      <h2>{title}</h2>

      <p>{text}</p>
    </div>
  );
}

function AnswerArea({
  answerOrder,
  moveAnswer,
  submitAnswer,
  submitting,
}) {
  return (
    <div className="gamePanel">
      <div className="gameSectionTitle">
        順位を予想しよう
      </div>

      <p className="gameHelp">
        ▲ ▼ で並べ替えて、
        出題者の1〜3位を当てよう
      </p>

      <div className="answerRanking">
        {answerOrder.map(
          (item, index) => (
            <div
              className="answerRankCard"
              key={`${item}-${index}`}
            >
              <div className="answerRankNumber">
                {index + 1}
              </div>

              <strong>
                {item}
              </strong>

              <div className="answerMoveButtons">
                <button
                  type="button"
                  onClick={() =>
                    moveAnswer(
                      index,
                      -1
                    )
                  }
                  disabled={
                    index === 0
                  }
                  aria-label="上へ"
                >
                  ▲
                </button>

                <button
                  type="button"
                  onClick={() =>
                    moveAnswer(
                      index,
                      1
                    )
                  }
                  disabled={
                    index ===
                    answerOrder.length -
                      1
                  }
                  aria-label="下へ"
                >
                  ▼
                </button>
              </div>
            </div>
          )
        )}
      </div>

      <button
        type="button"
        className="submitAnswerButton"
        onClick={submitAnswer}
        disabled={
          submitting ||
          answerOrder.length !== 3
        }
      >
        {submitting
          ? "回答中..."
          : "この順位で回答する"}
      </button>
    </div>
  );
}

function PresenterWaiting({
  answerCount,
  total,
  allAnswered,
  revealAnswers,
}) {
  return (
    <div className="gamePanel">
      <div className="gameSectionTitle">
        みんなの回答待ち
      </div>

      <div className="answerProgress">
        <strong>
          {answerCount}
        </strong>

        <span>
          / {total}人 回答済み
        </span>
      </div>

      <div className="progressBar">
        <span
          style={{
            width:
              total === 0
                ? "100%"
                : `${Math.min(
                    100,
                    (answerCount /
                      total) *
                      100
                  )}%`,
          }}
        />
      </div>

      <p className="gameHelp">
        回答が揃うと
        答え合わせできます
      </p>

      <button
        type="button"
        className="revealButton"
        onClick={revealAnswers}
        disabled={!allAnswered}
      >
        {allAnswered
          ? "答え合わせ！"
          : "回答を待っています"}
      </button>
    </div>
  );
}

function SpectatorWaiting({
  answerCount,
  total,
}) {
  return (
    <div className="gameWaitingCard">
      <div className="spectatorGameIcon">
        👀
      </div>

      <h2>
        回答を観覧中
      </h2>

      <p>
        {answerCount} / {total}人
        が回答しました
      </p>
    </div>
  );
}

function AnsweredWaiting({
  answer,
  answerCount,
  total,
}) {
  const order =
    Array.isArray(answer.order)
      ? answer.order
      : Object.values(
          answer.order || {}
        );

  return (
    <div className="gamePanel">
      <div className="answeredBadge">
        ✓ 回答しました
      </div>

      <div className="submittedRanking">
        {order.map(
          (item, index) => (
            <div key={item}>
              <span>
                {index + 1}
              </span>

              <strong>
                {item}
              </strong>
            </div>
          )
        )}
      </div>

      <p className="gameHelp">
        {answerCount} / {total}人
        回答済み
        <br />
        答え合わせを待っています
      </p>
    </div>
  );
}

function ResultArea({
  game,
  players,
  presenter,
  answers,
  getCorrectCount,
  isPresenter,
  nextRound,
}) {
  const ranking = [
    game.ranking?.first,
    game.ranking?.second,
    game.ranking?.third,
  ];

  const answeringPlayers =
    players.filter(
      (player) =>
        player.id !==
        presenter?.id
    );

  return (
    <>
      <div className="resultTitle">
        <span>
          RESULT
        </span>

        <h2>
          答え合わせ！
        </h2>

        <p>
          {game.topic}
        </p>
      </div>

      <div className="correctRanking">
        {ranking.map(
          (item, index) => (
            <div
              className={`correctRank correctRank${index + 1}`}
              key={`${item}-${index}`}
            >
              <span>
                {index + 1}
              </span>

              <strong>
                {item}
              </strong>
            </div>
          )
        )}
      </div>

      <div className="resultPlayers">
        <h3>
          みんなの結果
        </h3>

        {answeringPlayers.length ===
        0 ? (
          <div className="noAnswersResult">
            今回は回答者がいません
          </div>
        ) : (
          answeringPlayers.map(
            (player) => {
              const answer =
                answers[player.id];

              const correctCount =
                getCorrectCount(
                  answer
                );

              return (
                <div
                  className="resultPlayer"
                  key={player.id}
                >
                  <div>
                    <span className="resultAvatar">
                      {(player.name ||
                        "?").slice(
                        0,
                        1
                      )}
                    </span>

                    <strong>
                      {player.name}
                    </strong>
                  </div>

                  <div
                    className={
                      correctCount ===
                      3
                        ? "resultScore perfect"
                        : "resultScore"
                    }
                  >
                    <strong>
                      {correctCount}
                      /3
                    </strong>

                    {correctCount ===
                      3 && (
                      <span>
                        PERFECT!
                      </span>
                    )}
                  </div>
                </div>
              );
            }
          )
        )}
      </div>

      {isPresenter ? (
        <button
          type="button"
          className="nextRoundButton"
          onClick={nextRound}
        >
          次のお題へ
        </button>
      ) : (
        <div className="nextRoundWaiting">
          出題者が次のお題へ
          進むのを待っています
        </div>
      )}
    </>
  );
}
