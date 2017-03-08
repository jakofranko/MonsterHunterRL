// Define start screen
Game.Screen.startScreen = new Game.Screen.basicScreen({
    enter: function() {},
    exit: function() {},
    render: function(display) {
        var w = Game.getScreenWidth();
        var h = Game.getScreenHeight();
        // Render prompt to the screen
        display.drawText((w/2) - 8, 5, "%c{yellow}Monster Hunter RL");
        display.drawText((w/2) - 15, 7, "Press [?] at any time for help");
        display.drawText((w/2) - 12, 8, "Press [Enter] to start!");
        display.drawText((w/2) - 3, h - 1, "v0.0.5");
    },
    handleInput: function(inputType, inputData) {
        // When [Enter] is pressed, go to the play screen
        if(inputType === 'keydown' && inputData.keyCode === ROT.VK_RETURN) {
            Game.switchScreen(Game.Screen.characterSelectScreen);
        }
    },
    updateDescription: function() {
        this._description = this._playerCharacters[this._currentIndex].describe();
        this._stats1 = this.renderStats1(this._playerCharacters[this._currentIndex]);
        this._stats2 = this.renderStats2(this._playerCharacters[this._currentIndex]);
    },
    renderStats1: function(entity) {
        var str = entity.getStr(),
            dex = entity.getDex(),
            int = entity.getInt();

        return "Strength: " + str + " Dexterity: " + dex + " Intelligence: " + int;
    },
    renderStats2: function(entity) {
        var will = entity.getWill(),
            per = entity.getPer(),
            tough = entity.getTough(),
            odd = entity.getOdd();
        return "Willpower: " + will + " Perception: " + per + " Toughness: " + tough + " Odd: " + odd;
    }
});

Game.Screen.characterSelectScreen = new Game.Screen.basicScreen({
    enter: function() {
        this._playerCharacterNames = [
            'Owen',
            'Julie',
            'Franks',
            'Chastity',
            'Mitchell'
        ];
        this._playerCharacters = [];
        for (var i = 0; i < this._playerCharacterNames.length; i++) {
            this._playerCharacters.push(Game.EntityRepository.create(this._playerCharacterNames[i]));
        }
        this._description = null;
        this._stats1 = null;
        this._stats2 = null;
        this._currentIndex = 0;
        this.updateDescription();
    },
    exit: function() {},
    render: function(display) {
        var w = Game.getScreenWidth(),
            h = Game.getScreenHeight(),
            centerX = Math.round(w / 2),
            centerY = Math.round(h / 2),
            caption = "Character Select",
            descriptionWidth = 30,
            nameSpacing = 5,
            namesLength = 0;

        // Caption
        display.drawText(centerX - Math.round(caption.length / 2), 3, caption);

        // Display Description
        if(this._description) {
            display.drawText(centerX - Math.round(descriptionWidth / 2), centerY - 5, this._description, descriptionWidth);
        }

        // Display Stats
        if(this._stats1 && this._stats2) {
            display.drawText(centerX - Math.round(this._stats1.length / 2), centerY, this._stats1);
            display.drawText(centerX - Math.round(this._stats2.length / 2), centerY + 1, this._stats2);
        }

        // Get total name width
        for (var i = 0; i < this._playerCharacterNames.length; i++) {
            namesLength += this._playerCharacterNames[i].length + nameSpacing;
        }

        // Display PC Names
        var startX = centerX - Math.round(namesLength / 2);
        // var startX = 0;
        for (var j = 0; j < this._playerCharacters.length; j++) {
            var color = (j === this._currentIndex) ? Game.Palette.white : Game.Palette.grey;
            var name = this._playerCharacters[j].getName();
            var renderedName = '%c{' + color + '}' + this._playerCharacters[j].getName() + '%c{}';
            display.drawText(startX, centerY + 5, renderedName);
            startX += name.length + nameSpacing;
        }
    },
    handleInput: function(inputType, inputData) {
        // When [Enter] is pressed, go to the play screen
        if(inputType === 'keydown') {
            if(inputData.keyCode === ROT.VK_RETURN) {
                var selectedCharacter = this._playerCharacters[this._currentIndex].getName();
                Game.setPlayerCharacter(selectedCharacter);
                Game.switchScreen(Game.Screen.playScreen);
            } else if(inputData.keyCode === ROT.VK_LEFT && this._currentIndex > 0) {
                this._currentIndex--;
                this.updateDescription();
            } else if(inputData.keyCode === ROT.VK_RIGHT && this._currentIndex < this._playerCharacterNames.length - 1) {
                this._currentIndex++;
                this.updateDescription();
            }
            Game.refresh();
        }
    },
    updateDescription: function() {
        this._description = this._playerCharacters[this._currentIndex].describe();
        this._stats1 = this.renderStats1(this._playerCharacters[this._currentIndex]);
        this._stats2 = this.renderStats2(this._playerCharacters[this._currentIndex]);
    },
    renderStats1: function(entity) {
        var str = entity.getStr(),
            dex = entity.getDex(),
            int = entity.getInt();

        return "Strength: " + str + " Dexterity: " + dex + " Intelligence: " + int;
    },
    renderStats2: function(entity) {
        var will = entity.getWill(),
            per = entity.getPer(),
            tough = entity.getTough(),
            odd = entity.getOdd();
        return "Willpower: " + will + " Perception: " + per + " Toughness: " + tough + " Odd: " + odd;
    }
});

