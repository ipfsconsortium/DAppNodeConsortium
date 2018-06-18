const shell = require('shelljs');
const fs = require('fs');
const ipfsAPI = require('ipfs-api');

var ipfs = ipfsAPI('ipfs.infura.io', '5001', {
	protocol: 'https'
});
//var ipfs = ipfsAPI('localhost')
var dappnode_package = JSON.parse(fs.readFileSync('dappnode_package.in.json', 'utf8'));

const NAME = dappnode_package.name;
var TAG = dappnode_package.name;
if (dappnode_package.name.startsWith("@")) {
	TAG = dappnode_package.name.slice(1);
}
const VERSION = dappnode_package.version;
const IMAGE_NAME = TAG.replace("/", "_") + "_" + VERSION;
const BUILD_DIR = './build_' + VERSION + "/";

shell.mkdir('-p', BUILD_DIR);

generate_aps();

async function generate_aps(req) {
	console.log("uploadAvatarIPFS...");
	await uploadAvatarIPFS();
	console.log("buildDockerfile...");
	await buildDockerfile();
	console.log("saveDockerImage...");
	await saveDockerImage();
	console.log("uploadDockerImageIPFS...");
	await uploadDockerImageIPFS();
	console.log("uploadManifest...");
	await uploadManifest();
}

function uploadAvatarIPFS() {
	return new Promise(function(resolve, reject) {
		var file = [{
			path: dappnode_package.avatar,
			content: fs.createReadStream(dappnode_package.avatar)
		}];

		ipfs.files.add(file)
			.then((response) => {
				dappnode_package.avatar = '/ipfs/' + response[0].hash;
				console.log(dappnode_package.avatar);
				resolve("Avatar uploaded!");
			}).catch((err) => {
				console.error(err)
			})
	});
}

function buildDockerfile() {
	return new Promise(function(resolve, reject) {
		shell.exec('docker-compose -f *.yml build --no-cache', {
			async: false
		}, function(code, stdout, stderr) {
			if (code !== 0) {
				console.log("stderr:" + stderr);
			} else {
				console.log("Image " + TAG + ":" + VERSION + " generated!");
				resolve("Image " + TAG + ":" + VERSION + " generated!");
			}
		});
	});
}

function saveDockerImage() {
	return new Promise(function(resolve, reject) {
		shell.exec('docker save ' + TAG + ":" + VERSION + " | xz -e9vT0 > " + BUILD_DIR + IMAGE_NAME + ".tar.xz", function(code, stdout, stderr) {
			if (code !== 0) {
				console.log("stderr:" + stderr);
			} else {
				console.log("Image save at " + BUILD_DIR + IMAGE_NAME + ".tar.xz");
				resolve("Image save at " + BUILD_DIR + IMAGE_NAME + ".tar.xz");
			}
		});
	});
}

function uploadDockerImageIPFS() {
	return new Promise(function(resolve, reject) {
		var file = [{
			path: IMAGE_NAME + ".tar.xz",
			content: fs.createReadStream(BUILD_DIR + IMAGE_NAME + ".tar.xz")
		}];


		ipfs.files.add(file
   //          , {
			// 	progress: (prog) => console.log('Uploading... ' + ((prog / fs.statSync(BUILD_DIR + IMAGE_NAME + ".tar.xz").size) * 100).toFixed(2) + "%")
			// }
            )
			.then((response) => {
                console.log('IPFS upload:',response[0]);
				dappnode_package.image.path = response[0].path;
				dappnode_package.image.hash = '/ipfs/' + response[0].hash;
				dappnode_package.image.size = response[0].size;
				fs.writeFile(BUILD_DIR + 'dappnode_package.json', JSON.stringify(dappnode_package, null, 2), 'utf-8', function(err) {
					if (err) {
						throw err;
					}
				});
				ipfs.pin.add(response[0].hash);
				resolve("Image uploaded!");
			}).catch((err) => {
				console.error(err)
			})
	});
}

function uploadManifest() {
	return new Promise(function(resolve, reject) {
		console.log(BUILD_DIR + "dappnode_package.json")
		var file = [BUILD_DIR + "dappnode_package.json"]
		ipfs.files.add(file, function(err, files) {
			if (err) {
				throw err
			}
			fs.writeFile(BUILD_DIR + '/manifest.json', JSON.stringify(files, null, 2), 'utf-8', function(err) {
				if (err) {
					throw err;
				}
			});
			ipfs.pin.add(files[0].hash);
			console.log("Manifest uploaded! " + files[0].hash);
			resolve("Manifest uploaded! " + files[0].hash);
		})
	});
}
