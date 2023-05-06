// CLASSES
// Define the RacingTeamQueue class
class RacingTeamQueue {
	constructor() {
	  this.queue = [];
	}
  
	// Method to add a new team to the queue
	enqueue(team) {
	  this.queue.push(team);
	}
  
	// Method to remove and return the first team in the queue
	dequeue() {
	  return this.queue.shift();
	}
  
	// Method to get the current size of the queue
	size() {
	  return this.queue.length;
	}
  
	// Method to check if the queue is empty
	isEmpty() {
	  return this.size() === 0;
	}
  
	// Method to get the next team in the queue without removing it
	peek() {
	  return this.queue[0];
	}

	getAllTeams() {
		return this.queue.slice();
	  }

	clear() {
		this.queue = [];
	}
  }

// VARIABLES

const urlWax = 'https://wax.cryptolions.io';
const wax = new waxjs.WaxJS ({rpcEndpoint: urlWax});
let lineCount = 0;
let racesStarted = false;
const racingTeamQueue = new RacingTeamQueue();

const delay = msecs => new Promise ((resolve, reject) => {
	setTimeout (_ => resolve (), msecs)
});

var responseElement = document.getElementById ('response');

async function loginSwitch () {
	await login ();
/*
	if (wax.userAccount) {
		await logout ();
	} else {
		await login ();
	}
*/
}

// LOGIC

async function login () {
	doLog ('Logging in...');
	try {
		const userAccount = await wax.login ();
		doLog ('Logged in as ' + userAccount);
	} catch (e) {
		doLog ('Login error: ' + e.message);
	}
}

async function doLog (s) {
	responseElement.append (s + '\n');

	// increment the line count
	lineCount++;

	// if the line count is greater than 5, remove the first line
	if (lineCount > 5) {
	  // get the first child of the response element and remove it
	  responseElement.removeChild(responseElement.firstChild);

	  // decrement the line count
	  lineCount--;
	}
}


async function addRacers() {
	if (!wax.api) {
		doLog ('Racing error: ' + 'login first');
		return;
	}
	const assets = document.getElementById("asset-ids").value;
	const asset_array = assets.split(',')
	const asset_ids = asset_array.map(str => parseInt(str.trim()));
	console.log(asset_ids)
	for (let i = 0; i < asset_ids.length; i += 3) {
		const vech_1 = asset_ids[i];
		const driver_1 = asset_ids[i + 1];
		const driver_2 = asset_ids[i + 2];
		const gear_level = document.getElementById("gear-selector").value;
		console.log(gear_level)
		const boost = document.getElementById("use-boost");
		let use_boost = false
		if (boost.checked) {
			use_boost = true;
		} else {
			use_boost = false;
		}
		var radios = document.querySelectorAll('input[name="rank"]');
		for (var j = 0; j < radios.length; j++) {
			if (radios[j].checked) {
			rank = radios[j].value;
			break;
			}
		}
		if (vech_1  !== undefined && driver_1  !== undefined && driver_2  !== undefined) {
			new_team = createRacingTeam(vech_1, driver_1, driver_2, gear_level, rank, use_boost)
			racingTeamQueue.enqueue(new_team)
			updateQueueSize()
			updateRacequeue()
		}
	}

	if (!racesStarted && racingTeamQueue.size() > 0) {
		startRacing()
	}
}

function updateSliderValue() {
	var slider = document.getElementById("gear-selector");
	var value = Math.round(slider.value);
	var sliderValue = document.getElementById("gear-selector-value");
	sliderValue.innerHTML = value;
  }

function getTransactions(commision_amount, pay_amount, vech_1, driver_1, driver_2, gear_level, use_boost) {
	transactions = [{
		account: 'novarallytok',
		name: 'transfer',
		authorization: [{
			actor: wax.userAccount,
			permission: 'active',
		}],
		data: {
			from: wax.userAccount,
			to: 'pj4mooootsey',
			quantity: commision_amount,
			memo: 'WOW'
		},
	},{
		account: 'iraces.nova',
		name: 'join',
		authorization: [{
			actor: wax.userAccount,
			permission: 'active',
		}],
		data: {
			player: wax.userAccount,
			vehicle_asset_id: vech_1,
			driver1_asset_id: driver_1,
			driver2_asset_id: driver_2,
			gear_id: parseInt(gear_level),
			use_boost: use_boost,
			races_number: parseInt(1),
		},
	}]

	// If gear level is not 0 need to add payment
	if(gear_level != 0) {
		transactions.unshift({
			account: 'novarallytok',
			name: 'transfer',
			authorization: [{
				actor: wax.userAccount,
				permission: 'active',
			}],
			data: {
				from: wax.userAccount,
				to: 'iraces.nova',
				quantity: pay_amount,
				memo: ''
			},
		}) 	
	}	
	return transactions
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
  }


