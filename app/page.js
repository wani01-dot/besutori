"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "./style.css";

export default function Home() {
  const [showHowTo, setShowHowTo] =
    useState(false);

  useEffect(() => {
    if (!showHowTo) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setShowHowTo(false);
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [showHowTo]);

  return (
    <main className="app">
      <section className="home">
        <div className="spark spark1">
          ✦
        </div>

        <div className="spark spark2">
          ★
        </div>

        <div className="spark spark3">
          ✦
        </div>

        <div className="spark spark4">
          ★
        </div>

        <div className="logoArea">
          <div className="crown">
            ♛
          </div>

          <h1 className="logo">
            ベストリ
          </h1>

          <div className="logoEnglish">
            B E S T R I
          </div>

          <p className="catch">
            あなたのBEST3、
            当てられる？
          </p>
        </div>

        <div className="podiumArea">
          <div className="podium second">
            <span className="podiumCrown">
              ♛
            </span>

            <strong>2</strong>
          </div>

          <div className="podium first">
            <span className="podiumCrown">
              ♛
            </span>

            <strong>1</strong>
          </div>

          <div className="podium third">
            <span className="podiumCrown">
              ♛
            </span>

            <strong>3</strong>
          </div>
        </div>

        <div className="actions">
          <Link
            href="/create"
            className="mainButton createButton"
          >
            <span className="buttonIcon">
              ＋
            </span>

            <span>
              部屋をつくる
            </span>
          </Link>

          <Link
            href="/join"
            className="mainButton joinButton"
          >
            <span className="buttonIcon">
              ⌕
            </span>

            <span>
              合言葉で参加
            </span>
          </Link>
        </div>

        <div className="bottomActions singleBottomAction">
          <button
            type="button"
            className="subButton howToButton"
            onClick={() =>
              setShowHowTo(true)
            }
          >
            <span className="subIcon">
              ?
            </span>

            <span>
              遊び方
            </span>
          </button>
        </div>

        {showHowTo && (
          <div
            className="howToOverlay"
            onClick={() =>
              setShowHowTo(false)
            }
          >
            <div
              className="howToModal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="howToTitle"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="howToHeader">
                <div>
                  <span className="howToMiniTitle">
                    HOW TO PLAY
                  </span>

                  <h2 id="howToTitle">
                    遊び方
                  </h2>
                </div>

                <button
                  type="button"
                  className="howToClose"
                  onClick={() =>
                    setShowHowTo(false)
                  }
                  aria-label="閉じる"
                >
                  ×
                </button>
              </div>

              <div className="howToSteps">
                <HowToStep
                  number="1"
                  title="出題者がBEST3をつくる"
                  text="好きな食べ物や行きたい場所など、お題を決めて「自分の1位・2位・3位」を入力します。"
                  className="howToStep1"
                />

                <HowToStep
                  number="2"
                  title="みんなで順位を予想する"
                  text="出題者が選んだ3つが、順番を隠して表示されます。「この人ならこれが1位かも！」と予想して、1位〜3位に並べます。"
                  className="howToStep2"
                />

                <HowToStep
                  number="3"
                  title="答え合わせ！"
                  text="全員が回答したら、本当のBEST3を発表。出題者の順位をどれだけ当てられたかチェックします。"
                  className="howToStep3"
                />

                <HowToStep
                  number="4"
                  title="出題者を交代して次のお題へ"
                  text="次の人が新しいお題とBEST3をつくります。"
                  className="howToStep4"
                />
              </div>

              <div className="howToMessage">
                お互いの
                <strong>
                  「意外と知らなかった好き」
                </strong>
                が見えてくるゲームです。
              </div>

              <button
                type="button"
                className="howToOkButton"
                onClick={() =>
                  setShowHowTo(false)
                }
              >
                わかった！
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function HowToStep({
  number,
  title,
  text,
  className,
}) {
  return (
    <div
      className={`howToStep ${className}`}
    >
      <div className="howToNumber">
        {number}
      </div>

      <div className="howToStepText">
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
}
