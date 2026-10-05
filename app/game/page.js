"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
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

function getOptionColorIndex(
  options,
  item
) {
  const index =
    options.indexOf(item);

  return index >= 0
    ? index
    : 0;
}

function normalizeOrder(order) {
  if (!order) {
    return [];
  }

  return Array.isArray(order)
    ? order
    : Object.values(order);
}

/* ================================
   SOUND
================================ */

let sharedAudioContext = null;

function getAudioContext() {
  if (
    typeof window === "undefined"
  ) {
    return null;
  }

  const AudioContext =
    window.AudioContext ||
    window.webkitAudioContext;

  if (!AudioContext) {
    return null;
  }

  if (!sharedAudioContext) {
    sharedAudioContext =
      new AudioContext();
  }

  return sharedAudioContext;
}

function unlockAudio() {
  const ctx = getAudioContext();

  if (
    ctx &&
    ctx.state === "suspended"
  ) {
    ctx.resume().catch(() => {});
  }
}

function makeTone(
  ctx,
  {
    time = 0,
    frequency = 440,
    endFrequency = frequency,
    duration = 0.15,
    volume = 0.1,
    type = "sine",
  }
) {
  const osc =
    ctx.createOscillator();

  const gain =
    ctx.createGain();

  const start =
    ctx.currentTime + time;

  const end =
    start + duration;

  osc.type = type;

  osc.frequency.setValueAtTime(
    frequency,
    start
  );

  osc.frequency.exponentialRampToValueAtTime(
    Math.max(
      1,
      endFrequency
    ),
    end
  );

  gain.gain.setValueAtTime(
    0.0001,
    start
  );

  gain.gain.exponentialRampToValueAtTime(
    volume,
    start + 0.008
  );

  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    end
  );

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(start);
  osc.stop(end + 0.03);
}

