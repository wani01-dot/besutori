import Link from "next/link";
import "./style.css";

export default function Home() {
  return (
    <main className="app">
      <section className="home">
        <div className="spark spark1">✦</div>
        <div className="spark spark2">★</div>
        <div className="spark spark3">✦</div>
        <div className="spark spark4">★</div>

        <div className="logoArea">
          <div className="crown">♛</div>

          <h1 className="logo">
            ベストリ
          </h1>

          <div className="logoEnglish">
            B E S T R I
          </div>

          <p className="catch">
            あなたのBEST3、当てられる？
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
          <Link
            href="/howto"
            className="subButton howToButton"
          >
            <span className="subIcon">
              ?
            </span>

            <span>
              遊び方
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
