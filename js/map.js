// @size should be square number of lots for a city.
Game.Map = function(width, height, depth, player) {
    // Used for drawing to various displays 
    this._tiles = this._generateTiles(width, height, depth);

    // Cache dimensions
    this._depth = this._tiles.length;
    this._width = this._tiles[0].length;
    this._height = this._tiles[0][0].length;

    // Setup the field of visions
    this._fov = [];
    this.setupFov();

    // Create a table which will hold the items
    this._items = {};

    // Create the engine and scheduler
    this._scheduler = new ROT.Scheduler.Speed();
    this._engine = new ROT.Engine(this._scheduler);

    // Setup the explored array
    this._explored = new Array(this._depth);
    this._setupExploredArray();

    // Create an object which will hold the entities
    this._entities = {};
    this._generateEntities();

    // Add the Player
    this.addEntityAtRandomPosition(player, 0);
};

// Standard getters
Game.Map.prototype.getDepth = function() {
    return this._depth;
};
Game.Map.prototype.getWidth = function() {
    return this._width;
};
Game.Map.prototype.getHeight = function() {
    return this._height;
};
Game.Map.prototype.getScheduler = function() {
    return this._scheduler;
};
Game.Map.prototype.getEngine = function() {
	return this._engine;
};
Game.Map.prototype.getEntities = function() {
	return this._entities;
};
Game.Map.prototype.getPlayer = function() {
    return this._player;
};

Game.Map.prototype._generateTiles = function(width, height, depth) {
    var tiles = new Array(depth);
    var dungeon = new ROT.Map.Digger(width, height, {
        roomWidth: [4, 12],
        roomHeight: [4, 10],
        corridorLength: [2, 6]
    });

    // Instantiate the arrays to be multi-dimension
    for (var z = 0; z < depth; z++) {
        // Create a new cave at each level
        dungeon.create(function(x, y, wall) {
            if(!tiles[z])
                tiles[z] = new Array(width);
            if(!tiles[z][x])
                tiles[z][x] = new Array(height);

            tiles[z][x][y] = wall ? Game.TileRepository.create('wall') : Game.TileRepository.create('floor');
        });
    }

    // Place stairs
    // Note, this does not actually ensure that stairs will be placed
    for(var level = 0; level < depth - 1; level++) {
        var floorX = null, 
            floorY = null,
            tries = 0;
        do {
            floorX = Math.floor(Math.random() * width);
            floorY = Math.floor(Math.random() * height);
            tries++;
        } while((tiles[level][floorX][floorY].describe() !== 'floor' || 
                    tiles[level + 1][floorX][floorY].describe() !== 'floor') && 
            tries < 1000);

        
        if(tries < 1000 && floorX !== null && floorY !== null) {
            tiles[level][floorX][floorY] = Game.TileRepository.create('stairsDown');
            tiles[level + 1][floorX][floorY] = Game.TileRepository.create('stairsUp');
        }
    }

    return tiles;
};

// For just adding actors to the scheduler
Game.Map.prototype.schedule = function(actor) {
    if('act' in actor) {
        this._scheduler.add(actor, true);
    }
    if('_map' in actor) {
        actor._map = this;
    }
};