function playThirdSound(enabled) {
  if (!enabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  unlockAudio();

  makeTone(ctx, {
    frequency: 620,
    endFrequency: 850,
    duration: 0.12,
    volume: 0.12,
    type: "triangle",
  });

  makeTone(ctx, {
    time: 0.06,
    frequency: 850,
    endFrequency: 1080,
    duration: 0.12,
    volume: 0.09,
    type: "triangle",
  });
}

function playSuspenseSound(
  enabled
) {
  if (!enabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  unlockAudio();

  makeTone(ctx, {
    frequency: 210,
    endFrequency: 430,
    duration: 0.25,
    volume: 0.065,
    type: "triangle",
  });

  makeTone(ctx, {
    time: 0.11,
    frequency: 320,
    endFrequency: 590,
    duration: 0.22,
    volume: 0.05,
    type: "triangle",
  });
}

function playDonSound(
  enabled,
  strong = false
) {
  if (!enabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  unlockAudio();

  makeTone(ctx, {
    frequency: strong
      ? 175
      : 145,
    endFrequency: 48,
    duration: strong
      ? 0.28
      : 0.21,
    volume: strong
      ? 0.34
      : 0.25,
    type: "sine",
  });

  makeTone(ctx, {
    frequency: strong
      ? 95
      : 110,
    endFrequency: 42,
    duration: 0.24,
    volume: strong
      ? 0.24
      : 0.16,
    type: "sine",
  });

  const notes = strong
    ? [
        784,
        988,
        1175,
        1568,
      ]
    : [
        659,
        831,
        1047,
      ];

  notes.forEach(
    (
      frequency,
      index
    ) => {
      makeTone(ctx, {
        time:
          0.025 +
          index * 0.04,
        frequency,
        endFrequency:
          frequency * 1.02,
        duration: strong
          ? 0.28
          : 0.18,
        volume: strong
          ? 0.08
          : 0.055,
        type: "triangle",
      });
    }
  );
}

function playPerfectSound(
  enabled
) {
  if (!enabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  unlockAudio();

  [
    988,
    1175,
    1568,
    2093,
  ].forEach(
    (
      frequency,
      index
    ) => {
      makeTone(ctx, {
        time:
          index * 0.055,
        frequency,
        endFrequency:
          frequency * 1.03,
        duration: 0.22,
        volume: 0.065,
        type: "triangle",
      });
    }
  );
}

/* ================================
   GAME
================================ */

export default function Game() {
  const router = useRouter();

  const [
    localRoom,
    setLocalRoom,
  ] = useState(null);

  const [
    room,
    setRoom,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    topic,
    setTopic,
  ] = useState("");

  const [
    first,
    setFirst,
  ] = useState("");

  const [
    second,
    setSecond,
  ] = useState("");

  const [
    third,
    setThird,
  ] = useState("");

  const [
    answerOrder,
    setAnswerOrder,
  ] = useState([
    null,
    null,
    null,
  ]);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    soundEnabled,
    setSoundEnabled,
  ] = useState(true);

  useEffect(() => {
    const savedSound =
      localStorage.getItem(
        "besutori-sound"
      );

    if (
      savedSound === "off"
    ) {
      setSoundEnabled(false);
    }

    const unlock = () => {
      if (
        localStorage.getItem(
          "besutori-sound"
        ) !== "off"
      ) {
        unlockAudio();
      }
    };

    window.addEventListener(
      "pointerdown",
      unlock,
      { once: true }
    );

    return () => {
      window.removeEventListener(
        "pointerdown",
        unlock
      );
    };
  }, []);

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
      parsed =
        JSON.parse(saved);
    } catch {
      localStorage.removeItem(
        "besutori-room"
      );

      setLoading(false);
      return;
    }

    if (
      !parsed?.roomCode
    ) {
      setLoading(false);
      return;
    }

    setLocalRoom(parsed);

    const roomRef = ref(
      db,
      `rooms/${parsed.roomCode}`
    );

    const unsubscribe =
      onValue(
        roomRef,
        (snapshot) => {
          if (
            !snapshot.exists()
          ) {
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
            router.replace(
              "/room"
            );
          }
        }
      );

    return () =>
      unsubscribe();
  }, [router]);

  const players =
    useMemo(
      () => getPlayers(room),
      [room]
    );

  const game =
    room?.game || {};

  const phase =
    game.phase ||
    "setting";

  const presenter =
    players.find(
      (player) =>
        player.id ===
        game.presenterId
    );

  const isPresenter =
    localRoom?.role ===
      "player" &&
    localRoom?.playerId ===
      game.presenterId;

  const isSpectator =
    localRoom?.role ===
    "spectator";

  const isHost =
    Boolean(
      localRoom?.isHost
    );

  const answers =
    game.answers || {};

  const answeringPlayers =
    players.filter(
      (player) =>
        player.id !==
        game.presenterId
    );

  const answerCount =
    Object.keys(
      answers
    ).length;

  const allAnswered =
    answeringPlayers.length ===
      0 ||
    answeringPlayers.every(
      (player) =>
        Boolean(
          answers[
            player.id
          ]
        )
    );

  const myAnswer =
    localRoom?.playerId
      ? answers[
          localRoom.playerId
        ]
      : null;

  const options =
    useMemo(() => {
      if (
        !game.options
      ) {
        return [];
      }

      return Array.isArray(
        game.options
      )
        ? game.options
        : Object.values(
            game.options
          );
    }, [game.options]);

  useEffect(() => {
    if (
      phase !==
      "answering"
    ) {
      return;
    }

    setAnswerOrder([
      null,
      null,
      null,
    ]);
  }, [
    phase,
    game.round,
    game.options,
  ]);

  function toggleSound() {
    const next =
      !soundEnabled;

    setSoundEnabled(next);

    localStorage.setItem(
      "besutori-sound",
      next
        ? "on"
        : "off"
    );

    if (next) {
      unlockAudio();

      setTimeout(() => {
        playThirdSound(true);
      }, 20);
    }
  }

  function randomTopic() {
    let nextTopic =
      RANDOM_TOPICS[
        Math.floor(
          Math.random() *
            RANDOM_TOPICS.length
        )
      ];

    if (
      RANDOM_TOPICS.length >
        1 &&
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
      ranking.map(
        (item) =>
          item.toLowerCase()
      );

    if (
      new Set(
        normalized
      ).size !== 3
    ) {
      alert(
        "1位〜3位には違う内容を入力してください"
      );
      return;
    }

    setSubmitting(true);

    try {
      const nextOptions =
        shuffleArray(
          ranking
        );

      await update(
        ref(
          db,
          `rooms/${localRoom.roomCode}/game`
        ),
        {
          phase:
            "answering",

          topic:
            cleanTopic,

          ranking: {
            first:
              ranking[0],
            second:
              ranking[1],
            third:
              ranking[2],
          },

          options:
            nextOptions,

          answers: null,

          revealed:
            false,

          updatedAt:
            Date.now(),
        }
      );
    } catch (error) {
      console.error(
        error
      );

      alert(
        "出題できませんでした"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function submitAnswer() {
    const completed =
      answerOrder.every(
        Boolean
      );

    if (
      isPresenter ||
      isSpectator ||
      myAnswer ||
      submitting ||
      !completed
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

          order:
            answerOrder,

          submittedAt:
            Date.now(),
        }
      );
    } catch (error) {
      console.error(
        error
      );

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

    unlockAudio();

    try {
      await update(
        ref(
          db,
          `rooms/${localRoom.roomCode}/game`
        ),
        {
          phase:
            "result",

          revealed:
            true,

          revealedAt:
            Date.now(),
        }
      );
    } catch (error) {
      console.error(
        error
      );

      alert(
        "答え合わせを開始できませんでした"
      );
    }
  }

  function getCorrectCount(
    answer
  ) {
    if (
      !answer?.order
    ) {
      return 0;
    }

    const correct = [
      game.ranking?.first,
      game.ranking?.second,
      game.ranking?.third,
    ];

    const order =
      normalizeOrder(
        answer.order
      );

    return correct.reduce(
      (
        count,
        item,
        index
      ) =>
        item ===
        order[index]
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

    if (
      players.length === 0
    ) {
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

          phase:
            "setting",

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

          revealed:
            false,

          updatedAt:
            Date.now(),
        }
      );

      setTopic("");
      setFirst("");
      setSecond("");
      setThird("");

      setAnswerOrder([
        null,
        null,
        null,
      ]);
    } catch (error) {
      console.error(
        error
      );

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

    const ok =
      window.confirm(
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
          status:
            "waiting",
          game: null,
        }
      );

      router.replace(
        "/room"
      );
    } catch (error) {
      console.error(
        error
      );

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

          <div className="gameHeaderActions">
            <button
              type="button"
              className="soundToggleButton"
              onClick={
                toggleSound
              }
              aria-label={
                soundEnabled
                  ? "効果音をオフ"
                  : "効果音をオン"
              }
            >
              {soundEnabled
                ? "🔊"
                : "🔇"}
            </button>

            <button
              type="button"
              className="gameRoomCode"
              onClick={() => {
                navigator.clipboard?.writeText(
                  localRoom.roomCode
                );
              }}
            >
              {
                localRoom.roomCode
              }
            </button>
          </div>
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
                  topic={
                    topic
                  }
                  setTopic={
                    setTopic
                  }
                  randomTopic={
                    randomTopic
                  }
                  first={
                    first
                  }
                  setFirst={
                    setFirst
                  }
                  second={
                    second
                  }
                  setSecond={
                    setSecond
                  }
                  third={
                    third
                  }
                  setThird={
                    setThird
                  }
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
                  answer={
                    myAnswer
                  }
                  answerCount={
                    answerCount
                  }
                  total={
                    answeringPlayers.length
                  }
                  options={
                    options
                  }
                />
              ) : (
                <AnswerArea
                  options={
                    options
                  }
                  answerOrder={
                    answerOrder
                  }
                  setAnswerOrder={
                    setAnswerOrder
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
            <ResultReveal
              game={game}
              players={
                players
              }
              presenter={
                presenter
              }
              answers={
                answers
              }
              options={
                options
              }
              getCorrectCount={
                getCorrectCount
              }
              isPresenter={
                isPresenter
              }
              nextRound={
                nextRound
              }
              soundEnabled={
                soundEnabled
              }
            />
          )}

          {isHost && (
            <button
              type="button"
              className="finishGameButton"
              onClick={
                finishGame
              }
            >
              ゲームを終了
            </button>
          )}
        </div>
      </section>
    </main>
  );
}

/* ================================
   PRESENTER
================================ */

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
        onChange={(
          event
        ) =>
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
        onClick={
          randomTopic
        }
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
              value={
                first
              }
              onChange={(
                event
              ) =>
                setFirst(
                  event
                    .target
                    .value
                )
              }
              placeholder="1番好きなもの"
              maxLength={
                30
              }
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
              value={
                second
              }
              onChange={(
                event
              ) =>
                setSecond(
                  event
                    .target
                    .value
                )
              }
              placeholder="2番目"
              maxLength={
                30
              }
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
              value={
                third
              }
              onChange={(
                event
              ) =>
                setThird(
                  event
                    .target
                    .value
                )
              }
              placeholder="3番目"
              maxLength={
                30
              }
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        className="publishQuestionButton"
        onClick={
          publishQuestion
        }
        disabled={
          submitting
        }
      >
        {submitting
          ? "出題中..."
          : "この内容で出題する"}
      </button>
    </div>
  );
}

