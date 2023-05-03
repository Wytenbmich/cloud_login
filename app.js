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


async function construct (elem) {
	if (!wax.api) {
		doLog ('Construct error: ' + 'login first');
		return;
	}

	const steps = 2;
	for (var step = 0; step < steps; step++) {
		try {
			const result = await wax.api.transact ({
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
			break;
		} catch (e) {
				doLog ('Construct error: ' + e.message);
				await delay (1000);
		}
	}
	doLog ('Construct done!');
	await delay (1000);

	return true;
}
