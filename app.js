const urlWax = 'https://wax.cryptolions.io';
const wax = new waxjs.WaxJS ({rpcEndpoint: urlWax});

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
}


async function race () {
	if (!wax.api) {
		doLog ('Racing error: ' + 'login first');
		return;
	}
	const gear_level = document.getElementById("gear-selector").value;
	console.log(gear_level)
	const boost = document.getElementById("use-boost");

	let use_boost = false
	if (boost.checked) {
		use_boost = true;
	} else {
		use_boost = false;
	}
	console.log("booost: " + use_boost)
	const assets = document.getElementById("asset-ids").value;
	const asset_array = assets.split(',')
	const asset_ids = asset_array.map(str => parseInt(str.trim()));
	console.log(asset_ids)
	var radios = document.querySelectorAll('input[name="rank"]');
	for (var i = 0; i < radios.length; i++) {
		if (radios[i].checked) {
		  rank = radios[i].value;
		  break;
		}
	  }
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
	let count = 0
	while (true) {
		for (let i = 0; i < asset_ids.length; i += 3) {
			const vech_1 = asset_ids[i];
			const driver_1 = asset_ids[i + 1];
			const driver_2 = asset_ids[i + 2];
			if(i%45 == 0 && i != 0) {
				doLog("15 Racers reached this session, delaying 5 mins")
				await delay (300000 + (getRandomInt(1, 5500)));
			}
			tx = getTransactions(commision_amount, pay_amount, vech_1, driver_1, driver_2, gear_level, use_boost)

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
					doLog ('Race Successfull')
					document.getElementById("race-count").innerHTML = count
				} catch (e) {
					doLog ('Racing: ' + e.message);
				}

				await delay (1000);
			} catch (e) {
					doLog ('Racing: ' + e.message);
					await delay (1000 + (getRandomInt(1, 500)));
			}
		}
		doLog ('Finished racing all assets!');
		doLog ('Waiting 5 for new races to start');
		// Delay 5~ mins before calling assets again
		await delay (300000 + (getRandomInt(1, 5500)));
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