/* ================================
   ANSWER
================================ */

function AnswerArea({
  options,
  answerOrder,
  setAnswerOrder,
  submitAnswer,
  submitting,
}) {
  const [
    dragging,
    setDragging,
  ] = useState(null);

  const [
    hoverRank,
    setHoverRank,
  ] = useState(null);

  const [
    selected,
    setSelected,
  ] = useState(null);

  const dragRef =
    useRef(null);

  const used =
    answerOrder.filter(
      Boolean
    );

  const remaining =
    options.filter(
      (item) =>
        !used.includes(
          item
        )
    );

  function placeItem(
    item,
    targetIndex
  ) {
    setAnswerOrder(
      (current) => {
        const next = [
          ...current,
        ];

        const oldIndex =
          next.indexOf(
            item
          );

        const targetItem =
          next[
            targetIndex
          ];

        if (
          oldIndex >= 0
        ) {
          next[
            oldIndex
          ] =
            targetItem ||
            null;
        }

        next[
          targetIndex
        ] = item;

        return next;
      }
    );

    setSelected(null);
  }

  function beginDrag(
    event,
    item
  ) {
    event.preventDefault();

    unlockAudio();

    dragRef.current = {
      item,
    };

    setDragging({
      item,
      x: event.clientX,
      y: event.clientY,
      colorIndex:
        getOptionColorIndex(
          options,
          item
        ),
    });

    event.currentTarget.setPointerCapture?.(
      event.pointerId
    );
  }

  function moveDrag(
    event
  ) {
    if (
      !dragRef.current
    ) {
      return;
    }

    event.preventDefault();

    setDragging(
      (current) =>
        current
          ? {
              ...current,
              x:
                event.clientX,
              y:
                event.clientY,
            }
          : current
    );

    const element =
      document.elementFromPoint(
        event.clientX,
        event.clientY
      );

    const slot =
      element?.closest?.(
        "[data-rank-slot]"
      );

    if (slot) {
      setHoverRank(
        Number(
          slot.dataset
            .rankSlot
        )
      );
    } else {
      setHoverRank(null);
    }
  }

  function endDrag(
    event
  ) {
    if (
      !dragRef.current
    ) {
      return;
    }

    const item =
      dragRef.current.item;

    const element =
      document.elementFromPoint(
        event.clientX,
        event.clientY
      );

    const slot =
      element?.closest?.(
        "[data-rank-slot]"
      );

    if (slot) {
      placeItem(
        item,
        Number(
          slot.dataset
            .rankSlot
        )
      );
    }

    dragRef.current =
      null;

    setDragging(null);
    setHoverRank(null);
  }

  function chooseItem(
    item
  ) {
    setSelected(
      selected === item
        ? null
        : item
    );
  }

  function chooseSlot(
    index
  ) {
    if (!selected) {
      return;
    }

    placeItem(
      selected,
      index
    );
  }

  const completed =
    answerOrder.every(
      Boolean
    );

  return (
    <div className="gamePanel dragAnswerPanel">
      <div className="gameSectionTitle">
        順位を予想しよう
      </div>

      <p className="gameHelp">
        カードを指でつかんで
        <br />
        1位〜3位の枠へ持っていこう
      </p>

      <div className="answerChoiceArea">
        <span className="answerChoiceLabel">
          選択肢
        </span>

        <div className="answerChoiceList">
          {remaining.length >
          0 ? (
            remaining.map(
              (item) => (
                <DraggableAnswerCard
                  key={
                    item
                  }
                  item={
                    item
                  }
                  colorIndex={
                    getOptionColorIndex(
                      options,
                      item
                    )
                  }
                  selected={
                    selected ===
                    item
                  }
                  onPointerDown={
                    beginDrag
                  }
                  onPointerMove={
                    moveDrag
                  }
                  onPointerUp={
                    endDrag
                  }
                  onPointerCancel={
                    endDrag
                  }
                  onClick={() =>
                    chooseItem(
                      item
                    )
                  }
                />
              )
            )
          ) : (
            <div className="allCardsPlaced">
              全部セットできた！
            </div>
          )}
        </div>
      </div>

      <div className="rankDropArea">
        {answerOrder.map(
          (
            item,
            index
          ) => {
            const colorIndex =
              item
                ? getOptionColorIndex(
                    options,
                    item
                  )
                : null;

            return (
              <div
                key={
                  index
                }
                data-rank-slot={
                  index
                }
                className={[
                  "rankDropSlot",
                  item
                    ? `slotColor${colorIndex + 1}`
                    : "",
                  hoverRank ===
                  index
                    ? "dragOver"
                    : "",
                  item
                    ? "filled"
                    : "",
                  selected
                    ? "tapReady"
                    : "",
                ]
                  .filter(
                    Boolean
                  )
                  .join(
                    " "
                  )}
                onClick={() =>
                  chooseSlot(
                    index
                  )
                }
              >
                <div className="dropRankBadge">
                  <strong>
                    {index +
                      1}
                  </strong>

                  <span>
                    位
                  </span>
                </div>

                {item ? (
                  <DraggableAnswerCard
                    item={
                      item
                    }
                    colorIndex={
                      colorIndex
                    }
                    selected={
                      selected ===
                      item
                    }
                    placed
                    onPointerDown={
                      beginDrag
                    }
                    onPointerMove={
                      moveDrag
                    }
                    onPointerUp={
                      endDrag
                    }
                    onPointerCancel={
                      endDrag
                    }
                    onClick={(
                      event
                    ) => {
                      event.stopPropagation();

                      chooseItem(
                        item
                      );
                    }}
                  />
                ) : (
                  <div className="dropPlaceholder">
                    <span>
                      ＋
                    </span>

                    ここに持ってくる
                  </div>
                )}
              </div>
            );
          }
        )}
      </div>

      <p className="dragHint">
        指で動かしにくい時は
        「カード → 順位枠」の順に
        タップしても入れられます
      </p>

      <button
        type="button"
        className="submitAnswerButton"
        onClick={
          submitAnswer
        }
        disabled={
          submitting ||
          !completed
        }
      >
        {submitting
          ? "回答中..."
          : completed
            ? "この順位で回答する"
            : "1位〜3位を決めよう"}
      </button>

      {dragging && (
        <div
          className={[
            "floatingAnswerCard",
            `answerColor${dragging.colorIndex + 1}`,
          ].join(" ")}
          style={{
            left:
              dragging.x,
            top:
              dragging.y,
          }}
        >
          <span className="dragGrip">
            ⋮⋮
          </span>

          <strong>
            {
              dragging.item
            }
          </strong>
        </div>
      )}
    </div>
  );
}