// Define our playing screen
Game.Screen.playScreen = new Game.Screen.basicScreen({
    _player: null,
    _gameEnded: false,
    _subScreen: null,
    enter: function() {
        var width = 100;
        var height = 48;
        var depth = 6;

        // Create our map from the tiles and player
        // TODO: Have this be based off the selection of a character select screen
        this._player = Game.EntityRepository.create(Game.getPlayerCharacter());
        var map = new Game.Map(width, height, depth, this._player);
        // Start the map's engine
        map.getEngine().start();
    },
    exit: function() { console.log("Exited play screen."); },
    render: function(display) {
        // Render subscreen if there is one
        if (this._subScreen) {
            this._subScreen.render(display);
            return;
        }

        // Otherwise, procede as usual...
        var screenWidth = Game.getScreenWidth();
        var screenHeight = Game.getScreenHeight();

        // Render the tiles
        this.renderTiles(display);

        // Get the messages in the player's queue and render them
        var messages = this._player.getMessages();
        var messageY = 0;
        for (var i = 0; i < messages.length; i++) {
            // Draw each message, adding the number of lines
            messageY += display.drawText(
                0, 
                messageY,
                '%c{white}%b{black}' + messages[i]
            );
        }

        // Render player HP 
        var stats = '%c{white}%b{black}';
        stats += String.format(
            'HP: %s/%s Level: %s XP: %s', 
            this._player.getHp(), 
            this._player.getMaxHp(), 
            this._player.getLevel(), 
            this._player.getExperience()
        );
        display.drawText(0, screenHeight, stats);

        // Render hunger state
        var hungerState = this._player.getHungerState();
        display.drawText(screenWidth - hungerState.length, screenHeight, hungerState);
    },
    move: function(dX, dY, dZ) {
        var newX = this._player.getX() + dX;
        var newY = this._player.getY() + dY;
        var newZ = this._player.getZ() + dZ;
        this._player.tryMove(newX, newY, newZ, this._player.getMap());
    },
    handleInput: function(inputType, inputData) {
        // If the game is over, enter will bring the user to the losing screen.
        if(this._gameEnded) {
            if (inputType === 'keydown' && inputData.keyCode === ROT.VK_RETURN) {
                Game.switchScreen(Game.Screen.loseScreen);
            }
            // Return to make sure the user can't still play
            return;
        }
        // Handle subscreen input if there is one
        if (this._subScreen) {
            this._subScreen.handleInput(inputType, inputData);
            return;
        }

        // Otherwise, handle input normally for this screen
        // NOTE: If you do not 'return' when handling the input, pressing the key will count as your turn
        if (inputType === 'keydown') {
            if (inputData.keyCode === ROT.VK_LEFT) {
                this.move(-1, 0, 0);
            } else if (inputData.keyCode === ROT.VK_RIGHT) {
                this.move(1, 0, 0);
            } else if (inputData.keyCode === ROT.VK_UP) {
                this.move(0, -1, 0);
            } else if (inputData.keyCode === ROT.VK_DOWN) {
                this.move(0, 1, 0);
            } else if (inputData.keyCode === ROT.VK_I) {
                // Show the inventory screen
                this.showItemsSubScreen(Game.Screen.inventoryScreen, this._player.getItems(), 'You are not carrying anything.');
                return;
            } else if (inputData.keyCode === ROT.VK_D) {
                // Show the drop screen
                this.showItemsSubScreen(Game.Screen.dropScreen, this._player.getItems(), 'You have nothing to drop.');
                return;
            } else if (inputData.keyCode === ROT.VK_E) {
                if(inputData.shiftKey) {
                    this.showItemsSubScreen(Game.Screen.eatScreen, this._player.getItems(), 'You have nothing to eat.');
                } else {
                    Game.Screen.equipmentScreen.setup(this._player);
                    this.setSubScreen(Game.Screen.equipmentScreen);
                }
                return;
            } else if(inputData.keyCode === ROT.VK_F && this._player.hasMixin('RangedAttacker')) {
                if(this._player.hasRangedEquipped()) {
                    var offsets = this.getScreenOffsets();
                    Game.Screen.shootScreen.setup(this._player, this._player.getX(), this._player.getY(), offsets.x, offsets.y);
                    this.setSubScreen(Game.Screen.shootScreen);
                    return;
                } else {
                    Game.sendMessage(this._player, 'You do not have any ranged weapons equipped');
                    Game.refresh();
                    return;
                }
            } else if(inputData.keyCode === ROT.VK_R) {
                if(this._player.hasMixin('Equipper')) {
                    if(inputData.shiftKey) {
                        // TODO: Ammo picker screen
                        // Show the reload picker screen
                        this.showItemsSubScreen(Game.Screen.ammoSelectionScreen, this._player.getItems(), 'You have no ammo for your weapons.');
                        return;
                    } else { // Quick Reload
                        var rangedSlots = this._player.getRangedSlots();
                        var success = false;
                        for (var i = 0; i < rangedSlots.length; i++) {
                            var slot = this._player.getSlot(rangedSlots[i]);
                            if(slot && slot.hasMixin('UsesAmmo')) {
                                success = this._player.reload(rangedSlots[i]);
                                if(success)
                                    break;
                            }
                        }

                        // If reloading was unsuccessful, don't penalize the player
                        if(!success) {
                            Game.refresh(); // Display messages
                            this._player.clearMessages();
                            return;
                        }
                    }
                } else {
                    return;
                }
            } else if (inputData.keyCode === ROT.VK_W) {
                if (inputData.shiftKey) {
                    // Show the wear screen
                    this.showItemsSubScreen(Game.Screen.wearScreen, this._player.getItems(), 'You have nothing to wear.');
                } else {
                    // Show the wield screen
                    this.showItemsSubScreen(Game.Screen.wieldScreen, this._player.getItems(), 'You have nothing to wield.');
                }
            } else if (inputData.keyCode === ROT.VK_X) {
                // Show the drop screen
                this.showItemsSubScreen(Game.Screen.examineScreen, this._player.getItems(),
                   'You have nothing to examine.');
                return;
            } else if(inputData.keyCode === ROT.VK_T) {
                this.showItemsSubScreen(Game.Screen.throwScreen, this._player.getItems(), 'You have nothing to throw.');
                return;
            } else if (inputData.keyCode === ROT.VK_COMMA) {
                var items = this._player.getMap().getItemsAt(this._player.getX(), this._player.getY(), this._player.getZ());
                // If there is only one item, directly pick it up
                if (items && items.length === 1) {
                    var item = items[0];
                    if (this._player.pickupItems([0])) {
                        Game.sendMessage(this._player, "You pick up %s.", [item.describeA()]);
                    } else {
                        Game.sendMessage(this._player, "Your inventory is full! Nothing was picked up.");
                    }
                } else {
                    this.showItemsSubScreen(Game.Screen.pickupScreen, items, 'There is nothing here to pick up.');
                } 
            } else {
                // Not a valid key
                return;
            }
            // Unlock the engine
            this._player.getMap().getEngine().unlock();
        } else if (inputType === 'keypress') {
            var keyChar = String.fromCharCode(inputData.charCode);
            if(keyChar === '>') {
                this.move(0, 0, 1);
            } else if(keyChar === '<') {
                this.move(0,0, -1);
            } else if (keyChar === ';') {
                // Setup the look screen.
                var offsets = this.getScreenOffsets();
                Game.Screen.lookScreen.setup(this._player,
                    this._player.getX(), this._player.getY(),
                    offsets.x, offsets.y);
                this.setSubScreen(Game.Screen.lookScreen);
                return;
            } else if (keyChar === '?') {
                // Setup the look screen.
                this.setSubScreen(Game.Screen.helpScreen);
                return;
            } else {
                // Not a valid key
                return;
            }
            // Unlock the engine
            this._player.getMap().getEngine().unlock();
        }
    },
    getScreenOffsets: function() {
        // Make sure we still have enough space to fit an entire game screen
        var topLeftX = Math.max(0, this._player.getX() - (Game.getScreenWidth() / 2));
        // Make sure we still have enough space to fit an entire game screen
        topLeftX = Math.min(topLeftX, this._player.getMap().getWidth() - Game.getScreenWidth());
        // Make sure the y-axis doesn't above the top bound
        var topLeftY = Math.max(0, this._player.getY() - (Game.getScreenHeight() / 2));
        // Make sure we still have enough space to fit an entire game screen
        topLeftY = Math.min(topLeftY, this._player.getMap().getHeight() - Game.getScreenHeight());
        return {
            x: topLeftX,
            y: topLeftY
        };
    },
    renderTiles: function(display) {
        var screenWidth = Game.getScreenWidth();
        var screenHeight = Game.getScreenHeight();
        var offsets = this.getScreenOffsets();
        var topLeftX = offsets.x;
        var topLeftY = offsets.y;
        // This object will keep track of all visible map cells
        var visibleCells = {};
        // Store this._player.getMap() and player's z to prevent losing it in callbacks
        var map = this._player.getMap();
        var currentDepth = this._player.getZ();
        // Find all visible cells and update the object
        map.getFov(currentDepth).compute(
            this._player.getX(), this._player.getY(), 
            this._player.getSightRadius(), 
            function(x, y, radius, visibility) {
                visibleCells[x + "," + y] = true;
                // Mark cell as explored
                map.setExplored(x, y, currentDepth, true);
            });
        // Iterate through visible map cells
        for (var x = topLeftX; x < topLeftX + screenWidth; x++) {
            for (var y = topLeftY; y < topLeftY + screenHeight; y++) {
                if (map.isExplored(x, y, currentDepth)) {
                    // Fetch the glyph for the tile and render it to the screen
                    // at the offset position.
                    var glyph = map.getTile(x, y, currentDepth);
                    var foreground = glyph.getForeground();
                    // If we are at a cell that is in the field of vision, we need
                    // to check if there are items or entities.
                    if (visibleCells[x + ',' + y]) {
                        // Check for items first, since we want to draw entities
                        // over items.
                        var items = map.getItemsAt(x, y, currentDepth);
                        // If we have items, we want to render the top most item
                        if (items) {
                            glyph = items[items.length - 1];
                        }
                        // Check if we have an entity at the position
                        if (map.getEntityAt(x, y, currentDepth)) {
                            glyph = map.getEntityAt(x, y, currentDepth);
                        }
                        // Update the foreground color in case our glyph changed
                        foreground = glyph.getForeground();
                    } else {
                        // Since the tile was previously explored but is not 
                        // visible, we want to change the foreground color to
                        // dark gray.
                        foreground = 'darkGray';
                    }
                    
                    display.draw(
                        x - topLeftX,
                        y - topLeftY,
                        glyph.getChar(), 
                        foreground, 
                        glyph.getBackground());
                }
            }
        }

        // Render the entities
        var entities = this._player.getMap().getEntities();
        for (var key in entities) {
            var entity = entities[key];
            if (visibleCells[entity.getX() + ',' + entity.getY()]) {
                // Only render the entity if they would show up on the screen
                if(entity.getX() < topLeftX + screenWidth && 
                    entity.getX() >= topLeftX && 
                    entity.getY() < topLeftY + screenHeight && 
                    entity.getY() >= topLeftY &&
                    entity.getZ() == this._player.getZ()) {
                    display.draw(
                        entity.getX() - topLeftX,
                        entity.getY() - topLeftY,
                        entity.getChar(),
                        entity.getForeground(),
                        entity.getBackground()
                    );
                }
            }
        }
    },
    setGameEnded: function(gameEnded) {
        this._gameEnded = gameEnded;
    },
    setSubScreen: function(subScreen) {
        this._subScreen = subScreen;
        Game.refresh();
    },
    showItemsSubScreen: function(subScreen, items, emptyMessage) {
        if (items && subScreen.setup(this._player, items) > 0) {
            this.setSubScreen(subScreen);
        } else {
            Game.sendMessage(this._player, emptyMessage);
            Game.refresh();
        }
    }
});