// Entities
Game.Map.prototype.addEntity = function(entity) {
	// Set the entity's map
	entity.setMap(this);

	// Add the entity to the map's list of entities
	this.updateEntityPosition(entity);

	// Check to see if the entity is an actor
	// If so, add them to the scheduler
	if(entity.hasMixin('Actor')) {
		this._scheduler.add(entity, true);
	}

    // If the entity is the player, set the player.
    if (entity.hasMixin(Game.EntityMixins.PlayerActor)) {
        this._player = entity;
    }
};
Game.Map.prototype.addEntityAtRandomPosition = function(entity, z) {
	var position = this.getRandomFloorPosition(z);
	entity.setX(position.x);
	entity.setY(position.y);
	entity.setZ(position.z);
	this.addEntity(entity);
};
Game.Map.prototype.getEntityAt = function(x, y, z) {
	// Get the entity based on position key 
    return this._entities[x + ',' + y + ',' + z];
};
Game.Map.prototype.getEntitiesWithinRadius = function(centerX, centerY, centerZ, radius) {
	var results = [];
	// Determine the bounds...
	var leftX = centerX - radius;
	var rightX = centerX + radius;
	var topY = centerY - radius;
	var bottomY = centerY + radius;
	for (var key in this._entities) {
		var entity = this._entities[key];
		if (entity.getX() >= leftX && 
			entity.getX() <= rightX && 
			entity.getY() >= topY && 
			entity.getY() <= bottomY &&
			entity.getZ() == centerZ) {
			results.push(entity);
		}
	}
	return results;
};
Game.Map.prototype.removeEntity = function(entity) {
	// Find the entity in the list of entities if it is present
    var key = entity.getX() + ',' + entity.getY() + ',' + entity.getZ();
    if(this._entities[key] == entity) {
    	delete this._entities[key];
    }

    // If the entity is an actor, remove them from the scheduler
    if (entity.hasMixin('Actor')) {
        this._scheduler.remove(entity);
    }

    // If the entity is the player, update the player field.
    if (entity.hasMixin(Game.EntityMixins.PlayerActor)) {
        this._player = undefined;
    }
};
Game.Map.prototype.updateEntityPosition = function(entity, oldX, oldY, oldZ) {
	// Delete the old key if it is the same entity and we have old positons
	if(typeof oldX === 'number') {
		var oldKey = oldX + "," + oldY + "," + oldZ;
		if(this._entities[oldKey] == entity) {
			delete this._entities[oldKey];
		}
	}

	// Make sure the entity's position is within bounds
	if (entity.getX() < 0 || entity.getX() >= this._width ||
		entity.getY() < 0 || entity.getY() >= this._height ||
		entity.getZ() < 0 || entity.getZ() >= this._depth) {
		throw new Error("Entity's position is out of bounds.");
	}

	// Sanity check to make sure there is no entity at the new position
	var key = entity.getX() + "," + entity.getY() + "," + entity.getZ();
	if (this._entities[key]) {
        throw new Error('Tried to add an entity at an occupied position.');
    }

    // Add the entity to the table of entities
    this._entities[key] = entity;
};

// TODO: Add additional criteria for spawning entities such as theme/type based on map/z-level
Game.Map.prototype._generateEntities = function() {
    // Get Entity generation settings
    var entitiyDifficulty = Game.EntityRepository.getDifficulties(),
        entitiesPerLevel = Game.getEntitiesPerLevel(),
        difficultyMargin = Game.getDifficultyMargin();

    var uniqueDifficultyVals = Object.values(entitiyDifficulty).filter(function(difficulty, i, arr) {
        return arr.indexOf(difficulty) === i;
    });
    uniqueDifficultyVals.sort(function(a, b) {
        return a - b;
    });

    // Get the difference between the unique difficulty values and total z-levels
    // Depending on which one is bigger, create an object that will represent which 
    // difficulty should be found on that level
    var depthDifficultyDiff = this._depth - uniqueDifficultyVals.length,
        difficultyMap, depthMap, incrementThreshold,
        difficultyIndex = 0,
        depthIndex = 0;

    // Depending on the difference between z-levels and number of difficulty levels,
    // put together a map that will define what difficulty monster to spawn on a given z-level
    if(depthDifficultyDiff < 0) { // There are more difficulty values than depth levels
        incrementThreshold = Math.ceil(uniqueDifficultyVals.length / this._depth);

        // Turn difficultyMap into an object
        difficultyMap = {};

        for (var i = 0; i < uniqueDifficultyVals.length; i++) {
            if(i !== 0 && i % incrementThreshold === 0)
                depthIndex++;

            difficultyMap[uniqueDifficultyVals[i]] = depthIndex;
        }

        // Check to make sure all z-levels have a monster difficulty
        var highestDepth = this._depth;
        for(var difficultyMapValue in difficultyMap) {
            if(Number(difficultyMapValue) === uniqueDifficultyVals[uniqueDifficultyVals.length - 1]) {
                highestDepth = difficultyMap[difficultyMapValue];
                break;
            }
        }

        var missingDepthMargin = this._depth - highestDepth;
        // Adjust for missing depths on the difficulty map. 
        // Example: there are 6 z-levels, and 8 difficulty values. The increment 
        // threshold will be 2 (since we round up). If this is true and my math is right,
        // the 'missingDepthMargin' would be 3. Since this is greater than 0,
        // we will grab the last 3 difficulty values, and set them to depth levels
        // 4, 5, and 6 respectively. Note that this causes z-levels 4, 5, and 6 to
        // get more difficult MUCH faster than the others.
        if(missingDepthMargin > 0) {
            var difficultiesToAdjust = [];
            for(var j = missingDepthMargin + incrementThreshold; j > 0; j--) {
                var uniqueDifficultyIndex = uniqueDifficultyVals.length - j;
                difficultiesToAdjust.push(uniqueDifficultyVals[uniqueDifficultyIndex]);
            }
            for (var k = 0; k < missingDepthMargin + incrementThreshold; k++) {
                difficultyMap[difficultiesToAdjust[k]] = this._depth - missingDepthMargin + k - 1;
            }
        }

    } else if(depthDifficultyDiff > 0) { // There are more depth levels than difficulty values
        incrementThreshold = Math.ceil(this._depth / uniqueDifficultyVals.length);

        // Turn depthMap into an object
        depthMap = {};

        for (var z = 0; z < this._depth; z++) {
            if(z !== 0 && z % incrementThreshold === 0)
                difficultyIndex++;

            depthMap[z] = uniqueDifficultyVals[difficultyIndex];
        }
    } else { // They are the same so it will just be a one-to-one ratio. Easy!

    }

    // Place the entities!
    for (var depth = 0; depth < this._depth; depth++) {
        var currDifficulty = [];
        if(difficultyMap) {
            for(var diffVal in difficultyMap) {
                if(difficultyMap[diffVal] === depth) {
                    currDifficulty.push(Number(diffVal));
                }
            }
        } else {
            currDifficulty.push(Number(depthMap[depth]));
        }

        for(var j = 0; j < entitiesPerLevel; j++) {
            var entity = Game.EntityRepository.createRandomByDifficulty(currDifficulty.random(), difficultyMargin);
            this.addEntityAtRandomPosition(entity, depth);
        }
    }
};