function DraggableAnswerCard({
  item,
  colorIndex = 0,
  selected,
  placed = false,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onClick,
}) {
  return (
    <button
      type="button"
      className={[
        "dragAnswerCard",
        `answerColor${colorIndex + 1}`,
        selected
          ? "selected"
          : "",
        placed
          ? "placed"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onPointerDown={(
        event
      ) =>
        onPointerDown(
          event,
          item
        )
      }
      onPointerMove={
        onPointerMove
      }
      onPointerUp={
        onPointerUp
      }
      onPointerCancel={
        onPointerCancel
      }
      onClick={
        onClick
      }
    >
      <span className="dragGrip">
        ⋮⋮
      </span>

      <strong>
        {item}
      </strong>

      {!placed && (
        <span className="dragMiniText">
          つかむ
        </span>
      )}
    </button>
  );
}

/* ================================
   WAITING
================================ */

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
        onClick={
          revealAnswers
        }
        disabled={
          !allAnswered
        }
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
        {answerCount} /{" "}
        {total}人
        が回答しました
      </p>
    </div>
  );
}

function AnsweredWaiting({
  answer,
  answerCount,
  total,
  options,
}) {
  const order =
    normalizeOrder(
      answer.order
    );

  return (
    <div className="gamePanel">
      <div className="answeredBadge">
        ✓ 回答しました
      </div>

      <div className="submittedRanking">
        {order.map(
          (
            item,
            index
          ) => {
            const colorIndex =
              getOptionColorIndex(
                options,
                item
              );

            return (
              <div
                key={
                  `${item}-${index}`
                }
                className={`submittedColor${colorIndex + 1}`}
              >
                <span>
                  {index +
                    1}
                </span>

                <strong>
                  {item}
                </strong>
              </div>
            );
          }
        )}
      </div>

      <p className="gameHelp">
        {answerCount} /{" "}
        {total}人
        回答済み
        <br />
        答え合わせを待っています
      </p>
    </div>
  );
}