// Inventory sub-screens
Game.Screen.inventoryScreen = new Game.Screen.ItemListScreen({
    caption: 'Inventory',
    canSelect: false
});
Game.Screen.pickupScreen = new Game.Screen.ItemListScreen({
    caption: 'Choose the items you wish to pickup',
    canSelect: true,
    canSelectMultipleItems: true,
    ok: function(selectedItems) {
        // Try to pick up all items, messaging the player if they couldn't all be picked up.
        if (!this._player.pickupItems(Object.keys(selectedItems))) {
            Game.sendMessage(this._player, "Your inventory is full! Not all items were picked up.");
        }
        return true;
    }
});
Game.Screen.dropScreen = new Game.Screen.ItemListScreen({
    caption: 'Choose the item you wish to drop',
    canSelect: true,
    canSelectMultipleItems: false,
    ok: function(selectedItems) {
        // Drop the selected item
        this._player.dropItem(Object.keys(selectedItems)[0]);
        return true;
    }
});
Game.Screen.eatScreen = new Game.Screen.ItemListScreen({
    caption: 'Choose the item you wish to eat',
    canSelect: true,
    canSelectMultipleItems: false,
    isAcceptable: function(item) {
        return item && item.hasMixin('Edible') && item !== this._player._armor && item !== this._player._weapon;
    },
    ok: function(selectedItems) {
        // Eat the item, removing it if there are no consumptions remaining.
        var key = Object.keys(selectedItems)[0];
        var item = selectedItems[key];
        Game.sendMessage(this._player, "You eat %s.", [item.describeThe()]);
        item.eat(this._player);
        if (!item.hasRemainingConsumptions()) {
            this._player.removeItem(key);
        }
        return true;
    }
});
Game.Screen.ammoSelectionScreen = new Game.Screen.ItemListScreen({
    caption: 'Select the ammo you wish to use',
    canSelect: true,
    canSelectMultipleItems: false,
    isAcceptable: function(item) {
        if(item && item.hasMixin('Ammo')) {
            var rangedSlots = this._player.getRangedSlots();
            for (var i = 0; i < rangedSlots.length; i++) {
                var rs = rangedSlots[i],
                    rangedSlot = this._player.getSlot(rs);

                // If the current item's ammoType matches one of the rangedSlot items' usable ammo types, include it on the list.
                if(
                    rangedSlot &&
                    rangedSlot.getType() === 'ranged' &&
                    rangedSlot.hasMixin('UsesAmmo') &&
                    rangedSlot.getUsesAmmoType() === item.getAmmoType()
                ) {
                    return true;
                }
            }
        } else {
            return false;
        }
    },
    ok: function(selectedItems) {
        var key = Object.keys(selectedItems)[0];
        var ammo = selectedItems[key];
        Game.Screen.reloadRangedScreen.setup(this._player, ammo);
        Game.Screen.playScreen.setSubScreen(Game.Screen.reloadRangedScreen);
    }
});
Game.Screen.bodyEquipmentScreen = new Game.Screen.ItemListScreen({
    caption: 'Body Equipment',
    canSelect: true,
    canSelectMultipleItems: false,
    hasNoItemOption: true,
    isAcceptable: function(item) {
        if(item && item.hasMixin('Equippable')) {
            var itemSlotLocations = item.getSlotLocations();
            if(itemSlotLocations.indexOf('body') > -1) {
                return true;
            } else {
                return false;
            }
        }
    },
    ok: function(selectedItems) {
        var keys = Object.keys(selectedItems);
        if(keys.length && keys.length > 0) {
            this._player.equipFromInventory(Number(keys[0]), 'body');
            return true;
        } else {
            this._player.unequip('body');
            return true;
        }
    }
});
Game.Screen.rightHandEquipmentScreen = new Game.Screen.ItemListScreen({
    caption: 'Right-Hand Equipment',
    canSelect: true,
    canSelectMultipleItems: false,
    hasNoItemOption: true,
    isAcceptable: function(item) {
        if(item && item.hasMixin('Equippable')) {
            var itemSlotLocations = item.getSlotLocations();
            if(itemSlotLocations.indexOf('rightHand') > -1) {
                return true;
            } else {
                return false;
            }
        }
    },
    ok: function(selectedItems) {
        var keys = Object.keys(selectedItems);
        if(keys.length && keys.length > 0) {
            this._player.equipFromInventory(Number(keys[0]), 'rightHand');
            return true;
        } else {
            this._player.unequip('rightHand');
            return true;
        }
    }
});
Game.Screen.leftHandEquipmentScreen = new Game.Screen.ItemListScreen({
    caption: 'Left-Hand Equipment',
    canSelect: true,
    canSelectMultipleItems: false,
    hasNoItemOption: true,
    isAcceptable: function(item) {
        if(item && item.hasMixin('Equippable')) {
            var itemSlotLocations = item.getSlotLocations();
            if(itemSlotLocations.indexOf('leftHand') > -1) {
                return true;
            } else {
                return false;
            }
        }
    },
    ok: function(selectedItems) {
        var keys = Object.keys(selectedItems);
        if(keys.length && keys.length > 0) {
            this._player.equipFromInventory(Number(keys[0]), 'leftHand');
            return true;
        } else {
            this._player.unequip('leftHand');
            return true;
        }
    }
});
Game.Screen.examineScreen = new Game.Screen.ItemListScreen({
    caption: 'Choose the item you wish to examine',
    canSelect: true,
    canSelectMultipleItems: false,
    isAcceptable: function(item) {
        return true;
    },
    ok: function(selectedItems) {
        var keys = Object.keys(selectedItems);
        if (keys.length > 0) {
            var item = selectedItems[keys[0]];
            var description = "It's %s";
            var details = item.details();
            if(details && details != "") {
                description += " (%s).";
                Game.sendMessage(this._player, description, 
                [
                    item.describeA(false),
                    item.details()
                ]);
            } else {
                Game.sendMessage(this._player, description, [item.describeA(false)]);
            }
            
        }
        return true;
    }
});
Game.Screen.throwScreen = new Game.Screen.ItemListScreen({
    caption: 'Choose the item you wish to throw',
    canSelect: true,
    canSelectMultipleItems: false,
    isAcceptable: function(item) {
        if(!item || !item.hasMixin('Throwable')) {
            return false;
        } else if(item.hasMixin('Equippable') && (item.isWielded() || item.isWorn())) {
            return false
        } else {
            return true;
        }
    },
    ok: function(selectedItems) {
        var offsets = Game.Screen.playScreen.getScreenOffsets();
        // Go to the targetting screen
        Game.Screen.throwTargetScreen.setup(this._player, this._player.getX(), this._player.getY(), offsets.x, offsets.y);
        this._player.setThrowing(Object.keys(selectedItems)[0]);
        Game.Screen.playScreen.setSubScreen(Game.Screen.throwTargetScreen);
        return;
    }
});

