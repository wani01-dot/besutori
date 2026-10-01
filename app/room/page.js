"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "../style.css";

export default function Room() {
  const [room, setRoom] = useState(null);

  useEffect(() => {
    const saved =
      localStorage.getItem("besutori-room");

    if (!saved) {
      return;
    }

    try {
      setRoom(JSON.parse(saved));
    } catch {
      localStorage.removeItem(
        "besutori-room"
      );
    }
  }, []);

  if (!room) {
    return (
      <main className="app">
        <section className="screen">
          <div className="emptyRoom">
            <h1>部屋が見つかりません</h1>

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

  const displayName =
    room.hostName || room.name || "ゲスト";

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
                {room.roomCode}
              </strong>
            </div>

            <button
              type="button"
              className="copyButton"
              onClick={() => {
                navigator.clipboard?.writeText(
                  room.roomCode
                );
              }}
            >
              コピー
            </button>
          </div>

          <div className="memberSection">
            <div className="memberHeading">
              <h2>
                参加者
              </h2>

              <span>
                1 / {room.maxPlayers || 6}
              </span>
            </div>

            <div className="memberList">
              <div className="member">
                <div className="avatar hostAvatar">
                  {displayName.slice(0, 1)}
                </div>

                <div className="memberName">
                  <strong>
                    {displayName}
                  </strong>

                  {room.isHost && (
                    <span className="hostBadge">
                      ホスト
                    </span>
                  )}
                </div>
              </div>

              <div className="member waiting">
                <div className="avatar">
                  ?
                </div>

                <span>
                  参加者を待っています
                </span>
              </div>
            </div>
          </div>

          {room.allowSpectators && (
            <div className="memberSection spectatorSection">
              <div className="memberHeading">
                <h2>
                  観覧者
                </h2>

                <span>0人</span>
              </div>

              <div className="spectatorEmpty">
                まだ観覧者はいません
              </div>
            </div>
          )}

          <div className="roomBottom">
            {room.isHost ? (
              <>
                <p className="waitingText">
                  参加者が集まったら
                  ゲームを開始できます
                </p>

                <button
                  type="button"
                  className="startGameButton"
                  onClick={() =>
                    alert(
                      "次のステップでゲーム画面につなげます"
                    )
                  }
                >
                  ゲームを開始
                </button>
              </>
            ) : (
              <>
                <div className="waitingPulse">
                  <span />
                  ホストの開始を待っています
                </div>

                <div className="roleCard">
                  {room.role === "spectator"
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