/* ================================
   RESULT REVEAL
================================ */

function ResultReveal({
  game,
  players,
  presenter,
  answers,
  options,
  getCorrectCount,
  isPresenter,
  nextRound,
  soundEnabled,
}) {
  const [
    stage,
    setStage,
  ] = useState(
    "intro"
  );

  const playedRef =
    useRef(false);

  const ranking = [
    game.ranking?.first,
    game.ranking?.second,
    game.ranking?.third,
  ];

  useEffect(() => {
    if (
      playedRef.current
    ) {
      return;
    }

    playedRef.current =
      true;

    const timers = [];

    timers.push(
      setTimeout(() => {
        setStage(
          "third"
        );

        playThirdSound(
          soundEnabled
        );
      }, 650)
    );

    timers.push(
      setTimeout(() => {
        setStage(
          "suspense"
        );

        playSuspenseSound(
          soundEnabled
        );
      }, 1900)
    );

    timers.push(
      setTimeout(() => {
        setStage(
          "second"
        );

        playDonSound(
          soundEnabled,
          false
        );
      }, 2850)
    );

    timers.push(
      setTimeout(() => {
        setStage(
          "firstWait"
        );

        playSuspenseSound(
          soundEnabled
        );
      }, 3950)
    );

    timers.push(
      setTimeout(() => {
        setStage(
          "first"
        );

        playDonSound(
          soundEnabled,
          true
        );
      }, 4750)
    );

    timers.push(
      setTimeout(() => {
        setStage(
          "results"
        );

        const hasPerfect =
          Object.values(
            answers
          ).some(
            (answer) =>
              getCorrectCount(
                answer
              ) === 3
          );

        if (
          hasPerfect
        ) {
          playPerfectSound(
            soundEnabled
          );
        }
      }, 6500)
    );

    return () => {
      timers.forEach(
        clearTimeout
      );
    };
  }, []);

  if (
    stage !==
    "results"
  ) {
    return (
      <RevealStage
        stage={stage}
        ranking={
          ranking
        }
        topic={
          game.topic
        }
      />
    );
  }

  return (
    <ResultArea
      game={game}
      players={
        players
      }
      presenter={
        presenter
      }
      answers={
        answers
      }
      options={
        options
      }
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
  );
}