// Equipment Screens
Game.Screen.equipmentScreen = new Game.Screen.EquipmentScreen({
    name: 'Equipment Screen',
    ok: function(slotName, slotItem) {
        var itemScreen = slotName + "EquipmentScreen"; // ie, bodyEquipmentScreen

        Game.Screen[itemScreen].setup(this._entity, this._entity.getItems());
        Game.Screen.playScreen.setSubScreen(Game.Screen[itemScreen]);

        // Return false so we don't skip our turn
        return false;
    }
});
Game.Screen.reloadRangedScreen = new Game.Screen.EquipmentScreen({
    name: 'Reload Ranged Equipment Screen',
    caption: 'Reload what?',
    slotsFilter: ['leftHand', 'rightHand'],
    typeFilter: ['ranged'],
    ok: function(slotName, slotItem) {
        if(!slotItem) {
            var downcase = function(firstLetter) { return firstLetter.toLowerCase(); };
            Game.sendMessage(this._entity, "Nothing to reload; Your %s is empty", [slotName.replace(/([A-Z][a-z]+)/g, " $1").replace(/\b\w/g, downcase)]);
            return false;
        } else {
            // The ammo to reload with should be the first of the setupArgs
            var ammo = this._setupArgs[0];
            if(slotItem.getUsesAmmoType() === ammo.getAmmoType())
                return this._entity.reload(slotName, ammo.getName());
        }
    }
});

