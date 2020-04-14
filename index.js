const { pipe, get, groupBy, forOwn, map } = require("lodash/fp");
const fs = require("fs");
const readline = require("readline");
const argv = require("yargs");
var rp = require("request-promise");
const path = require("path");
const savedUrls = require("./savedUrls");
let types = [];
let store = [];
let storeName = "blogs";
let contentFile = "README";

argv
	.command(
		"blogs",
		"",
		() => {},
		(args) => {
			store = require("./blogs");
			types = require("./types").blogs;
			processUrl(args.url).then();
		}
	)
	.command(
		"ds",
		"",
		() => {},
		(args) => {
			store = require("./ds");
			types = require("./types").ds;
			storeName = "ds";
			contentFile = "datastructure";
			processUrl(args.url).then();
		}
	).argv;

async function getTitle(url) {
	return rp(url).then((htmlString) => {
		const matched = htmlString.match(/<title\s*.*?>(.*?)<\/title>/);
		return matched[1];
	});
}

async function processUrl(url) {
	let res = await getTitle(url);
	if (existance(url)) {
		console.log("This url is already saved.");
		return;
	}
	const text = `[${res}](${url})  \n`;
	const selectedType = await getType();
	const val = {
		type: selectedType,
		url: url,
		title: res,
	};
	store.push(val);
	writeToStore();
	generateContent();
	saveUrl(url);
}

function writeToStore() {
	fs.writeFileSync(`./${storeName}.json`, JSON.stringify(store, null, 2));
}
function generateContent(url) {
	const file = path.join(__dirname, `${contentFile}.md`);
	const text = pipe(
		groupBy("type"),
		(o) => {
			let str = "";
			forOwn(function(val) {
				const type = val[0].type;
				str =
					str +
					`## ${type}\n` +
					map((item) => {
						return `[${item.title}](${item.url})  \n`;
					}, val).join("");
			}, o);
			return str;
		}
	)(store);
	fs.writeFileSync(file, text);
}

function existance(url) {
	return savedUrls.some((savedUrl) => url === savedUrl);
}

function saveUrl(url) {
	savedUrls.push(url);
	fs.writeFileSync("./savedUrls.json", JSON.stringify(savedUrls, null, 2));
}

async function takeResponse(query) {
	return new Promise((resolve, reject) => {
		var rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});
		rl.question(query, (res) => {
			rl.close();
			resolve(res);
		});
	});
}

async function getType(argument) {
	const options = types.map((type, i) => `${i} ${type}\n`).join("");
	const selectedType = await takeResponse(
		`Select type to add in \n${options}`
	);
	return types[selectedType];
}