function RevealStage({
  stage,
  ranking,
  topic,
}) {
  const showThird = [
    "third",
    "suspense",
    "second",
    "firstWait",
    "first",
  ].includes(stage);

  const showSecond = [
    "second",
    "firstWait",
    "first",
  ].includes(stage);

  const showFirst =
    stage === "first";

  const isSuspense =
    stage ===
      "suspense" ||
    stage ===
      "firstWait";

  return (
    <div
      className={[
        "revealStage",
        `revealStage-${stage}`,
      ].join(" ")}
    >
      <div className="revealTopic">
        {topic}
      </div>

      {stage ===
        "intro" && (
        <div className="revealIntro">
          <span>
            RESULT
          </span>

          <h2>
            答え合わせ！
          </h2>
        </div>
      )}

      {isSuspense && (
        <div className="suspenseText">
          <span>
            そして……
          </span>
        </div>
      )}

      <div className="revealRanking">
        {showThird && (
          <RevealCard
            rank={3}
            item={
              ranking[2]
            }
            className="revealThird"
          />
        )}

        {showSecond && (
          <RevealCard
            rank={2}
            item={
              ranking[1]
            }
            className="revealSecond"
          />
        )}

        {showFirst && (
          <RevealCard
            rank={1}
            item={
              ranking[0]
            }
            className="revealFirst"
          />
        )}
      </div>

      {showFirst && (
        <Confetti />
      )}
    </div>
  );
}

