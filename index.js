const {pipe, get }= require("lodash/fp");
const fs = require("fs");
const readline = require("readline");
const argv = require("yargs");
var rp = require('request-promise');
const path = require('path');
const url = get('[2]', process.argv);
console.log(url);

async function getTitle(url) {
	return rp(url).then(htmlString => {
		const matched = htmlString.match(/<title>(.*?)<\/title>/);
		console.log(matched[1]);
		return matched[1];
	})
}
getTitle(url).then(res => {
	const text = `[${res}](${url})`;
	writeToFile(text);
})

function writeToFile(text) {
	const file = path.join(__dirname, 'content.md');
	fs.appendFileSync(file, text)
}