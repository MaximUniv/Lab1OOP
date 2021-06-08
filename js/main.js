// math
// Generates random integer between MinValue and MaxValue
function randomInt(minValue, maxValue) {
	return Math.round(Math.random() * (maxValue - minValue)) + minValue;
}
async function sleep(duration) {
	await new Promise(resolve => setTimeout(resolve, duration));
}
// Drawing
let delay = 200;
async function handleSteps(result) {
	let saved = null;
	for (let val of result) {
		let v = val.vertex;
		if (val.type === PathStepsTypes.IN) {
			if (saved && saved.block === dom[v])
				saved = null;
			dom[v].setAttribute("fill", "grey");
			if (val.text != undefined)
				textDom[v].textContent = val.text;
		}
		else if (val.type === PathStepsTypes.OUT) {
			if (saved && saved.block === dom[v])
				saved = null;
			dom[v].setAttribute("fill", "red");
		}
		else if (val.type === PathStepsTypes.CURRENT) {
			if (saved)
				saved.block.setAttribute("fill", saved.color);
			saved = {
				block: dom[v],
				color: dom[v].getAttribute("fill")
			};

			dom[v].setAttribute("fill", "green");
			if (val.text != undefined)
				textDom[v].textContent = val.text;
		}
		else if (val.type === PathStepsTypes.EDGE) {
			let to = val.to;

			edgesDom[v][to].setAttribute("stroke", "black");
		}
		await sleep(delay);
	}
}
const svg = document.getElementById("visualisation");
let boardWidth = svg.viewBox.baseVal.width;
let boardHeight = svg.viewBox.baseVal.height;

function animate({ timing, draw, duration = 1000 }) {
	let start = performance.now();

	return new Promise((resolve) => {
		requestAnimationFrame(function animate(time) {
			// timeFraction изменяется от 0 до 1
			let timeFraction = (time - start) / duration;
			if (timeFraction > 1) timeFraction = 1;

			// вычисление текущего состояния анимации
			let progress = timing ? timing(timeFraction) : timeFraction;

			draw(progress); // отрисовать её

			if (timeFraction < 1) {
				requestAnimationFrame(animate);
			}
			else {
				resolve();
			}
		});
	})
}
let dom = {};
let textDom = {};
let edgesDom = {};

function drawGraph(graph) {
	svg.innerHTML = "";

	const radious = Math.min(boardWidth, boardHeight) / 2 - 30;
	const horOffset = (boardWidth - radious * 2) / 2 + radious;
	const verOffset = (boardHeight - radious * 2) / 2 + radious;

	const cnt = graph.Count;

	function getX(i) { return radious * Math.cos(2 * Math.PI / cnt * i); }
	function getY(i) { return radious * -Math.sin(2 * Math.PI / cnt * i); }

	for (let i = 0; i < cnt; ++i) {
		for (let e of graph.Edges[i]) {
			let to = e.v;
			let w = e.w;
			if (i > to)
				continue;
			let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
			line.setAttribute("x1", horOffset + getX(i));
			line.setAttribute("y1", verOffset + getY(i));

			line.setAttribute("x2", horOffset + getX(to));
			line.setAttribute("y2", verOffset + getY(to));

			line.setAttribute("stroke", `rgb(${Math.round(200 * w)},255,255)`);

			if (!edgesDom[i])
				edgesDom[i] = {};
			if (!edgesDom[to])
				edgesDom[to] = {};

			edgesDom[i][to] = line;
			edgesDom[to][i] = line;

			svg.appendChild(line);

			let textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");

			textElement.setAttribute("x", horOffset + (getX(i) + getX(to)) / 2);
			textElement.setAttribute("y", verOffset + (getY(i) + getY(to)) / 2);

			textElement.setAttribute("font-size", "6px");

			textElement.textContent = Math.round(w * 100) / 100;

			svg.appendChild(textElement);
		}
	}
	for (let i = 0; i < cnt; ++i) {
		let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		circle.setAttribute("r", 10);

		circle.setAttribute("cx", horOffset + getX(i));
		circle.setAttribute("cy", verOffset + getY(i));

		circle.setAttribute("fill", "black");

		svg.appendChild(circle);
		dom[i] = circle;

		let textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");

		textElement.setAttribute("x", horOffset + getX(i) + 10);
		textElement.setAttribute("y", verOffset + getY(i) - 6);

		textElement.setAttribute("font-size", "10px");

		svg.appendChild(textElement);
		textDom[i] = textElement;
	}
}

// UI handlers
const countInput = document.getElementById('count');

let graph = {
	Count: 0,
	Edges: [],
}
function generateGraph(count) {
	graph.Count = count;
	graph.Edges = [];

	for (let i = 0; i < count; ++i) {
		graph.Edges[i] = [];
	}

	const used = {};
	let edges;
	do {
		edges = count < 10 ? count * count : count * 6;
		for (let i = 0; i < 1; ++i)
			edges *= Math.abs(Math.random() - Math.random()) / 2;
		edges = Math.floor(edges);
	} while (edges < count);

	console.log(edges);
	while (edges--) {
		let a = randomInt(0, count - 1);
		let b = randomInt(0, count - 1);
		let w = Math.random();
		if (a != b && !used[a + "|" + b]) {
			graph.Edges[a].push({
				v: b,
				w: w
			});
			graph.Edges[b].push({
				v: a,
				w: w
			});
			used[a + "|" + b] = true;
			used[b + "|" + a] = true;
		}
	}

	for (let i = 0; i < count; ++i) {
		graph.Edges[i].sort((a, b) => {
			if (a.v < b.v)
				return -1;
			return 1;
		});
	}
}
function GenerateGrid() {
	let count = Number(countInput.value);

	generateGraph(count);
	drawGraph(graph);
}
GenerateGrid();

const algoTypeInput = document.getElementById('algo-type');

function BuildPath() {
	let type = algoTypeInput.value

	let st = 0;
	let lt = Math.floor(graph.Count / 2);
	let result = AlgosList.get(type).invoke(graph, st, lt);

	console.log(result);
	handleSteps(result, 10);
}
