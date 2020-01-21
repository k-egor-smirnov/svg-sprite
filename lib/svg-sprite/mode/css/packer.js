'use strict';

/**
 * svg-sprite is a Node.js module for creating SVG sprites
 *
 * @see https://github.com/jkphl/svg-sprite
 *
 * @author Joschi Kuphal <joschi@kuphal.net> (https://github.com/jkphl)
 * @copyright © 2018 Joschi Kuphal
 * @license MIT https://raw.github.com/jkphl/svg-sprite/master/LICENSE
 */

/**
 * CSS sprite packer
 *
 * @param {Array} shapes		Spahes
 */
function SVGSpriteCssPacker(shapes) {
	this.shapes					= shapes;
	this.blocks					= [];
	this.positions				= [];
	this.shapes.forEach(function(shape, index){
		if (!shape.master) {
			var dimensions		= shape.getDimensions();
			this.blocks.push({index: index, width: dimensions.width, height: dimensions.height, margin: shape.config.spacing.margin});
		}
		this.positions.push({x: 0, y: 0});
	}, this);
	this.blocks.sort(function(a, b){
		return Math.max(b.width, b.height) - Math.max(a.width, a.height);
	});
	this.root					= {x: 0, y: 0, width: 0, height: 0};
}

/**
 * Prototype
 *
 * @type {Object}
 */
SVGSpriteCssPacker.prototype = {};

/**
 * Fit an return the shapes
 *
 * @return {Array} shapes		Packed shapes
 */
SVGSpriteCssPacker.prototype.fit = function() {
	var length					= this.blocks.length,
	width						= length ? this.blocks[0].width : 0,
	height						= length ? this.blocks[0].height : 0;
	this.root.width				= width;
	this.root.height			= height;
	
	for (var b = 0, node; b < length; ++b) {
		var margin = this.blocks[b].margin;
		
		node					= this._findNode(this.root, this.blocks[b].width, this.blocks[b].height);
    	var fit					= node ? this._splitNode(node, this.blocks[b].width, this.blocks[b].height, margin) : this._growNode(this.blocks[b].width, this.blocks[b].height, margin);
    	this.positions[this.blocks[b].index]		= {
				x: fit.x + margin.left, y: fit.y + margin.top
			};
    }
    return this.positions;
};

/**
 * Find a node
 *
 * @param {Object} root			Root
 * @param {Number} width		Width
 * @param {Number} height		Height
 */
SVGSpriteCssPacker.prototype._findNode = function(root, width, height) {
	if (root.used) {
		return this._findNode(root.right, width, height) || this._findNode(root.down, width, height);
	} else if ((width <= root.width) && (height <= root.height)) {
		return root;
	} else {
		return null;
	}
};

/**
 * Split a node
 *
 * @param {Object} node			Node
 * @param {Number} width		Width
 * @param {Number} height		Height
 */
SVGSpriteCssPacker.prototype._splitNode = function(node, width, height, margin) {
		node.used					= true;
    node.down					= {x: node.x + margin.top, y: node.y + height + margin.bottom, width: node.width, height: node.height - height};
    node.right					= {x: node.x + width + margin.bottom, y: node.y + margin.left, width: node.width - width, height: height};
    return node;
};

/**
 * Grow the sprite
 *
 * @param {Number} width		Width
 * @param {Number} height		Height
 */
SVGSpriteCssPacker.prototype._growNode = function(width, height, margin) {
    var canGrowBottom			= (width <= this.root.width),
    canGrowRight				= (height <= this.root.height),
    shouldGrowRight				= canGrowRight && (this.root.height >= (this.root.width + width)),
    shouldGrowBottom			= canGrowBottom && (this.root.width >= (this.root.height + height));
    return shouldGrowRight		? this._growRight(width, height, margin)
								: (shouldGrowBottom		? this._growBottom(width, height, margin)
														: (canGrowRight			? this._growRight(width, height, margin)
																				: (canGrowBottom		? this._growBottom(width, height, margin)
																										: null)));
};

/**
 * Grow the sprite to the right
 *
 * @param {Number} width		Width
 * @param {Number} height		Height
 */
SVGSpriteCssPacker.prototype._growRight = function(width, height, margin) {
	this.root					= {
		used					: true,
		x						: 0,
		y						: 0,
		width					: this.root.width + width,
		height					: this.root.height,
		down					: this.root,
		right					: {x: this.root.width + margin.right, y: 0, width: width, height: this.root.height}
    };
		var node					= this._findNode(this.root, width, height);

    return node ? this._splitNode(node, width, height, margin) : false;
};

/**
 * Grow the sprite to the bottom
 *
 * @param {Number} width		Width
 * @param {Number} height		Height
 */
SVGSpriteCssPacker.prototype._growBottom = function(width, height, margin) {
	this.root					= {
		used					: true,
		x						: 0,
		y						: 0,
		width					: this.root.width,
		height					: this.root.height + height,
		down					: {x: 0, y: this.root.height + margin.bottom, width: this.root.width, height: height},
		right					: this.root
    };
    var node					= this._findNode(this.root, width, height);
    return node ? this._splitNode(node, width, height, margin) : null;
};

/**
 * Module export
 */
module.exports = SVGSpriteCssPacker;
