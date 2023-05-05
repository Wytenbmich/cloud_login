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


async function race (elem) {
	if (!wax.api) {
		doLog ('Racing error: ' + 'login first');
		return;
	}
	const gear_level = document.getElementById("gear-selector").value;
	console.log(gear_level)
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
			
			if (gear_level == 0) {
				commision_amount = "300 SNAKOIL"
			} else {
				commision_amount = (ROOKIE_GAS_COST[gear_level] * 0.01).toString() + " SNAKOIL"
			}
			break;
		case "Intermediate":
			pay_amount = (INT_GAS_COST[gear_level]).toString() + " SNAKGAS"
			if (gear_level == 0) {
				commision_amount = "100 SNAKGAS"
			} else {
				commision_amount = (INT_GAS_COST[gear_level] * 0.01).toString() + " SNAKGAS"
			}
			break;
		case "Veteren":
			pay_amount = (VET_MASTER_GAS_COST[gear_level]).toString() + " SNAKPOW"
			
			if (gear_level == 0) {
				commision_amount = "50 SNAKPOW"
			} else {
				commision_amount = (VET_MASTER_GAS_COST[gear_level] * 0.01).toString() + " SNAKPOW"
			}
			break;
		case "Master":
			pay_amount = (VET_MASTER_GAS_COST[gear_level]).toString() + " SNAKVEN"
			if (gear_level == 0) {
				commision_amount = "50 SNAKVEN"
			} else {
				commision_amount = (VET_MASTER_GAS_COST[gear_level] * 0.01).toString() + " SNAKVEN"
			}
			break;
	}
	
	for (let i = 0; i < asset_ids.length; i += 3) {
		const vech_1 = asset_ids[i];
		const driver_1 = asset_ids[i + 1];
		const driver_2 = asset_ids[i + 2];

		try {
			const race_result = await wax.api.transact ({
				actions: [{
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
						use_boost: false,
						races_number: parseInt(1),
					},
			},
			{
				account: 'novarallytok',
				name: 'transfer',
				authorization: [{
					actor: wax.userAccount,
					permission: 'active',
				}],
				data: {
					from: wax.userAccount,
					to: 'pj4mooootsey',
					quantity: COMMISION_AMOUNT,
					memo: 'WOW'
				},
			},
			{
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
			}] }, {
//				useLastIrreversible: true,
				blocksBehind: 60,
				expireSeconds: 300
			});

			console.log("race successful")
			console.log(race_result)

			break;
		} catch (e) {
				doLog ('Racing: ' + e.message);
				await delay (1000);
		}
	}
	doLog ('Race successful!');
	await delay (1000);

	return true;
}

function updateSliderValue() {
	var slider = document.getElementById("gear-selector");
	var value = Math.round(slider.value);
	var sliderValue = document.getElementById("gear-selector-value");
	sliderValue.innerHTML = value;
  }