// Target-based screens
Game.Screen.lookScreen = new Game.Screen.TargetBasedScreen({
    captionFunction: function(x, y) {
        var z = this._player.getZ();
        var map = this._player.getMap();
        // If the tile is explored, we can give a better capton
        if (map.isExplored(x, y, z)) {
            // If the tile isn't explored, we have to check if we can actually 
            // see it before testing if there's an entity or item.
            if (this._visibleCells[x + ',' + y]) {
                var items = map.getItemsAt(x, y, z);
                // If we have items, we want to render the top most item
                if (items) {
                    var item = items[items.length - 1];
                    return String.format('%s - %s (%s)',
                        item.getRepresentation(),
                        item.describeA(true),
                        item.details());
                // Else check if there's an entity
                } else if (map.getEntityAt(x, y, z)) {
                    var entity = map.getEntityAt(x, y, z);
                    return String.format('%s - %s (%s)',
                        entity.getRepresentation(),
                        entity.describeA(true),
                        entity.details());
                }
            }
            // If there was no entity/item or the tile wasn't visible, then use
            // the tile information.
            return String.format('%s - %s',
                map.getTile(x, y, z).getRepresentation(),
                map.getTile(x, y, z).getDescription());

        } else {
            // If the tile is not explored, show the null tile description.
            return String.format('%s - %s',
                Game.Tile.nullTile.getRepresentation(),
                Game.Tile.nullTile.getDescription());
        }
    }
});
Game.Screen.shootScreen = new Game.Screen.TargetBasedScreen({
    okFunction: function(x, y) {
        if(!this._player.hasAmmo()) {
            Game.sendMessage(this._player, "You have no ammo!");
            return false;
        }

        var equipment = this._player.getEquipmentSlots(),
            entity = false,
            wall = false,
            z = this._player.getZ();
        for (var i = 0; i < this._realPath.length; i++) {
            entity = this._player.getMap().getEntityAt(this._realPath[i].x, this._realPath[i].y, z);
            wall = this._player.getMap().getTile(this._realPath[i].x, this._realPath[i].y, z).describe() === 'wall';

            if(wall)
                break;
            else if(entity && (this._realPath[i].x !== this._startX + this._offsetX || this._realPath[i].y !== this._startY + this._offsetY))
                break;
        }

        if(entity)
            this._player.shoot(entity);
        else if(wall)
            Game.sendMessage(this._player, "You shoot the wall!");
        else
            Game.sendMessage(this._player, 'You shoot wildly and miss!');

        return true;
    }
});
Game.Screen.throwTargetScreen = new Game.Screen.TargetBasedScreen({
    captionFunction: function(x, y, points) {
        var throwing = this._player.getItems()[this._player.getThrowing()];
        var throwingSkill = this._player.getThrowingSkill();
        var entity = this._player.getMap().getEntityAt(x, y, this._player.getZ());
        var string = String.format("You are throwing %s", throwing.describeA());
        if(entity) {
            string += String.format(" at %s", entity.describeA());
        }
        if(points.length > throwingSkill) {
            string += " - Might not do as much damage at this range";
        }
        return string;
    },
    okFunction: function(x, y) {
        this._player.throwItem(this._player.getThrowing(), x, y);
        return true;
    }
});