function RevealCard({
  rank,
  item,
  className,
}) {
  return (
    <div
      className={`revealRankCard ${className}`}
    >
      {rank === 1 && (
        <div className="revealCrown">
          ♛
        </div>
      )}

      <div className="revealRankLabel">
        第{rank}位
      </div>

      <strong>
        {item}
      </strong>

      <span className="revealDon">
        {rank === 1
          ? "DON!!"
          : rank === 2
            ? "DON!"
            : ""}
      </span>
    </div>
  );
}

function Confetti() {
  return (
    <div
      className="confetti"
      aria-hidden="true"
    >
      {Array.from({
        length: 26,
      }).map(
        (
          _,
          index
        ) => (
          <span
            key={
              index
            }
            style={{
              "--i":
                index,

              "--x": `${
                4 +
                ((index *
                  37) %
                  92)
              }%`,

              "--delay": `${
                (index %
                  7) *
                0.045
              }s`,

              "--rotate": `${
                (index *
                  47) %
                360
              }deg`,
            }}
          />
        )
      )}
    </div>
  );
}

/* ================================
   FINAL RESULT
================================ */

function ResultArea({
  game,
  players,
  presenter,
  answers,
  options,
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
    <div className="finalResultAppear">
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
          (
            item,
            index
          ) => (
            <div
              className={`correctRank correctRank${index + 1}`}
              key={`${item}-${index}`}
            >
              <span>
                {index +
                  1}
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
            (
              player
            ) => {
              const answer =
                answers[
                  player.id
                ];

              const correctCount =
                getCorrectCount(
                  answer
                );

              const order =
                normalizeOrder(
                  answer?.order
                );

              return (
                <div
                  className={[
                    "resultPlayerDetail",
                    correctCount ===
                    3
                      ? "perfectPlayer"
                      : "",
                  ]
                    .filter(
                      Boolean
                    )
                    .join(
                      " "
                    )}
                  key={
                    player.id
                  }
                >
                  <div className="resultPlayerHeader">
                    <div className="resultPlayerIdentity">
                      <span className="resultAvatar">
                        {(player.name ||
                          "?").slice(
                          0,
                          1
                        )}
                      </span>

                      <strong>
                        {
                          player.name
                        }
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
                        {
                          correctCount
                        }
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

                  {answer &&
                  order.length >
                    0 ? (
                    <div className="playerAnswerRanking">
                      {order.map(
                        (
                          item,
                          index
                        ) => {
                          const isCorrect =
                            ranking[
                              index
                            ] ===
                            item;

                          const colorIndex =
                            getOptionColorIndex(
                              options,
                              item
                            );

                          return (
                            <div
                              key={`${player.id}-${item}-${index}`}
                              className={[
                                "playerAnswerRow",
                                `playerAnswerColor${colorIndex + 1}`,
                                isCorrect
                                  ? "answerCorrect"
                                  : "answerWrong",
                              ]
                                .filter(
                                  Boolean
                                )
                                .join(
                                  " "
                                )}
                            >
                              <div className="playerAnswerRank">
                                <strong>
                                  {index +
                                    1}
                                </strong>

                                <span>
                                  位
                                </span>
                              </div>

                              <strong className="playerAnswerItem">
                                {
                                  item
                                }
                              </strong>

                              <span
                                className={[
                                  "playerAnswerJudge",
                                  isCorrect
                                    ? "correctJudge"
                                    : "wrongJudge",
                                ].join(
                                  " "
                                )}
                                aria-label={
                                  isCorrect
                                    ? "正解"
                                    : "不正解"
                                }
                              >
                                {isCorrect
                                  ? "✓"
                                  : "×"}
                              </span>
                            </div>
                          );
                        }
                      )}
                    </div>
                  ) : (
                    <div className="playerNoAnswer">
                      回答データがありません
                    </div>
                  )}
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
          onClick={
            nextRound
          }
        >
          次のお題へ
        </button>
      ) : (
        <div className="nextRoundWaiting">
          出題者が次のお題へ
          進むのを待っています
        </div>
      )}
    </div>
  );
}
