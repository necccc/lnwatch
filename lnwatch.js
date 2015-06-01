var util = require('util');
var events = require('events');
var fs = require('fs');
var path = require('path');


/**
 *
 * @param {Object} defaults
 * @constructor
 */
function LnWatch (defaults) {
	events.EventEmitter.call(this);

	if (defaults) {
		this.defaults = defaults;
	}
}

util.inherits(LnWatch, events.EventEmitter);

LnWatch.prototype.defaults = {
	persistent: true,
	interval: 0
};

LnWatch.prototype.links = {};

/**
 *
 * @param {String|Array} links
 */
LnWatch.prototype.add = function (links) {

	var linkArray = [];

	if (links instanceof Array.prototype.constructor) {
		linkArray = linkArray.concat(links)
	} else if (typeof links === 'string') {
		linkArray.push(links)
	}

	linkArray.map(resolve.bind(this))
}

/**
 * remove selected links from being watched
 * @param {String|Array} links
 */
LnWatch.prototype.remove = function (links) {

	var linkArray = [];

	if (links instanceof Array.prototype.constructor) {
		linkArray = linkArray.concat(links)
	} else if (typeof links === 'string') {
		linkArray.push(links)
	}

	linkArray.map(function (link) {
		var linkPath = path.resolve('.', link);
		if (this.links[linkPath]) {
			remove.call(this, linkPath);
		}
	}.bind(this));
}

/**
 * remove all watched links
 */
LnWatch.prototype.removeAll = function () {

	for (var link in this.links) {
		var linkPath = path.resolve('.', link);
		remove.call(this, linkPath);
	}
}

var remove = function (link) {
	fs.unwatchFile(link);
	this.links[link] = null;
	delete this.links[link];
}

var resolve = function (link, i) {
	var resolvedLink = path.resolve('.', link)
	fs.readlink(resolvedLink, update.bind(this, resolvedLink));
}

var update = function (link, err, linkTarget) {
	if (err) {
		// bad link/path
		return;
	}

	this.links[link] = path.resolve('.', linkTarget);

	fs.watchFile(
		link,
		this.defaults,
		watcher.bind(this, link)
	);
}

var watcher = function (link, changeEvent) {
	fs.readlink(link, validate.bind(this, link));
}

var validate = function (link, err, linkTarget) {
	var resolvedLink = path.resolve('.', linkTarget);
	var originalTarget = this.links[link];

	if (originalTarget !== resolvedLink) {
		this.emit('change', {
			link: link,
			from: originalTarget,
			to: resolvedLink
		});
		this.links[link] = resolvedLink;
	}
}

module.exports = new LnWatch();