// Define our help screen
Game.Screen.helpScreen = new Game.Screen.basicScreen({
    enter: function(display) {},
    exit: function(display) {},
    render: function(display) {
        var text = 'Controls / Help';
        var border = '---------------';
        var y = 0;
        display.drawText(Game.getScreenWidth() / 2 - text.length / 2, y++, text);
        display.drawText(Game.getScreenWidth() / 2 - text.length / 2, y++, border);
        y += 3;
        display.drawText(0, y++, 'Arrow keys to move');
        display.drawText(0, y++, '[<] to go up stairs');
        display.drawText(0, y++, '[>] to go down stairs');
        display.drawText(0, y++, '[,] to pick up items');
        display.drawText(0, y++, '[d] to drop items');
        display.drawText(0, y++, '[e] to equip items');
        display.drawText(0, y++, '[E] to eat items');
        display.drawText(0, y++, '[r] to reload');
        display.drawText(0, y++, '[t] to throw items');
        display.drawText(0, y++, '[f] to fire ranged weapons');
        display.drawText(0, y++, '[x] to examine items');
        display.drawText(0, y++, '[;] to look around you');
        display.drawText(0, y++, '[?] to show this help screen');
        y += 3;
        text = '--- press any key to continue ---';
        display.drawText(Game.getScreenWidth() / 2 - text.length / 2, y++, text);
    },
    handleInput: function(inputType, inputData) {
        Game.Screen.playScreen.setSubScreen(null);
    }
});


