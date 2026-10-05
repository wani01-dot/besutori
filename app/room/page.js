"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";
import {
  onValue,
  ref,
  update,
} from "firebase/database";
import { db } from "../../lib/firebase";
import "../style.css";

export default function Room() {
  const [localRoom, setLocalRoom] =
    useState(null);

  const [firebaseRoom, setFirebaseRoom] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [roomMissing, setRoomMissing] =
    useState(false);

  useEffect(() => {
    const saved =
      localStorage.getItem(
        "besutori-room"
      );

    if (!saved) {
      setLoading(false);
      setRoomMissing(true);
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
      setRoomMissing(true);
      return;
    }

    if (!parsed?.roomCode) {
      setLoading(false);
      setRoomMissing(true);
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
          setFirebaseRoom(null);
          setRoomMissing(true);
          setLoading(false);
          return;
        }

        setFirebaseRoom(
          snapshot.val()
        );

        setRoomMissing(false);
        setLoading(false);
      },
      (error) => {
        console.error(
          "部屋の取得に失敗しました:",
          error
        );

        setRoomMissing(true);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  async function startGame() {
    if (
      !localRoom?.isHost ||
      !localRoom?.roomCode
    ) {
      return;
    }

    try {
      await update(
        ref(
          db,
          `rooms/${localRoom.roomCode}`
        ),
        {
          status: "playing",
          startedAt: Date.now(),
        }
      );

      /*
        次の工程で、
        実際のゲーム画面への移動を追加する。
      */
      alert(
        "ゲーム開始をFirebaseに送信しました"
      );
    } catch (error) {
      console.error(
        "ゲーム開始に失敗しました:",
        error
      );

      alert(
        "ゲームを開始できませんでした"
      );
    }
  }

  async function copyRoomCode() {
    if (!localRoom?.roomCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        localRoom.roomCode
      );

      alert(
        "ルームコードをコピーしました"
      );
    } catch {
      alert(
        `ルームコード：${localRoom.roomCode}`
      );
    }
  }

  if (loading) {
    return (
      <main className="app">
        <section className="screen">
          <div className="emptyRoom">
            <h1>
              部屋を読み込んでいます
            </h1>
          </div>
        </section>
      </main>
    );
  }

  if (
    roomMissing ||
    !localRoom ||
    !firebaseRoom
  ) {
    return (
      <main className="app">
        <section className="screen">
          <div className="emptyRoom">
            <h1>
              部屋が見つかりません
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

  const players = Object.values(
    firebaseRoom.players || {}
  );

  const spectators = Object.values(
    firebaseRoom.spectators || {}
  );

  const maxPlayers =
    firebaseRoom.maxPlayers || 6;

  const allowSpectators =
    firebaseRoom.allowSpectators ??
    false;

  return (
    <main className="app">
      <section className="screen roomScreen">
        <header className="screenHeader">
          <Link
            href="/"
            className="backButton"
            aria-label="戻る"
          >
            ←
          </Link>

          <h1>ルーム</h1>

          <div className="headerSpace" />
        </header>

        <div className="roomContent">
          <div className="roomCodeCard">
            <div>
              <span className="roomCodeLabel">
                ルームコード
              </span>

              <strong>
                {localRoom.roomCode}
              </strong>
            </div>

            <button
              type="button"
              className="copyButton"
              onClick={copyRoomCode}
            >
              コピー
            </button>
          </div>

          <div className="memberSection">
            <div className="memberHeading">
              <h2>参加者</h2>

              <span>
                {players.length} /{" "}
                {maxPlayers}
              </span>
            </div>

            <div className="memberList">
              {players.map((player) => {
                const name =
                  player.name ||
                  "ゲスト";

                return (
                  <div
                    className="member"
                    key={player.id}
                  >
                    <div
                      className={
                        player.isHost
                          ? "avatar hostAvatar"
                          : "avatar"
                      }
                    >
                      {name
                        .slice(0, 1)
                        .toUpperCase()}
                    </div>

                    <div className="memberName">
                      <strong>
                        {name}
                      </strong>

                      {player.isHost && (
                        <span className="hostBadge">
                          ホスト
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {players.length <
                maxPlayers && (
                <div className="member waiting">
                  <div className="avatar">
                    ?
                  </div>

                  <span>
                    参加者を待っています
                  </span>
                </div>
              )}
            </div>
          </div>

          {allowSpectators && (
            <div className="memberSection spectatorSection">
              <div className="memberHeading">
                <h2>観覧者</h2>

                <span>
                  {spectators.length}人
                </span>
              </div>

              {spectators.length === 0 ? (
                <div className="spectatorEmpty">
                  まだ観覧者はいません
                </div>
              ) : (
                <div className="memberList">
                  {spectators.map(
                    (spectator) => {
                      const name =
                        spectator.name ||
                        "ゲスト";

                      return (
                        <div
                          className="member"
                          key={
                            spectator.id
                          }
                        >
                          <div className="avatar">
                            {name
                              .slice(0, 1)
                              .toUpperCase()}
                          </div>

                          <div className="memberName">
                            <strong>
                              {name}
                            </strong>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          )}

          <div className="roomBottom">
            {localRoom.isHost ? (
              <>
                <p className="waitingText">
                  参加者が集まったら
                  ゲームを開始できます
                </p>

                <button
                  type="button"
                  className="startGameButton"
                  onClick={startGame}
                >
                  ゲームを開始
                </button>
              </>
            ) : (
              <>
                <div className="waitingPulse">
                  <span />
                  {firebaseRoom.status ===
                  "playing"
                    ? "ゲームが開始されました"
                    : "ホストの開始を待っています"}
                </div>

                <div className="roleCard">
                  {localRoom.role ===
                  "spectator"
                    ? "👀 観覧モード"
                    : "🎮 回答者として参加"}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
