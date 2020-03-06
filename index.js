const {pipe, get }= require("lodash/fp");
const fs = require("fs");
const readline = require("readline");
const argv = require("yargs");
var rp = require('request-promise');
const path = require('path');
const url = get('[2]', process.argv);
const savedUrls = require("./savedUrls");
console.log(url);

async function getTitle(url) {
	return rp(url).then(htmlString => {
		const matched = htmlString.match(/<title\s*.*?>(.*?)<\/title>/);
		console.log(matched[1]);
		return matched[1];
	})
}

getTitle(url).then(res => {
	if (existance(url)) {
		console.log("This url is already saved.");
		return;
	}
	const text = `[${res}](${url})  \n`;
	writeToFile(text);
	saveUrl(url);
})

function writeToFile(text) {
	const file = path.join(__dirname, 'content.md');
	fs.appendFileSync(file, text)
}

function existance(url) {
	return savedUrls.some((savedUrl) => url === savedUrl);
}

function saveUrl(url) {
	savedUrls.push(url);
	fs.writeFileSync('./savedUrls.json', JSON.stringify(savedUrls, null, 2));
}