/**
 * Generates `data/anki.tsv`, which is a list of kanji identical to the
 * order of appearance in the kanjive.txt list.
 * 
 * This works by first generating the kanjiVE.txt file, which is sorted
 * purely based on the appearance of elements, with the exception of the
 * order.txt kanji being injected artificially into the ordering
 * (essentially forces the kanji for numbers 1-10 at the start).
 */
const fs = require("fs");
const colors = require("colors");
require("./ext");
const kanjive = require("./data/kanjive.json");
const jouyou = require("./data/jouyou.json");
const keywords = require("./data/keywords.json");
const names = require("./data/names.json");
const anki = "data/anki.tsv";
const lines = [];

function findName(element){
	if(keywords[element]) return keywords[element];
	for(let _element of names) if(_element.element === element) return _element.names[0];
}

for(let kanji of kanjive){
	for(let _jouyou of jouyou.kanji){
		if(kanji.kanji !== _jouyou.kanji) continue;
		kanji.grade = _jouyou.grade;
		kanji.frequency = _jouyou.frequency;
		break;
	}
}

console.log(`Create kanjiVE-ordered flashcard file for anki.`.cyan)
const usedKeywords = [];
for(let kanji of kanjive){
	if(!keywords[kanji.kanji]){
		console.log(`${"WARNING".red.bold}: ${kanji.kanji.red} has no keyword!`)
		continue;
	}
	if(usedKeywords.contains(keywords[kanji.kanji])) console.log(`${"WARNING".bold.red}: Duplicate keyword ${keywords[kanji.kanji].red}`);
	else usedKeywords.push(keywords[kanji.kanji]);
	let named = [];
	for(let element of kanji.elements) named.push(`${element}[${findName(element)}]`);
	let line = [keywords[kanji.kanji], kanji.kanji, `grade${kanji.grade === 7 ? "S" : kanji.grade}`, kanji.frequency, named.join(" ")];
	/** personal testing stuff */
	if(kanji.kanji !== "𠮟") line.push(`"<img src=""0${kanji.kanji.charCodeAt().toString(16)}.svg"">"`); /// 𠮟 has no SVG file
	else line.push("");
	lines.push(line.join("\t"));
}

console.log(` ${">".cyan} Saving ${anki.yellow}`);
fs.writeFileSync(anki, lines.join("\n"));