function createRacingTeam(vech_1, driver_1, driver_2, gear_level, rank, use_boost) {
	return {
		vech_1: vech_1,
		driver_1: driver_1,
		driver_2: driver_2,
		gear_level: gear_level,
		rank: rank,
		use_boost: use_boost,
		race_count: 0,
	}
}


async function startRacing() {
	let count = 0
	racesStarted = true
	document.getElementById ('racing').textContent = "racing"
	while (racesStarted) {
		doLog("Starting next race")
		if(racingTeamQueue.isEmpty()) {
			await delay (100 + (getRandomInt(1, 1000)));
		} else {
			// Takes team from start of que
			current_team = racingTeamQueue.dequeue()
			// Adds team to end of the que
			const [commision_amount, pay_amount] = getFees(current_team.gear_level, current_team.rank)
			tx = getTransactions(commision_amount, pay_amount, current_team.vech_1, current_team.driver_1, current_team.driver_2, current_team.gear_level, current_team.use_boost)
			try {
				const race_result = await wax.api.transact ({
					actions: tx }, {
	//				useLastIrreversible: true,
					blocksBehind: 60,
					expireSeconds: 300
				});
				console.log(race_result)
				try {
					console.log(race_result['transaction_id'])
					count += 1
					current_team.race_count += 1
					doLog ('Race Successfull')
					document.getElementById("race-count").innerHTML = count
					if(count%15 == 0) {
						doLog ('Reached 15 races waiting 3 minutes....');
						await delay (180000 + (getRandomInt(1, 5500)));
					}
				} catch (e) {
					doLog ('Racing: ' + e.message);
				}
				updateRacequeue()

				await delay (1000 + (getRandomInt(1, 500)));
				} catch (e) {
						doLog ('Racing: ' + e.message);
						doLog ('Waiting 30 seconds....');
						await delay (30000 + (getRandomInt(1, 500)));
				}
				racingTeamQueue.enqueue(current_team)			
		}	
	}
}

function getFees(gear_level, rank) {
	let pay_amount = 0
	let commision_amount = 0
	switch (rank) {
		case "Rookie":
			pay_amount = (ROOKIE_GAS_COST[gear_level]).toString() + " SNAKOIL"
			commision_amount = (ROOKIE_GAS_COST[gear_level] * 0.03 + 10).toString() + " SNAKOIL"
			break;
		case "Intermediate":
			pay_amount = (INT_GAS_COST[gear_level]).toString() + " SNAKGAS"
			commision_amount = (INT_GAS_COST[gear_level] * 0.03 + 10).toString() + " SNAKGAS"
			break;
		case "Veteran":
			pay_amount = (VET_MASTER_GAS_COST[gear_level]).toString() + " SNAKPOW"
			commision_amount = (VET_MASTER_GAS_COST[gear_level] * 0.03 + 10).toString() + " SNAKPOW"
			break;
		case "Master":
			pay_amount = (VET_MASTER_GAS_COST[gear_level]).toString() + " SNAKVEN"
			commision_amount = (VET_MASTER_GAS_COST[gear_level] * 0.03 + 10).toString() + " SNAKVEN"
			break;
	}
	return [pay_amount, commision_amount]
}

function updateRacequeue() {
	teams = racingTeamQueue.getAllTeams()
	race_queue = document.getElementById ('race-queue');
	race_queue.textContent = ""
	team_number = 1
	console.log(teams)
	let next_racer = document.querySelectorAll('.next-racer');
	if (teams.length > 0) {
		next_racer.forEach(element => {
			element.textContent = `Race Count: ${teams[0].race_count} - Vehicle 1: ${teams[0].vech_1}, Gear: ${teams[0].gear_level}, Rank: ${teams[0].rank},  Driver 1: ${teams[0].driver_1}, Driver 2: ${teams[0].driver_2}`
		});
	}
	for (let i = 1; i < teams.length; i += 1) {
		race_queue.append (`${team_number}. Race Count: ${teams[i].race_count} - Vehicle 1: ${teams[i].vech_1}, Gear: ${teams[i].gear_level}, Rank: ${teams[i].rank},  Driver 1: ${teams[i].driver_1}, Driver 2: ${teams[i].driver_2}` + '\n');
		team_number += 1
	}
}

// Get the modal
const modal = document.getElementById("myModal");

// Get the <span> element that closes the modal
const closeBtn = modal.querySelector(".close");

// Function to open the modal
function openModal() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
closeBtn.addEventListener("click", function() {
  modal.style.display = "none";
});

// When the user clicks anywhere outside of the modal, close it
window.addEventListener("click", function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
});

function stopRaces() {
	racesStarted = false
	document.getElementById ('racing').textContent = "not racing";
	doLog('Stopping races')
}

function clearQueue() {
	racingTeamQueue.clear()
	doLog('Clearing Queue...')
	updateRacequeue()
	let next_racer = document.querySelectorAll('.next-racer');
	next_racer.forEach(element => {
		element.textContent = 'queue some racers!'
	});
	updateQueueSize()
}

function updateQueueSize() {
	document.getElementById ('queue-size').textContent = racingTeamQueue.size();
}