// Level-up screen
Game.Screen.gainStatScreen = new Game.Screen.basicScreen({
    enter: function(entity) {
        // Must be called before rendering.
        this._entity = entity;
        this._options = entity.getStatOptions();
        Game.Screen.playScreen.setSubScreen(Game.Screen.gainStatScreen);
    },
    exit: function() {
        this._entity = null;
        this._options = null;
        Game.Screen.playScreen.setSubScreen(undefined);
    },
    render: function(display) {
        var letters = 'abcdefghijklmnopqrstuvwxyz';
        display.drawText(0, 0, 'Choose a stat to increase: ');

        // Iterate through each of our options
        for (var i = 0; i < this._options.length; i++) {
            display.drawText(0, 2 + i, letters.substring(i, i + 1) + ' - ' + this._options[i][0]);
        }

        // Render remaining stat points
        display.drawText(0, 4 + this._options.length, "Remaining points: " + this._entity.getStatPoints());
    },
    handleInput: function(inputType, inputData) {
        if (inputType === 'keydown') {
            // If a letter was pressed, check if it matches to a valid option.
            if (inputData.keyCode >= ROT.VK_A && inputData.keyCode <= ROT.VK_Z) {
                // Check if it maps to a valid item by subtracting 'a' from the character
                // to know what letter of the alphabet we used.
                var index = inputData.keyCode - ROT.VK_A;
                if (this._options[index]) {
                    // Call the stat increasing function
                    this._options[index][1].call(this._entity);
                    // Decrease stat points
                    this._entity.setStatPoints(this._entity.getStatPoints() - 1);
                    // If we have no stat points left, exit the screen, else refresh
                    if (this._entity.getStatPoints() === 0) {
                        this.exit();
                    } else {
                        Game.refresh();
                    }
                }
            }
        }
    }
});

