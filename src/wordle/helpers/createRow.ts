import { Box } from "../components/Box";

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
	let out: JSX.Element[] = [];

	if (row === undefined) {
		for (let i = 0; i < 5; i++) {
			let box_id = i + 5 * id;
			out.push(<Box letter=" " key={box_id} />);
		}
	} else {
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
	}
	return out;
}