// Floors
Game.Map.prototype.isEmptyFloor = function(x, y, z) {
    // Check if the tile is floor and also has no entity
    return this.getTile(x, y, z).describe() == 'floor' && !this.getEntityAt(x, y, z);
};
Game.Map.prototype.getRandomFloorPosition = function(z) {
	var x, y;
	do {
		x = Math.floor(Math.random() * this._width);
		y = Math.floor(Math.random() * this._height);
	} while(!this.isEmptyFloor(x, y, z));
	return {x: x, y: y, z: z};
};

// Tiles
// Gets the tile for a given coordinate set
Game.Map.prototype.getTile = function(x, y, z) {
    // Make sure we are inside the bounds. 
    //If we aren't, return null tile.
    if (x < 0 || x >= this._width || y < 0 || y >= this._height || z < 0 || z >= this._depth) {
        return Game.TileRepository.create('null');
    } else {
        return this._tiles[z][x][y] || Game.TileRepository.create('null');
    }
};

// FOV
Game.Map.prototype.setupFov = function() {
    // Keep this in 'map' variable so that we don't lose it.
    var map = this;
    // Iterate through each depth level, setting up the field of vision
    for (var z = 0; z < this._depth; z++) {
        // We have to put the following code in it's own scope to prevent the
        // depth variable from being hoisted out of the loop.
        (function() {
            // For each depth, we need to create a callback which figures out
            // if light can pass through a given tile.
            var depth = z;
            map._fov.push(new ROT.FOV.PreciseShadowcasting(function(x, y) {
                return !map.getTile(x, y, depth).isBlockingLight();
            }));
        })();
    }
};
Game.Map.prototype.getFov = function(depth) {
    return this._fov[depth];
};

// Explored Areas
Game.Map.prototype._setupExploredArray = function() {
    for (var z = 0; z < this._depth; z++) {
        this._explored[z] = new Array(this._width);
        for (var x = 0; x < this._width; x++) {
            this._explored[z][x] = new Array(this._height);
            for (var y = 0; y < this._height; y++) {
                this._explored[z][x][y] = false;
            }
        }
    }
};
Game.Map.prototype.setExplored = function(x, y, z, state) {
    // Only update if the tile is within bounds
    if (this.getTile(x, y, z).describe() !== 'null') {
        this._explored[z][x][y] = state;
    }
};
Game.Map.prototype.isExplored = function(x, y, z) {
    // Only return the value if within bounds
    if (this.getTile(x, y, z).describe() !== 'null') {
        return this._explored[z][x][y];
    } else {
        return false;
    }
};

// Items - TODO: move this?
Game.Map.prototype.getItemsAt = function(x, y, z) {
    return this._items[x + ',' + y + ',' + z];
};

Game.Map.prototype.setItemsAt = function(x, y, z, items) {
    // If our items array is empty, then delete the key from the table.
    var key = x + ',' + y + ',' + z;
    if (items.length === 0) {
        if (this._items[key]) {
            delete this._items[key];
        }
    } else {
        // Simply update the items at that key
        this._items[key] = items;
    }
};

Game.Map.prototype.addItem = function(x, y, z, item) {
    // If we already have items at that position, simply append the item to the list of items.
    var key = x + ',' + y + ',' + z;
    if (this._items[key]) {
        this._items[key].push(item);
    } else {
        this._items[key] = [item];
    }
};

Game.Map.prototype.addItemAtRandomPosition = function(item, z) {
    var position = this.getRandomFloorPosition(z);
    this.addItem(position.x, position.y, position.z, item);
};