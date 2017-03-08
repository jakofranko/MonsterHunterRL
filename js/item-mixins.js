Game.ItemMixins = {};

Game.ItemMixins.Ammo = {
    name: 'Ammo',
    init: function(template) {
        this._ammoType = template['ammoType'] || false;
        this._ammoAOE = template['ammoAOE'] || 'line';
    },
    getAmmoType: function() {
        return this._ammoType;
    },
    getAmmoAOE: function() {
        return this._ammoAOE;
    },
};
Game.ItemMixins.Edible = {
    name: 'Edible',
    init: function(template) {
        // Number of points to add to hunger
        this._foodValue = template['foodValue'] || 5;
        // Number of times the item can be consumed
        this._maxConsumptions = template['consumptions'] || 1;
        this._remainingConsumptions = this._maxConsumptions;
    },
    eat: function(entity) {
        if (entity.hasMixin('FoodConsumer')) {
            if (this.hasRemainingConsumptions()) {
                entity.modifyFullnessBy(this._foodValue);
                this._remainingConsumptions--;
            }
        }
    },
    hasRemainingConsumptions: function() {
        return this._remainingConsumptions > 0;
    },
    describe: function() {
        if (this._maxConsumptions != this._remainingConsumptions) {
            return 'partly eaten ' + Game.Item.prototype.describe.call(this);
        } else {
            return this._name;
        }
    },
    listeners: {
        'details': function() {
            return [{key: 'food', value: this._foodValue}];
        }
    }
};
Game.ItemMixins.Equippable = {
    name: 'Equippable',
    init: function(template) {
        this._dice = template['dice'] || '0d0';
        this._attackValue = template['attackValue'] || 0;
        this._accuracyValue = template['accuracyValue'] || 0;
        this._attackStatModifier = template['statModifier'] || null,
        this._defenseValue = template['defenseValue'] || 0;
        this._defenseStatModifier = template['statModifier'] || null,
        this._slotLocations = template['slotLocations'] || ['rightHand', 'leftHand'];
        this._type = template['type'] || 'melee';
        this._hands = template['hands'] || null; // or 1 or 2
        this._equipped = template['equipped'] || false;
    },
    getAttackValue: function(max) {
        return this.rollDice(max) + this._attackValue;
    },
    getDefenseValue: function() {
        return this._defenseValue;
    },
    getSlotLocations: function() {
        return this._slotLocations;
    },
    getType: function() {
        return this._type;
    },
    getHands: function() {
        return this._hands;
    },
    getAttackStatModifier: function() {
        return this._attackStatModifier;
    },
    getDefenseStatModifier: function() {
        return this._defenseStatModifier;
    },
    equipped: function() {
        this._equipped = true;
    },
    unequipped: function() {
        this._equipped = false;
    },
    rollDice: function(max) {
        var dice = this._dice.split("d"),
            num = dice[0],
            sides = dice[1],
            total = 0;

        if(max)
            total = num * sides;
        else
            for (var i = 0; i < num; i++)
                total += Math.floor(Math.random() * sides) + 1;

        return total;
    },
    listeners: {
        'details': function() {
            var results = [{'test': "I need to come up with a real description for this"}];
            return results;
        }
    }
};
Game.ItemMixins.Stackable = {
    name: 'Stackable',
    init: function(template) {
        this._stackable = template['stackable'] || false;
        this._count = template['count'] === undefined ? 1 : template['count'];
    },
    amount: function() {
        return this._count;
    },
    addToStack: function(amount) {
        if(typeof amount === "number") {
            this._count += amount;
        } else {
            this._count++;    
        }
    },
    isStackable: function() {
        return this._stackable;
    },
    removeFromStack: function(amount) {
        if(amount) {
            this._count -= amount;
        } else {
            this._count--;
        }
        if(this._count < 0)
            this._count = 0;
    }
};
Game.ItemMixins.UsesAmmo = {
    name: 'UsesAmmo',
    init: function(template) {
        this._clipSize = template['clipSize'] || 10;
        this._usesAmmoType = template['usesAmmoType'] || 'bullet';
        this._defaultAmmo = template['defaultAmmo'] || 'lead bullet';
        this._ammo = template['ammo'] || Game.ItemRepository.create(this._defaultAmmo, { count: this._clipSize });
    },
    getClipSize: function() {
        return this._clipSize;
    },
    getAmmo: function() {
        return this._ammo;
    },
    getUsesAmmoType: function() {
        return this._usesAmmoType;
    },
    getDefaultAmmo: function() {
        return this._defaultAmmo;
    },
    setAmmo: function(ammo) {
        var ammoObject;
        if(typeof ammo === 'string')
            ammoObject = Game.ItemRepository.create(ammo, { count: 0 });
        else
            ammoObject = ammo;

        if(ammoObject.getAmmoType() !== this._usesAmmoType)
            return false;

        this._ammo = ammoObject;
        return true;
    },
    addAmmo: function(amount) {
        this._ammo.addToStack(amount);
    },
    removeAmmo: function(amount) {
        this._ammo.removeFromStack(amount);
    }
};
Game.ItemMixins.Throwable = {
    name: 'Throwable',
    init: function(template) {
        this._throwable = template['throwable'] || false;
        this._attackValue = template['attackValue'] || 1;
    },
    getAttackValue: function() {
        return this._attackValue;
    },
    isThrowable: function() {
        return this._throwable;
    },
    listeners: {
        'details': function() {
            var results = [];
            if (this._throwable) {
                results.push({key: 'attack', value: this.getAttackValue()});
            }
            return results;
        }
    }
};

// Adding an item to a container removes it from the entity.
// Removing an item from a container adds it to the entity.
Game.ItemMixins.Container = {
    name: 'Container',
    init: function(template) {
        this._items = [];
    },
    getItems: function() {
        return this._items;
    },
    getItem: function(i) {
        return this._items[i];
    },
    addItem: function(entity, index, amount) {
        if(!entity.hasMixin('InventoryHolder') && !entity.hasMixin('Container')) {
            return false;
        }
        var item = entity.getItem(index);
        this._items.push(item);
        entity.removeItem(index, amount);

        if(entity.hasMixin('MessageRecipient'))
            Game.sendMessage(entity, "You place %s into %s", [item.describeThe(), this.describeThe()]);

    },
    removeItem: function(entity, index, amount) {
        if(!entity.hasMixin('InventoryHolder') && !entity.hasMixin('Container')) {
            return false;
        }
        var item = this.getItem(index);
        entity.addItem(item);
        this._items.splice(index, 1);

        if(entity.hasMixin('MessageRecipient'))
            Game.sendMessage(entity, "You remove %s from %s", [item.describeThe(), this.describeThe()]);
    },
    listeners: {
        'action': function(actionTaker) {
            var actions = {};
            var actionName = "Open %s".format(this.describeThe());

            // array of functions to execute. For each sub-array,
            // first value is the action function,
            // second value are the args,
            // third (optional) value is the 'this' context to use
            actions[actionName] = [
                [Game.Screen.containerScreen.setup, [actionTaker, actionTaker.getItems(), this, this.getItems()], Game.Screen.containerScreen],
                [Game.Screen.playScreen.setSubScreen, [Game.Screen.containerScreen], Game.Screen.playScreen]
            ];
            return actions;
        }
    }
};