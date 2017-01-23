// From http://www.codingcookies.com/2013/04/20/building-a-roguelike-in-javascript-part-4/
Game.EntityMixins = {};

Game.EntityMixins.CorpseDropper = {
    name: 'CorpseDropper',
    init: function(template) {
        // Chance of dropping a corpse (out of 100).
        this._corpseDropRate = template['corpseDropRate'] || 100;
    },
    listeners: {
        onDeath: function(attacker) {
            // Check if we should drop a corpse.
            if (Math.round(Math.random() * 100) <= this._corpseDropRate) {
                // Create a new corpse item and drop it.
                this._map.addItem(this.getX(), this.getY(), this.getZ(),
                    Game.ItemRepository.create('corpse', {
                        name: this._name + ' corpse',
                        foreground: this._foreground
                    }));
            }    
        }
    }
};
Game.EntityMixins.Destructible = {
    name: 'Destructible',
    init: function(template) {
        this._maxHp = 10 + Math.max(0, this.getTough() * this.getLevel()) + (2 * this.getLevel());
        this._hp = template['hp'] || this._maxHp;
        this._defenseValue = template['defenseValue'] || 0;
    },
    getDefenseValue: function() {
        var modifier = 0;
        // If we can equip items, then have to take into 
        // consideration weapon and armor
        if (this.hasMixin(Game.EntityMixins.Equipper)) {
            var equipment = this.getEquipment();
            for(var i = 0; i < equipment.length; i++) {
                var item = equipment[i],
                    stat = item.getDefenseStatModifier();
                modifier += item.getDefenseValue();

                if(stat)
                   modifier += this.getStat(stat);
            }
        }
        return this._defenseValue + modifier + this.getTough();
    },
    getHp: function() {
        return this._hp;
    },
    getMaxHp: function() {
        return this._maxHp;
    },
    setHp: function(hp) {
        this._hp = hp;
    },
    setMaxHp: function(maxHp) {
        this._maxHp = maxHp;
    },
    updateMaxHp: function() {
        this._maxHp = 10 + Math.max(0, this.getTough() * this.getLevel()) + (2 * this.getLevel());
    },
    takeDamage: function(attacker, damage) {
        this._hp -= damage;
        if(this._hp <= 0) {
            Game.sendMessage(attacker, 'You kill the %s!', [this.getName()]);
            // Raise events
            this.raiseEvent('onDeath', attacker);
            attacker.raiseEvent('onKill', this);
            this.kill();
        }
    },
    increaseDefenseValue: function(value) {
        // If no value was passed, default to 2.
        value = value || 2;
        // Add to the defense value.
        this._defenseValue += value;
        Game.sendMessage(this, "You look tougher!");
    },
    increaseMaxHp: function(value) {
        // If no value was passed, default to 10.
        value = value || 10;
        // Add to both max HP and HP.
        this._maxHp += value;
        this._hp += value;
        Game.sendMessage(this, "You look healthier!");
    },
    listeners: {
        onGainLevel: function() {
            // Heal the entity.
            this.setHp(this.getMaxHp());
        },
        details: function() {
            return [
                {key: 'defense', value: this.getDefenseValue()},
                {key: 'hp', value: this.getHp()}
            ];
        }
    }
};
Game.EntityMixins.Equipper = {
    name: 'Equipper',
    init: function(template) {
        this._equipmentSlots = {
            rightHand: null,
            leftHand: null,
            body: null,
            head: null,
            feet: null,
        };
    },
    getEquipment: function() {
        var equipment = [];
        for(var slot in this._equipmentSlots) {
            if(this._equipmentSlots[slot] !== null) {
                equipment.push(this._equipmentSlots[slot]);
            }
        }
        return equipment;
    },
    getEquipmentSlots: function() {
        return this._equipmentSlots;
    },
    getSlot: function(slot) {
        return this._equipmentSlots[slot];
    },
    hasRangedEquipped: function() {
        return (this._equipmentSlots.rightHand && this._equipmentSlots.rightHand.getType() === 'ranged') || 
            (this._equipmentSlots.leftHand && this._equipmentSlots.leftHand.getType() === 'ranged');
    },
    equip: function(item, slot) {
        // If an item is already in a given slot, try to put it in inventory or drop it
        if(this._equipmentSlots[slot] !== null)
            this.unequip(slot);

        // If an item is 2 handed, you can only have one of them equipped in your hands at a time
        if(item.getHands() === 2) {
            if(this._equipmentSlots.rightHand !== null)
                this.unequip('rightHand');
            if(this._equipmentSlots.leftHand !== null)
                this.unequip('leftHand');
        }

        this._equipmentSlots[slot] = item;
        this._equipmentSlots[slot].equipped(); // sets the state of the item to equipped == true;
    },
    equipFromInventory: function(index, slot) {
        if(this.hasMixin('InventoryHolder')) {
            var item = this.getItem(index);
            this.equip(item, slot);
            this.removeItem(index);
            Game.sendMessage(this, "You equiped %s.", [item.describeA()]);
        }
    },
    reload: function(slot) {
        if(this._equipmentSlots[slot].hasMixin('UsesAmmo')) {
            var weapon = this._equipmentSlots[slot],
                currAmmo = weapon.getAmmo(),
                ammoType = weapon.getAmmoType(),
                clipSize = weapon.getClipSize(),
                diff = clipSize,
                items = this.getItems(),
                successfulReload = false;
            if(currAmmo)
                diff = clipSize - currAmmo.amount();

            if(diff <= 0) {
                Game.sendMessage(this, "Your %s does not need to be reloaded", [weapon.describe()]);
                return false;
            }

            for (var i = 0; i < items.length; i++) {
                if(items[i] && items[i].hasMixin('Equippable') && items[i].getType() === 'ammo' && items[i].getName() === ammoType) {
                    // Try to refill your weapon with only the amount that it needs, given the amount that you have
                    var ammoAmount = items[i].amount(),
                        realAmount = 0;

                    if(ammoAmount >= diff)
                        realAmount = diff;
                    else
                        realAmount = ammoAmount;

                    // Remove from inventory...
                    this.removeItem(i, realAmount);

                    // And then update the ammo in the weapon
                    this._equipmentSlots[slot].addAmmo(realAmount);
                    Game.sendMessage(this, 'You reload %s with %s %s', [weapon.describeThe(), realAmount, ammoType + 's']);
                    successfulReload = true;
                    break;
                }
            }

            if(!successfulReload)
                Game.sendMessage(this, 'You don\'t have any %s to reload your %s with.', [ammoType + 's', weapon.describeThe()]);
        }
    },
    unload: function(slot, amount) {
        if(this._equipmentSlots[slot].hasMixin('UsesAmmo'))
            this._equipmentSlots[slot].removeAmmo(amount);
    },
    unequip: function(slot) {
        var inInventory = false;
        if(this.hasMixin('InventoryHolder'))
            inInventory = this.addItem(this._equipmentSlots[slot]);

        // If the inventory is full, drop it if possible
        if(!inInventory && this._map) {
            this._map.addMap(this.getX(), this.getY(), this.getZ(), this._equipmentSlots[slot]);
            Game.sendMessage(this, "You drop %s on the ground", [this._equipmentSlots[slot].describeThe()]);
        } else {
            Game.sendMessage(this, "You put %s in your backpack", [this._equipmentSlots[slot].describeThe()]);
        }

        this._equipmentSlots[slot].unequipped();  // sets the state of the item to equipped == false;
        this._equipmentSlots[slot] = null;
    }
};
Game.EntityMixins.ExperienceGainer = {
    name: 'ExperienceGainer',
    init: function(template) {
        this._experience = template['experience'] || 0;
        this._statPointsPerLevel = template['statPointsPerLevel'] || 1;
        this._statPoints = 0;
        // Determine what stats can be levelled up.
        this._statOptions = [];
        if (this.hasMixin('Destructible')) {
            this._statOptions.push(['Increase defense value', this.increaseDefenseValue]);   
            this._statOptions.push(['Increase max health', this.increaseMaxHp]);
        }
        if (this.hasMixin('Thrower')) {
            this._statOptions.push(['Increase throwing skill', this.increaseThrowingSkill]);
        }
    },
    getExperience: function() {
        return this._experience;
    },
    getNextLevelExperience: function() {
        return (this._level * this._level) * 10;
    },
    getStatPoints: function() {
        return this._statPoints;
    },
    setStatPoints: function(statPoints) {
        this._statPoints = statPoints;
    },
    getStatOptions: function() {
        return this._statOptions;
    },
    giveExperience: function(points) {
        var statPointsGained = 0;
        var levelsGained = 0;
        // Loop until we've allocated all points.
        while(points > 0) {
            // Check if adding in the points will surpass the level threshold.
            if(this._experience + points >= this.getNextLevelExperience()) {
                // Fill our experience till the next threshold.
                var usedPoints = this.getNextLevelExperience() - this._experience;
                points -= usedPoints;
                this._experience += usedPoints;
                // Level up our entity!
                this._level++;
                levelsGained++;
                this._statPoints += this._statPointsPerLevel;
                statPointsGained += this._statPointsPerLevel;
            } else {
                // Simple case - just give the experience.
                this._experience += points;
                points = 0;
            }
        }
        // Check if we gained at least one level.
        if (levelsGained > 0) {
            Game.sendMessage(this, "You advance to level %s.", [this._level]);
            this.raiseEvent('onGainLevel');
        }
    },
    listeners: {
        onKill: function(victim) {
            // TODO: Determine how experience is earned
            var exp = victim.getMaxHp() + victim.getDefenseValue();
            if (victim.hasMixin('MeleeAttacker')) {
                exp += victim.getMeleeAttackValue();
            }
            // Account for level differences
            if (victim.hasMixin('ExperienceGainer')) {
                exp -= (this.getLevel() - victim.getLevel()) * 3;
            }
            // Only give experience if more than 0.
            if (exp > 0) {
                this.giveExperience(exp);
            }
        },
        details: function() {
            return [{key: 'level', value: this.getLevel()}];
        }
    }
};
Game.EntityMixins.FoodConsumer = {
    name: 'FoodConsumer',
    init: function(template) {
        this._maxFullness = template['maxFullness'] || 1000;
        // Start halfway to max fullness if no default value
        this._fullness = template['fullness'] || (this._maxFullness / 2);
        // Number of points to decrease fullness by every turn.
        this._fullnessDepletionRate = template['fullnessDepletionRate'] || 1;
    },
    addTurnHunger: function() {
        // Remove the standard depletion points
        this.modifyFullnessBy(-this._fullnessDepletionRate);
    },
    modifyFullnessBy: function(points) {
        this._fullness = this._fullness + points;
        if (this._fullness <= 0) {
            this.kill("You have died of starvation!");
        } else if (this._fullness > this._maxFullness) {
            this.kill("You choke and die!");
        }
    },
    getHungerState: function() {
        // Fullness points per percent of max fullness
        var perPercent = this._maxFullness / 100;
        // 5% of max fullness or less = starving
        if(this._fullness <= perPercent * 5) {
            return 'Starving';
        // 25% of max fullness or less = hungry
        } else if (this._fullness <= perPercent * 25) {
            return 'Hungry';
        // 95% of max fullness or more = oversatiated
        } else if (this._fullness >= perPercent * 95) {
            return 'Oversatiated';
        // 75% of max fullness or more = full
        } else if (this._fullness >= perPercent * 75) {
            return 'Full';
        // Anything else = not hungry
        } else {
            return 'Not Hungry';
        }
    }
};
Game.EntityMixins.FungusActor = {
    name: 'FungusActor',
    groupName: 'Actor',
    init: function() {
        this._growthsRemaining = 5;
    },
    act: function() {
        if(this._growthsRemaining > 0) {
            if(Math.random() <= 0.02) {
                // Generate the coordinates of a random adjacent square by
                // generating an offset between [-1, 0, 1] for both the x and
                // y directions. To do this, we generate a number from 0-2 and then
                // subtract 1.
                var xOffset = Math.floor(Math.random() * 3) - 1;
                var yOffset = Math.floor(Math.random() * 3) - 1;
                // Make sure we aren't trying to spawn on the same tile as us
                if (xOffset != 0 || yOffset != 0) {
                    // Check if we can actually spawn at that location, and if so
                    // then we grow!
                    if (this.getMap().isEmptyFloor(this.getX() + xOffset, this.getY() + yOffset, this.getZ())) {
                        var entity = Game.EntityRepository.create('fungus');
                        entity.setPosition(this.getX() + xOffset, this.getY() + yOffset, this.getZ());
                        this.getMap().addEntity(entity);
                        this._growthsRemaining--;

                        // Send a message nearby!
                        Game.sendMessageNearby(this.getMap(), entity.getX(), entity.getY(), entity.getZ(), 'The fungus is spreading!');
                    }
                }
            }
        }
    }
};
Game.EntityMixins.InventoryHolder = {
    name: 'InventoryHolder',
    init: function(template) {
        // Default to 10 inventory slots.
        var inventorySlots = template['inventorySlots'] || 10;
        // Set up an empty inventory.
        this._items = new Array(inventorySlots);

        // If the template specifies items, put them in the entity's inventory
        if(template['items']) {
            for (var i = 0; i < template['items'].length; i++) {
                this._items[i] = Game.ItemRepository.create(template['items'][i]);
            }
        }
    },
    getItems: function() {
        return this._items;
    },
    getItem: function(i) {
        return this._items[i];
    },
    addItem: function(item) {
        // Try to find a slot, returning true only if we could add the item.

        // Check to see if we can stack the item unless we find an open slot first
        if(item.hasMixin('Stackable')) {
            for (var i = 0; i < this._items.length; i++) {
                if (!this._items[i]) {
                    this._items[i] = item;
                    return true;
                } else if(this._items[i].describe() == item.describe()) {
                    this._items[i].addToStack();
                    return true;
                }
            }
        } else {
            for (var i = 0; i < this._items.length; i++) {
                if (!this._items[i]) {
                    this._items[i] = item;
                    return true;
                }
            }
        }        
        return false;
    },
    removeItem: function(i, amount) {
        // If the item is in a stack, decrement the stack amount
        if(this._items[i].hasMixin('Stackable') && this._items[i].amount() > 1) {
            this._items[i].removeFromStack(amount);
            if(this._items[i].amount() <= 0) {
                this._items[i] = null;
            }
        } else {
            this._items[i] = null;
        }
    },
    canAddItem: function() {
        // Check if we have an empty slot.
        for (var i = 0; i < this._items.length; i++) {
            if (!this._items[i]) {
                return true;
            }
        }
        return false;
    },
    pickupItems: function(indices) {
        // Allows the user to pick up items from the map, where indices is
        // the indices for the array returned by map.getItemsAt
        var mapItems = this._map.getItemsAt(this.getX(), this.getY(), this.getZ());
        var added = 0;
        // Iterate through all indices.
        for (var i = 0; i < indices.length; i++) {
            // Try to add the item. If our inventory is not full, then splice the 
            // item out of the list of items. In order to fetch the right item, we
            // have to offset the number of items already added.
            if (this.addItem(mapItems[indices[i] - added])) {
                mapItems.splice(indices[i] - added, 1);
                added++;
            } else {
                // Inventory is full
                break;
            }
        }
        // Update the map items
        this._map.setItemsAt(this.getX(), this.getY(), this.getZ(), mapItems);
        // Return true only if we added all items
        return added === indices.length;
    },
    dropItem: function(i) {
        // Drops an item to the current map tile
        if (this._items[i]) {
            var amount = 0;
            if(this._items[i].hasMixin('Stackable')) {
                amount = this._item[i].amount();
            }
            if (this._map) {
                this._map.addItem(this.getX(), this.getY(), this.getZ(), this._items[i]);
            }
            this.removeItem(i, amount);      
        }
    }
};
Game.EntityMixins.MeleeAttacker = {
    name: 'MeleeAttacker',
    groupName: 'Attacker',
    init: function(template) {
        this._meleeAttackValue = template['meleeAttackValue'] || 1;
    },
    getMeleeAttackValue: function(slot) {
        var modifier = 0;
        // If we can equip items, then have to take into 
        // consideration weapon and armor
        if(this.hasMixin(Game.EntityMixins.Equipper)) {
            if(slot) {
                var item = this.getSlot(slot),
                    stat = item.getAttackStatModifier(),
                    statMod = this.getStat(stat) || 0;

                return Math.round((item.getAttackValue() + (statMod / 2)) * Math.max(1, this.getLevel() / 2));
            } else {
                var equipment = this.getEquipment();

                // damage = weapon attack value + stat mod
                for(var i = 0; i < equipment.length; i++) {
                    var item = equipment[i];
                    if(equipment[i].getType() === 'melee') {
                        var stat = item.getAttackStatModifier();

                        modifier += item.getAttackValue();

                        if(stat)
                            modifier *= Math.max(1, this.getStat(stat) / 2);
                    }
                }
            }
        }
        // TODO: Add critical mod
        return this._meleeAttackValue + modifier;
    },
    melee: function(target) {
        // Only remove the entity if they were attackable
        if (target.hasMixin('Destructible')) {
            var hit = this.attemptHit(target);
            if(hit) {
                var attack = this.getMeleeAttackValue();
                var defense = target.getDefenseValue();
                var total = Math.max(0, attack - defense);
                Game.sendMessage(this, 'You strike the %s for %s damage!', [target.getName(), total]);
                Game.sendMessage(target, 'The %s strikes you for %s damage!', [this.getName(), total]);
                target.takeDamage(this, total);
            } else {
                Game.sendMessage(this, 'You miss %s!', [target.describeThe()]);
                Game.sendMessage(target, '%s misses you!', [this.describeThe()]);
            }
        }
    },
    attemptHit: function(target) {
        // TODO: Add accuracy modifier
        // If the attacker and the target have the same DEX, the attacker
        // should have a 50% chance of hitting the target
        var chance = (this.getDex() - target.getDex() + 5) * 10;
        if(chance > 0 && chance < 100)
            return Math.round(Math.random() * 100) < chance;
        else if(chance >= 100)
            return true;
        else
            return false;
    },
    listeners: {
        details: function() {
            return [{key: 'melee attack', value: this.getMeleeAttackValue()}];
        }
    }
};
Game.EntityMixins.MessageRecipient = {
    name: 'MessageRecipient',
    init: function(template) {
        this._messages = [];
    },
    receiveMessage: function(message) {
        this._messages.push(message);
    },
    getMessages: function() {
        return this._messages;
    },
    clearMessage: function(i) {
        this._messages.splice(i, 1);
    },
    clearMessages: function() {
        this._messages = [];
    }
};
Game.EntityMixins.PlayerActor = {
    name: 'PlayerActor',
    groupName: 'Actor',
    act: function() {
        if (this._acting) {
            return;
        }
        this._acting = true;

        this.addTurnHunger();

        // Detect if the game is over
        if(!this.isAlive()) {
            Game.Screen.playScreen.setGameEnded(true);
            // Send a last message to the player
            Game.sendMessage(this, 'Press [Enter] to continue!');
        }

        // Re-render the screen
        Game.refresh();

        // Lock the engine and wait asynchronously for the player to press a key.
        this.getMap().getEngine().lock();
        this.clearMessages();
        this._acting = false;
    }
};
Game.EntityMixins.PlayerStatGainer = {
    name: 'PlayerStatGainer',
    groupName: 'StatGainer',
    listeners: {
        onGainLevel: function() {
            // Setup the gain stat screen and show it.
            Game.Screen.gainStatScreen.enter(this);
            Game.Screen.playScreen.setSubScreen(Game.Screen.gainStatScreen);
        }
    }
};
Game.EntityMixins.RandomStatGainer = {
    name: 'RandomStatGainer',
    groupName: 'StatGainer',
    listeners: {
        onGainLevel: function() {
            var statOptions = this.getStatOptions();
            // Randomly select a stat option and execute the callback for each stat point.
            while (this.getStatPoints() > 0) {
                // Call the stat increasing function with this as the context.
                statOptions.random()[1].call(this);
                this.setStatPoints(this.getStatPoints() - 1);
            }
        }
    }
};
Game.EntityMixins.RangedAttacker = {
    name: 'RangedAttacker',
    groupName: 'Attacker',
    init: function(template) {
        this._rangedAttackValue = template['rangedAttackValue'] || 1;
    },
    getRangedAttackValue: function(slot) {
        // TODO: Add critical mod
        // If we can equip items, then have to take into 
        // consideration weapon and armor
        if(this.hasMixin(Game.EntityMixins.Equipper)) {
            // If a slot is specified, only use that slot's stats + ammo
            if(slot) {
                var item = this.getSlot(slot),
                    ammoAttackValue = item.hasMixin('UsesAmmo') ? item.getAmmo().getAttackValue() : 0,
                    stat = item.getAttackStatModifier(),
                    statMod = this.getStat(stat) || 0;
                return Math.round((item.getAttackValue() + ammoAttackValue + (statMod / 2)) * Math.max(1, this.getLevel() / 2));
            } else {
                var modifier = 0,
                    equipment = this.getEquipment();

                for(var i = 0; i < equipment.length; i++) {
                    var item = equipment[i],
                        type = item.getType();
                    if(type === 'ranged') {
                        var stat = item.getAttackStatModifier();

                        modifier += item.getAttackValue();

                        if(stat)
                            modifier += this.getStat(stat);
                    }
                }
                return this._rangedAttackValue + modifier;
            }
        }        
    },
    shoot: function(target, slot) {
        if(this.getSlot(slot).hasMixin('UsesAmmo') && this.getSlot(slot).getAmmo().amount() <= 0) {
            Game.sendMessage(this, "You don't have any ammunition");
            return false;
        }

        // Remove 1 ammo...
        this.unload(slot, 1);

        // Only remove the entity if they were attackable
        if(target.hasMixin('Destructible')) {
            var hit = this.attemptShot(target);
            if(hit) {
                var attack = this.getRangedAttackValue(slot);
                var defense = target.getDefenseValue();
                var total = Math.max(0, attack - defense);
                Game.sendMessage(this, 'You shoot the %s for %s damage!', [target.getName(), total]);
                Game.sendMessage(target, 'The %s shoots you for %s damage!', [this.getName(), total]);
                target.takeDamage(this, total);
            } else {
                Game.sendMessage(this, 'You miss %s!', [target.describeThe()]);
                Game.sendMessage(target, '%s misses you!', [this.describeThe()]);
            }
        } else {
            Game.sendMessage(this, 'You shoot the %s but they seem impervious to damage...', [target.getName()]);
            Game.sendMessage(target, 'The %s shoots but you are impervious to damage!', [this.getName()]);
        }
    },
    attemptShot: function(target) {
        // TODO: Add accuracy modifier
        // If the attacker and the target have the same DEX, the attacker
        // should have a 50% chance of hitting the target
        var chance = (this.getDex() - target.getDex() + 5) * 10;
        if(chance > 0 && chance < 100)
            return Math.round(Math.random() * 100) < chance;
        else if(chance >= 100)
            return true;
        else
            return false;
    },
    listeners: {
        details: function() {
            return [{key: 'ranged attack', value: this.getRangedAttackValue()}];
        }
    }
};
Game.EntityMixins.Sight = {
	name: 'Sight',
	groupName: 'Sight',
	init: function(template) {
		this._sightRadius = 5 + Math.round(this.getPer() / 2);
	},
	getSightRadius: function() {
		return this._sightRadius;
	},
    updateSightRadius: function() {
        this._sightRadius = 5 + Math.round(this.getPer() / 2);
    },
    canSee: function(entity) {
        // If not on the same map or on different floors, then exit early
        if (!entity || this._map !== entity.getMap() || this._z !== entity.getZ()) {
            return false;
        }

        var otherX = entity.getX();
        var otherY = entity.getY();

        // If we're not in a square field of view, then we won't be in a real
        // field of view either.
        if ((otherX - this._x) * (otherX - this._x) +
            (otherY - this._y) * (otherY - this._y) >
            this._sightRadius * this._sightRadius) {
            return false;
        }

        // Compute the FOV and check if the coordinates are in there.
        // TODO: This should use the existing FOV isntead of re-computing
        var found = false;
        this.getMap().getFov(this.getZ()).compute(
            this.getX(), this.getY(), 
            this.getSightRadius(), 
            function(x, y, radius, visibility) {
                if (x === otherX && y === otherY) {
                    found = true;
                }
            });
        return found;
    }
};
Game.EntityMixins.TaskActor = {
    name: 'TaskActor',
    groupName: 'Actor',
    init: function(template) {
        // Load tasks
        this._tasks = template['tasks'] || ['wander']; 
    },
    act: function() {
        // Iterate through all our tasks
        for (var i = 0; i < this._tasks.length; i++) {
            if (this.canDoTask(this._tasks[i])) {
                // If we can perform the task, execute the function for it.
                this[this._tasks[i]]();
                return;
            }
        }
    },
    // TODO: Tasks should have their own 'canDo' function and this should just do that
    canDoTask: function(task) {
        if (task === 'hunt') {
            return this.hasMixin('Sight') && this.canSee(this.getMap().getPlayer());
        } else if (task === 'wander') {
            return true;
        } else {
            throw new Error('Tried to perform undefined task ' + task);
        }
    },
    hunt: function() {
        var player = this.getMap().getPlayer();

        // If we are adjacent to the player, then attack instead of hunting.
        // TODO: if I'm not mistaken, this enforces a topology 4 and doesn't account for diagnally adjacent
        var offsets = Math.abs(player.getX() - this.getX()) + Math.abs(player.getY() - this.getY());
        if(offsets === 1) {
            if (this.hasMixin('MeleeAttacker')) {
                this.melee(player);
                return;
            }
        }

        // Generate the path and move to the first tile.
        var source = this;
        var z = source.getZ();
        var path = new ROT.Path.AStar(player.getX(), player.getY(), function(x, y) {
            // If an entity is present at the tile, can't move there.
            var entity = source.getMap().getEntityAt(x, y, z);
            if (entity && entity !== player && entity !== source) {
                return false;
            }
            return source.getMap().getTile(x, y, z).isWalkable();
        }, {topology: 4});
        // Once we've gotten the path, we want to move to the second cell that is
        // passed in the callback (the first is the entity's strting point)
        var count = 0;
        path.compute(source.getX(), source.getY(), function(x, y) {
            if (count == 1) {
                source.tryMove(x, y, z);
            }
            count++;
        });
    },
    wander: function() {
        // Flip coin to determine if moving by 1 in the positive or negative direction
        var moveOffset = (Math.round(Math.random()) === 1) ? 1 : -1;
        // Flip coin to determine if moving in x direction or y direction
        if (Math.round(Math.random()) === 1) {
            this.tryMove(this.getX() + moveOffset, this.getY(), this.getZ());
        } else {
            this.tryMove(this.getX(), this.getY() + moveOffset, this.getZ());
        }
    }
};
Game.EntityMixins.Thrower = {
    name: 'Thrower',
    init: function(template) {
        this._throwing = template['throwing'] || null;
    },
    getThrowing: function() {
        return this._throwing;
    },
    setThrowing: function(i) {
        this._throwing = i;
    },
    attemptThrow: function(target) {
        // TODO: Add accuracy modifier
        // If the attacker and the target have the same DEX, the attacker
        // should have a 50% chance of hitting the target
        var chance = (this.getDex() - target.getDex() + 5) * 10;
        if(chance > 0 && chance < 100)
            return Math.round(Math.random() * 100) < chance;
        else if(chance >= 100)
            return true;
        else
            return false;
    },
    _getTarget: function(targetX, targetY) {
        var linePoints = Game.Geometry.getLine(this.getX(), this.getY(), targetX, targetY);
        var z = this.getZ();
        // Check to see if any walls or other creatures other than the thrower in the path
        var end;
        var lastPoint;
        for (var i = 1; i < linePoints.length; i++) {
            if(!this.getMap().getTile(linePoints[i].x, linePoints[i].y, z).isWalkable()) {
                end = lastPoint;
                break;
            } else if(this.getMap().getEntityAt(linePoints[i].x, linePoints[i].y, z)) {
                end = linePoints[i];
                break;
            } else {
                lastPoint = linePoints[i];
            }   
        }

        // If nothing is in the way, the end point is targetX and targetY
        if(!end)
            end = {x: targetX, y: targetY};

        return {x: end.x, y: end.y, distance: linePoints.length};
    },
    throwItem: function(i, targetX, targetY) {
        // Select the item to be thrown by its index
        var item = this._items[i];
        if(item.isThrowable()) {
            // Check to see if there is a destructible entity at targetX and targetY
            var target = this._getTarget(targetX, targetY);
            var entity = this.getMap().getEntityAt(target.x, target.y, this.getZ());
            var hit = this.attemptThrow(target);
            if(entity && entity.hasMixin('Destructible') && hit) {
                // Entity has been found, calculate damage!
                var attack = (this.getStr() * 2) + item.getAttackValue();
                var defense = entity.getDefenseValue();
                // The distance penalty will decrease as the skill increases
                var distancePenalty = Math.floor(target.distance / this.getThrowingSkill());
                var max = Math.max(0, attack - defense - distancePenalty);
                var damage = 1 + Math.floor(Math.random() * max);
                Game.sendMessage(this, "You throw %s at %s for %s damage!", [item.describeA(), entity.describeThe(), damage]);
                Game.sendMessage(entity, "%s throws %s at you!", [this.describeThe(), item.describeA()]);
                entity.takeDamage(this, damage);
            } else {
                Game.sendMessage(this, "You throw %s!", [item.describeA()]);
            }
            
            if(item.hasMixin('Stackable')) {
                // It's actually easer to just create a new object at the location because of weird pass-by-reference stuff that javascript does.
                var newItem = Game.ItemRepository.create(item.describe());
                this.getMap().addItem(target.x, target.y, this.getZ(), newItem);
            } else {
                this.getMap().addItem(target.x, target.y, this.getZ(), item);
            }

            this.removeItem(i);
        }
    }
};