// Define our winning screen
Game.Screen.winScreen = new Game.Screen.basicScreen({
    enter: function() {    console.log("Entered win screen."); },
    exit: function() { console.log("Exited win screen."); },
    render: function(display) {
        // Render our prompt to the screen
        for (var i = 0; i < 22; i++) {
            // Generate random background colors
            var r = Math.round(Math.random() * 255);
            var g = Math.round(Math.random() * 255);
            var b = Math.round(Math.random() * 255);
            var background = ROT.Color.toRGB([r, g, b]);
            display.drawText(2, i + 1, "%b{" + background + "}You win!");
        }
    },
    handleInput: function(inputType, inputData) {
        if(inputType === 'keydown' && inputData.keyCode === ROT.VK_RETURN) {
            Game.switchScreen(Game.Screen.playScreen);
        }   
    }
});

// Define our winning screen
Game.Screen.loseScreen = new Game.Screen.basicScreen({
    enter: function() { console.log("Entered lose screen."); },
    exit: function() { console.log("Exited lose screen."); },
    render: function(display) {
        var w = Game.getScreenWidth();
        var h = Game.getScreenHeight();
        // Render prompt to the screen
        display.drawText((w/2) - 7, 5, "%c{" + Game.Palette.red + "}You have died.");
        display.drawText((w/2) - 12, 8, "Press [Enter] to restart!");
    },
    handleInput: function(inputType, inputData) {
        if(inputType === 'keydown' && inputData.keyCode === ROT.VK_RETURN) {
            Game.Screen.playScreen.setGameEnded(false);
            Game.switchScreen(Game.Screen.startScreen);
        }     
    }
});