import { useState, useEffect } from "react";
import Box from "./components/Box";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";

// API link for random words
const random_word_api =
  "https://random-word-api.vercel.app/api?words=1&length=5";

/**
 * @param curent_word The word to guess, used to determine the color of the letters
 * @param row The 5 letter string of the line
 * @param id Used to give boxes a unique key
 */
function build_row(
  curent_word: string | undefined,
  row: string,
  id: number
): Array<JSX.Element> {
  let out = [];

  if (row === undefined) {
    for (let i = 0; i < 5; i++) {
      let box_id = i + 5 * id;
      out.push(<Box letter=" " key={box_id} />);
    }
    return out;
  }
  for (let i = 0; i < 5; i++) {
    let box_id = i + 5 * id;
    if (row[i] === undefined) {
      out.push(<Box letter=" " key={box_id} />);
    } else {
      let char = row[i].toUpperCase();
      let char_c =
        curent_word === undefined ? "" : curent_word[i].toUpperCase();

      if (char === char_c) {
        out.push(<Box letter={char} key={box_id} t="right" />);
      } else {
        if (curent_word === undefined ? false : curent_word.match(row[i])) {
          out.push(<Box letter={char} key={box_id} t="wplaced" />);
        } else {
          out.push(<Box letter={char} key={box_id} t="wrong" />);
        }
      }
    }
  }

  return out;
}

function Wordle({
  input,
  setInput,
  addWordButtonRef,
}: {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  addWordButtonRef: React.MutableRefObject<HTMLButtonElement>;
}) {
  let [curentWord, setCurentWord] = useState<string | undefined>(undefined);

  let [newWord, setNewWord] = useState(false);

  let [rows, setRows] = useState<string[]>([]);

  // let [input, setInput] = useState("");

  let [win, setWin] = useState(false);
  const [confettiIncrement, setConfettiIncrement] = useState(0);
  const { width, height } = useWindowSize();

  function hasWon(): boolean {
    return win;
  }

  function hasLost(): boolean {
    return !win && rows.length === 5;
  }

  // fetches a random word from an API and sets it to the current word
  useEffect(() => {
    if (newWord || curentWord === undefined) {
      fetch(random_word_api)
        .then((r) => r.json() as Promise<string[]>)
        .then((r) => setCurentWord(r[0]));
      setNewWord(false);
    }
  }, [newWord]);

  function push_rows() {
    if (!hasWon() && !hasLost() && input.length === 5) {
      let r = rows;
      r.push(input.toLowerCase());
      setRows(r);
      if (input.toLowerCase() === curentWord) {
        setWin(true);
        setConfettiIncrement((curr) => curr + 1);
      }
      setInput("");
    }
  }

  function reset_game() {
    setWin(false);
    setInput("");
    setRows([]);
    setNewWord(true);
  }

  return (
    <>
      {confettiIncrement > 0 && win && (
        <Confetti
          width={width}
          height={height}
          key={confettiIncrement}
          recycle={false}
          numberOfPieces={1500}
          tweenDuration={8000}
          gravity={0.1}
        />
      )}
      <div className="flex justify-center ">
        <div className="flex w-max flex-col rounded border border-slate-600 p-4 shadow">
          <h1
            className={`mb-6 mt-2 text-center text-xl font-bold transition-colors ${(() => {
              if (hasWon()) {
                return "text-green-600";
              } else if (hasLost()) {
                return "text-red-600";
              } else {
                return "text-black dark:text-slate-100";
              }
            })()}`}
          >
            {hasWon() ? "You Won" : hasLost() ? "You Lose" : "Handle"}
          </h1>
          <div className="grid select-none grid-cols-5 grid-rows-5 gap-y-4 gap-x-2 mb-6">
            {(() => {
              let lines = [];
              for (let r = 0; r < 5; r++) {
                lines.push(build_row(curentWord, rows[r], r));
              }
              return lines;
            })()}
          </div>
          <button
            ref={addWordButtonRef}
            className="rounded mb-3 border border-slate-600 bg-slate-200 text-black transition-colors hover:bg-slate-400 disabled:bg-slate-300 dark:border-0 dark:bg-gray-800 dark:text-slate-100 dark:hover:bg-gray-600"
            onClick={() => {
              push_rows();
            }}
          >
            Enter Word
          </button>
          <button
            className="rounded border-0 border-emerald-600 bg-emerald-600 text-black transition-colors hover:bg-emerald-500 disabled:bg-emerald-300"
            onClick={reset_game}
          >
            New Game
          </button>
        </div>
      </div>
    </>
  );
}

export default Wordle;
