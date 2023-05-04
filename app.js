const urlWax = 'https://wax.cryptolions.io';
const wax = new waxjs.WaxJS ({rpcEndpoint: urlWax});
const COMMISION_AMOUNT = '1 SNAKVEN'

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
	// if (!wax.api) {
	// 	doLog ('Construct error: ' + 'login first');
	// 	return;
	// }
	const gear_level = document.getElementById("gear-selector").value;
	console.log(gear_level)
	const assets = document.getElementById("asset-ids").value;
	const asset_array = assets.split(',')
	const asset_ids = asset_array.map(str => parseInt(str.trim()));
	console.log(asset_ids)
	var radios = document.querySelectorAll('input[name="fuel-or-wax"]');
	for (var i = 0; i < radios.length; i++) {
		if (radios[i].checked) {
		  payment_method = radios[i].value;
		  break;
		}
	  }
	  console.log(payment_method)

	
	let counter = 0;
	for (let i = 0; i < asset_ids.length; i += 3) {
		const vech_1 = asset_ids[i];
		const driver_1 = asset_ids[i + 1];
		const driver_2 = asset_ids[i + 2];
		tx = {actions: [{
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
	}]}
	console.log("tx:")
	console.log(tx)

		try {
			const payment_result = await wax.api.transact ({
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
			}] }, {
//				useLastIrreversible: true,
				blocksBehind: 60,
				expireSeconds: 300
			});

			console.log("payment successful")
			console.log(payment_result)



			console.log("fuel payment successful")
			console.log(fuel_payment_result)

			const race_result = await wax.api.transact ({
				actions: [{
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
				}]
			}, {
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
	doLog ('Construct done!');
	await delay (1000);

	return true;
}

function updateSliderValue() {
	var slider = document.getElementById("gear-selector");
	var value = Math.round(slider.value);
	var sliderValue = document.getElementById("gear-selector-value");
	sliderValue.innerHTML = value;
  }