// For some reason, Game.extend has to be called after Game.EntityMixins.TaskActor is defined, since that's the thing it's trying to extend.
Game.EntityMixins.GiantZombieActor = Game.extend(Game.EntityMixins.TaskActor, {
    init: function(template) {
        // Call the task actor init with the right tasks.
        Game.EntityMixins.TaskActor.init.call(this, Game.extend(template, {
            'tasks' : ['growArm', 'spawnSlime', 'hunt', 'wander']
        }));
        // We only want to grow the arm once.
        this._hasGrownArm = false;
    },
    canDoTask: function(task) {
        // If we haven't already grown arm and HP <= 20, then we can grow.
        if (task === 'growArm') {
            return this.getHp() <= 20 && !this._hasGrownArm;
        // Spawn a slime only a 10% of turns.
        } else if (task === 'spawnSlime') {
            return Math.round(Math.random() * 100) <= 10;
        // Call parent canDoTask
        } else {
            return Game.EntityMixins.TaskActor.canDoTask.call(this, task);
        }
    },
    growArm: function() {
        this._hasGrownArm = true;
        this.increaseAttackValue(5);
        // Send a message saying the zombie grew an arm.
        Game.sendMessageNearby(this.getMap(),
            this.getX(), this.getY(), this.getZ(),
            'An extra arm appears on the giant zombie!');
    },
    spawnSlime: function() {
        // Generate a random position nearby.
        var xOffset = Math.floor(Math.random() * 3) - 1;
        var yOffset = Math.floor(Math.random() * 3) - 1;

        // Check if we can spawn an entity at that position.
        if (!this.getMap().isEmptyFloor(this.getX() + xOffset, this.getY() + yOffset, this.getZ())) {
            // If we cant, do nothing
            return;
        }
        // Create the entity
        var slime = Game.EntityRepository.create('slime');
        slime.setX(this.getX() + xOffset);
        slime.setY(this.getY() + yOffset)
        slime.setZ(this.getZ());
        this.getMap().addEntity(slime);
    },
    listeners: {
        onDeath: function(attacker) {
            // Switch to win screen when killed!
            Game.switchScreen(Game.Screen.winScreen);
        }
    }
});