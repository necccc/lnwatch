var fs = require('fs');
var lnw = require('../lnwatch.js');
var assert = require('assert');

lnw.defaults.interval = 1000;

var exec = require('child_process').exec;

var ln_sfn = function (from, to) {

	function puts(error, stdout, stderr) {
		if (error) {
			throw error;
		}
	}

	exec(['ln -sfn', from, to].join(' '), puts);
}

suite('lnwatch', function() {

	setup(function () {
		fs.mkdirSync('./one');
		fs.mkdirSync('./two');
		fs.mkdirSync('./three');

		fs.symlinkSync('./one', './foo');
		fs.symlinkSync('./two', './bar');
	});

	teardown(function () {
		fs.unlinkSync('./foo');
		fs.unlinkSync('./bar');

		fs.rmdirSync('./three');
		fs.rmdirSync('./two');
		fs.rmdirSync('./one');
	});

	test("single link", function (done) {

		this.timeout(10000);

		lnw.add('./foo');

		lnw.on('change', function (data) {
			
			var linka = data.link.split('/');
			var froma = data.from.split('/');
			var toa = data.to.split('/');

			assert.equal(linka[linka.length-1],'foo');
			assert.equal(froma[froma.length-1],'one');
			assert.equal(toa[toa.length-1],'three');

			lnw.remove('./foo');
			lnw.removeAllListeners('change');

			done();
		});

		ln_sfn('./three', './foo');
	});


	test("multiple links", function (done) {

		this.timeout(6000);

		lnw.add(['./foo', './bar']);

		lnw.on('change', function (data) {

			var linka = data.link.split('/');
			var froma = data.from.split('/');
			var toa = data.to.split('/');

			assert.equal(linka[linka.length-1],'bar');
			assert.equal(froma[froma.length-1],'two');
			assert.equal(toa[toa.length-1],'three');

			lnw.remove(['./foo', './bar']);
			lnw.removeAllListeners('change');

			done();
		});

		ln_sfn('./three', './bar');
	});

	test("add link later", function (done) {

		this.timeout(6000);

		var count = 0;

		lnw.add('./foo');

		lnw.on('change', function (data) {

			count++;

			if (count === 2) {
				var linka = data.link.split('/');
				var froma = data.from.split('/');
				var toa = data.to.split('/');

				assert.equal(linka[linka.length-1],'bar');
				assert.equal(froma[froma.length-1],'two');
				assert.equal(toa[toa.length-1],'one');

				lnw.remove('./foo');
				lnw.remove( './bar');
				lnw.removeAllListeners('change');

				done();
			}
		});

		ln_sfn('./three', './foo');

		lnw.add('./bar');

		setTimeout(function () {

			ln_sfn('./one', './bar')
		}, 1000);

	});

	test("remove all", function (done) {

		this.timeout(6000);

		lnw.add(['./foo', './bar']);

		lnw.on('change', function (data) {

			var linka = data.link.split('/');
			var froma = data.from.split('/');
			var toa = data.to.split('/');

			assert.equal(linka[linka.length-1],'foo');
			assert.equal(froma[froma.length-1],'one');
			assert.equal(toa[toa.length-1],'three');

			lnw.removeAll();
			lnw.removeAllListeners('change');

			done();
		});

		ln_sfn('./three', './foo');

	});

});