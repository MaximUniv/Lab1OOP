PathStepsTypes = {
	IN: "in",
	OUT: "out",
	CURRENT: "current",
	EDGE: "edge"
}
class Algo {
  constructor(name, description, invoke) {
    this.name = name;
    this.description = description;

    this.invoke = invoke;
  }
}

AlgosList = {
  dict: {},
  add: function (algo) {
    if(algo.name) {
      if(this.dict[algo.name])
        console.warn(`algo ${algo.name} is overrided`, algo);

      this.dict[algo.name] = algo;
    }
    else
      console.error("Invalid algo", algo);
  },
  get: function(name) {
    return this.dict[name];
  },
  getAll: function () {
    return Object.values(this. dict);
  }
}

AlgosList.add(
  new Algo(
    "DFS",
    "---",
    function(graph, st) {
		let result = [];
		let used = {};
		
		function dfs(v) {
			if(used[v])
				return;
			
			result.push({
				vertex: v,
				type: PathStepsTypes.IN
			});
			result.push({
				vertex: v,
				type: PathStepsTypes.CURRENT
			});
			used[v] = true;
			for(let e of graph.Edges[v]) 
			{
				if(used[e.v])
					continue;		
				
				dfs(e.v);
				result.push({
					vertex: v,
					type: PathStepsTypes.CURRENT
				});
			}
			result.push({
				vertex: v,
				type: PathStepsTypes.OUT
			});
		}
		dfs(st);
		
		return result;
    }
  )
);
AlgosList.add(
  new Algo(
    "BFS",
    "---",
    function(graph, st) {
		let result = [];
		let used = {};
		
		
		used[st] = true;
		result.push({
			vertex: st,
			type: PathStepsTypes.IN
		});
			
		let queue = [st];
		for(let i = 0;i < queue.length;++i)
		{
			let v = queue[i];
					
			result.push({
				vertex: v,
				type: PathStepsTypes.CURRENT
			});
			for(let e of graph.Edges[v]) {
				let to = e.v;
				if(!used[to]) {
					used[to] = true;
					queue.push(to);
					
					result.push({
						vertex: to,
						type: PathStepsTypes.IN
					});	
				}
			}
			result.push({
				vertex: v,
				type: PathStepsTypes.OUT
			});
		}
		
		
		return result;
    }
  )
);
AlgosList.add(
  new Algo(
    "Dijkstra",
    "---",
    function(graph, st) {
		let result = [];
		
		result.push({
			vertex: st,
			type: PathStepsTypes.IN,
			text: "0"
		});
			
		let dist = {};
		let used = {};
		
		dist[st] = 0;
		for(let i = 0;i < graph.Count;++i) {
			let v = -1;
			for (let j = 0;j < graph.Count;++j)
				if (!used[j] && (dist[j] !== undefined) && (v === -1 || dist[j] < dist[v]))	
					v = j;
			if(v === -1) 
				break;
			
			result.push({
				vertex: v,
				type: PathStepsTypes.CURRENT
			});
			used[v] = true;
			for(let e of graph.Edges[v]) {
				let to = e.v;
				let w = e.w;
				if(dist[to] === undefined || dist[v] + w < dist[to]) {
					dist[to] = dist[v] + w;
					result.push({
						vertex: to,
						type: PathStepsTypes.IN,
						text: Math.round(dist[to] * 100) / 100
					});
					
				}
			}
			result.push({
				vertex: v,
				type: PathStepsTypes.OUT
			});
		}
		
		return result;
    }
  )
);
AlgosList.add(
  new Algo(
    "A*",
    "---",
    function(graph, st, lt) {
		let heuristics = {}
		function bfs() {
			let used = {};
			
			heuristics[lt] = 0;
			used[lt] = true;
			
			let queue = [lt];
			for(let i = 0;i < queue.length;++i)
			{
				let v = queue[i];
				
				for(let e of graph.Edges[v]) {
					let to = e.v;
					if(!used[to]) {
						used[to] = true;
						heuristics[to] = heuristics[v] + 0.5;
						queue.push(to);
					}
				}
			}
		}
		bfs();
	
		let result = [];
		let used = {};
		
		
		result.push({
			vertex: st,
			type: PathStepsTypes.IN,
			text: "0, 0"
		});
			
		let dist = {};
		let forecast = {};
		
		dist[st] = 0;
		forecast[st] = heuristics[st];
		for(let i = 0;i < graph.Count;++i) {
			let v = -1;
			for (let j = 0;j < graph.Count;++j)
				if (!used[j] && (forecast[j] !== undefined) && (v === -1 || forecast[j] < forecast[v]))	
					v = j;
			if(v === -1) 
				break;
			
			result.push({
				vertex: v,
				type: PathStepsTypes.CURRENT
			});					
			used[v] = 1;
			for(let e of graph.Edges[v]) {
				let to = e.v;
				let w = e.w;
				if(dist[to] === undefined || dist[v] + w < dist[to]) {
					dist[to] = dist[v] + w;
					forecast[to] = dist[to] + heuristics[to];
					result.push({
						vertex: to,
						type: PathStepsTypes.IN,
						text: Math.round(dist[to] * 100) / 100 + ", " + Math.round(forecast[to] * 100) / 100
					});					
				}
			}
			result.push({
				vertex: v,
				type: PathStepsTypes.OUT
			});
		}
		
		return result;
    }
  )
);
AlgosList.add(
  new Algo(
    "Prima",
    "---",
    function(graph, st) {
		let result = [];
		
		result.push({
			vertex: st,
			type: PathStepsTypes.IN,
			text: "0"
		});
			
		let dist = {};
		dist[st] = 0;
		
		let from = {}
		let used = {};
		for(let i = 0;i < graph.Count;++i) {
			let v = -1;
			for (let j = 0;j < graph.Count;++j)
				if (!used[j] && (dist[j] !== undefined) && (v === -1 || dist[j] < dist[v]))	
					v = j;
			if(v === -1) 
				break;
			
			if(from[v] !== undefined) {
				result.push({
					vertex: from[v],
					to: v,
					type: PathStepsTypes.EDGE
				});
			}
			dist[v] = 0;
			result.push({
				vertex: v,
				type: PathStepsTypes.CURRENT,
				text: 0
			});
			used[v] = true;
			for(let e of graph.Edges[v]) {
				let to = e.v;
				let w = e.w;
				if(dist[to] === undefined || w < dist[to]) {
					dist[to] = w;
					from[to] = v;
					result.push({
						vertex: to,
						type: PathStepsTypes.IN,
						text: Math.round(dist[to] * 100) / 100
					});
				}
			}
			result.push({
				vertex: v,
				type: PathStepsTypes.OUT
			});
		}
		
		return result;
    }
  )
);
AlgosList.add(
  new Algo(
    "2-sided Dijkstra",
    "---",
    function(graph, st, lt) {
		function step(num, dist, used, r_dist) {
			let v = -1;
			for (let j = 0;j < graph.Count;++j)
				if (!used[j] && (dist[j] !== undefined) && (v === -1 || dist[j] < dist[v]))	
					v = j;
			if(v === -1) 
				return -1;
			
			result.push({
				vertex: v,
				type: PathStepsTypes.CURRENT
			});
			used[v] = true;
			for(let e of graph.Edges[v]) {
				let to = e.v;
				let w = e.w;
				if(dist[to] === undefined || dist[v] + w < dist[to]) {
					dist[to] = dist[v] + w;
					result.push({
						vertex: to,
						type: PathStepsTypes.IN,
						text: num + "->" + Math.round(dist[to] * 100) / 100 +
							(r_dist[to] ?  ", " + (3 - num) + "->" + Math.round(r_dist[to] * 100) / 100 : "")
					});
					
				}
			}
			result.push({
				vertex: v,
				type: PathStepsTypes.OUT
			});
			return v;
		}
		
		let result = [];
		
		result.push({
			vertex: st,
			type: PathStepsTypes.IN,
			text: "1 --> 0"
		});
		result.push({
			vertex: lt,
			type: PathStepsTypes.IN,
			text: "2 --> 0"
		});
			
		let dist1 = {}, dist2 = {};
		let used1 = {}, used2 = {};
		
		dist1[st] = 0;
		dist2[lt] = 0;
		
		for(let i = 0;;i++) {
			if(i % 2 == 0) {
				let v = step(1, dist1, used1, dist2);
				if(v === -1)
					break;
				if(used2[v])
					break;
			}
			else {
				let v = step(2, dist2, used2, dist1);
				if(v === -1)
					break;
				if(used1[v])
					break;
			}
		}
		
		return result;
    }
  )
);
AlgosList.add(
  new Algo(
    "2-sided A*",
    "---",
    function(graph, st, lt) {		
		function bfs(heuristics, st) {
			let used = {};
			
			heuristics[st] = 0;
			used[st] = true;
			
			let queue = [st];
			for(let i = 0;i < queue.length;++i)
			{
				let v = queue[i];
				
				for(let e of graph.Edges[v]) {
					let to = e.v;
					if(!used[to]) {
						used[to] = true;
						heuristics[to] = heuristics[v] + 0.5;
						queue.push(to);
					}
				}
			}
		}
		
		let heuristics1 = {};
		let heuristics2 = {};
		
		bfs(heuristics1, lt);
		bfs(heuristics2, st);
		
		function step(num, heuristics, forecast, dist, used, r_forecast, r_dist) {
			let v = -1;
			for (let j = 0;j < graph.Count;++j)
				if (!used[j] && (forecast[j] !== undefined) && (v === -1 || forecast[j] < forecast[v]))	
					v = j;
			if(v === -1) 
				return -1;
			
			result.push({
				vertex: v,
				type: PathStepsTypes.CURRENT
			});
			used[v] = true;
			for(let e of graph.Edges[v]) {
				let to = e.v;
				let w = e.w;
				if(dist[to] === undefined || dist[v] + w < dist[to]) {
					dist[to] = dist[v] + w;
					forecast[to] = dist[to] + heuristics[to]
					result.push({
						vertex: to,
						type: PathStepsTypes.IN,
						text: num + "->" + Math.round(dist[to] * 100) / 100 + ", " + Math.round(forecast[to] * 100) / 100 +
							(r_forecast[to] ? ", " + (3 - num) + "->" + Math.round(r_dist[to] * 100) / 100 + ", " + Math.round(r_forecast[to] * 100) / 100 : "")
					});
					
				}
			}
			result.push({
				vertex: v,
				type: PathStepsTypes.OUT
			});
			return v;
		}
		
		
		let result = [];
		
		result.push({
			vertex: st,
			type: PathStepsTypes.IN,
			text: "1->0, " + heuristics1[st]
		});
		result.push({
			vertex: lt,
			type: PathStepsTypes.IN,
			text: "2->0, " + heuristics2[lt]
		});
		
		let dist1 = {}, dist2 = {};
		let forecast1 = {}, forecast2 = {};
		let used1 = {}, used2 = {};
		
		dist1[st] = 0;
		forecast1[st] = heuristics1[st];
		dist2[lt] = 0;
		forecast2[lt] = heuristics2[lt];
		
		for(let i = 0;;i++) {
			if(i % 2 == 0) {
				let v = step(1, heuristics1, forecast1, dist1, used1, forecast2, dist2);
				if(v === -1)
					break;
				if(used2[v])
					break;
			}
			else {
				let v = step(2, heuristics2, forecast2, dist2, used2, forecast1, dist1);
				if(v === -1)
					break;
				if(used1[v])
					break;
			}
		}
		
		return result;
    }
  )
);