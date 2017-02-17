Game.ItemRepository = new Game.Repository('items', Game.Item);

// Weapons
Game.ItemRepository.define('knife', {
    name: 'knife',
    description: 'Just a little stabby',
    character: ')',
    foreground: Game.Palette.grey,
    dice: '1d4',
    attackValue: 2,
    statModifier: 'dex',
    type: 'melee',
    hands: 1,
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('dagger', {
    name: 'dagger',
    description: 'A bit stabbier than a knife, but not as good at spreading butter', 
    character: ')',
    foreground: Game.Palette.grey,
    dice: '1d4',
    attackValue: 5,
    statModifier: 'dex',
    type: 'melee',
    hands: 1,
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('kukri', {
    name: 'kukri',
    description: 'Great at hacking off limbs of trees and monsters alike',
    character: ')',
    foreground: Game.Palette.grey,
    dice: '1d4',
    attackValue: 6,
    statModifier: 'str',
    type: 'melee',
    hands: 1,
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('long sword', {
    name: 'long sword',
    description: 'Long is relative as this seems to be the average size of swords',
    character: '/',
    foreground: Game.Palette.grey,
    dice: '1d8',
    attackValue: 4,
    statModifier: 'str',
    type: 'melee',
    hands: 2,
    mixins: [Game.ItemMixins.Equippable]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('crude axe', {
    name: 'crude axe',
    character: '\\',
    foreground: Game.Palette.grey,
    dice: '1d6',
    attackValue: 2,
    statModifier: 'str',
    type: 'melee',
    hands: 1,
    mixins: [Game.ItemMixins.Equippable]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('oversized club', {
    name: 'oversized club',
    character: '\\',
    foreground: Game.Palette.brown,
    dice: '2d8',
    attackValue: 0,
    statModifier: 'str',
    type: 'melee',
    hands: 2,
    mixins: [Game.ItemMixins.Equippable]
}, {
    disableRandomCreation: true
});

// Guns
Game.ItemRepository.define('shotgun', {
    name: 'shotgun',
    description: 'Double the barrels, double the fun',
    character: '|',
    foreground: Game.Palette.gunmetal,
    dice: '3d4',
    attackValue: 0,
    type: 'ranged',
    hands: 2,
    clipSize: 2,
    ammoType: 'shotgun shell',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.UsesAmmo]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('rifle', {
    name: 'rifle',
    description: 'This is my rifle. Well you get the rest',
    character: '|',
    foreground: Game.Palette.gunmetal,
    dice: '1d8',
    attackValue: 4,
    type: 'ranged',
    hands: 2,
    clipSize: 6,
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.UsesAmmo]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('bow', {
    name: 'bow',
    description: 'Just like Legolas!',
    character: '(',
    foreground: Game.Palette.brown,
    dice: '1d6',
    attackValue: 3,
    type: 'ranged',
    hands: 2,
    clipSize: 1,
    ammoType: 'arrow',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.UsesAmmo]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('pistol', {
    name: 'pistol',
    description: 'Do not hold sideways when firing',
    character: '|',
    foreground: Game.Palette.gunmetal,
    dice: '1d6',
    attackValue: 2,
    type: 'ranged',
    hands: 1,
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.UsesAmmo]
}, {
    disableRandomCreation: true
});

// Ammo
Game.ItemRepository.define('lead bullet', {
    name: 'lead bullet',
    character: ':',
    foreground: Game.Palette.gunmetal,
    attackValue: 1,
    count: 20,
    type: 'ammo',
    stackable: true,
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Stackable]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('arrow', {
    name: 'arrow',
    character: '^',
    foreground: Game.Palette.brown,
    attackValue: 1,
    count: 10,
    type: 'ammo',
    stackable: true,
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Stackable]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('shotgun shell', {
    name: 'shotgun shell',
    character: ':',
    foreground: Game.Palette.gunmetal,
    attackValue: 2,
    count: 12,
    type: 'ammo',
    stackable: true,
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Stackable]
}, {
    disableRandomCreation: true
});

// Throwables
Game.ItemRepository.define('grenade', {
    name: 'grenade',
    character: '*',
    foreground: Game.Palette.gunmetal,
    attackValue: 2,
    throwable: true,
    stackable: true,
    mixins: [Game.ItemMixins.Throwable, Game.ItemMixins.Stackable]
});

// Armor
Game.ItemRepository.define('tunic', {
    name: 'tunic',
    character: '[',
    foreground: 'green',
    defenseValue: 2,
    mixins: [Game.ItemMixins.Equippable]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('chainmail', {
    name: 'chainmail',
    character: '[',
    foreground: 'white',
    defenseValue: 4,
    mixins: [Game.ItemMixins.Equippable]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('platemail', {
    name: 'platemail',
    character: '[',
    foreground: 'aliceblue',
    defenseValue: 6,
    mixins: [Game.ItemMixins.Equippable]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('balistic vest', {
    name: 'balistic vest',
    character: '[',
    foreground: Game.Palette.grey,
    slotLocations: ['body'],
    defenseValue: 6,
    mixins: [Game.ItemMixins.Equippable]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('rotted leather toga', {
    name: 'rotted leather toga',
    character: '[',
    foreground: Game.Palette.brown,
    slotLocations: ['body'],
    defenseValue: 1,
    mixins: [Game.ItemMixins.Equippable]
}, {
    disableRandomCreation: true
});

// Monster-only items
Game.ItemRepository.define('zombie claws', {
    name: 'zombie claws',
    character: '^',
    foreground: Game.Palette.grey,
    dice: '1d4',
    attackValue: 2,
    statModifier: 'str',
    type: 'melee',
    hands: 1,
    mixins: [Game.ItemMixins.Equippable]
}, {
    disableRandomCreation: true
});
Game.ItemRepository.define('werewolf claws', {
    name: 'werewolf claws',
    character: '^',
    foreground: Game.Palette.grey,
    dice: '1d6',
    attackValue: 4,
    statModifier: 'str',
    type: 'melee',
    hands: 1,
    mixins: [Game.ItemMixins.Equippable]
}, {
    disableRandomCreation: true
});
Game.ItemRepository.define('vampire claws', {
    name: 'vampire claws',
    character: '^',
    foreground: Game.Palette.purple,
    dice: '2d6',
    attackValue: 2,
    statModifier: 'str',
    type: 'melee',
    hands: 1,
    mixins: [Game.ItemMixins.Equippable]
}, {
    disableRandomCreation: true
});
Game.ItemRepository.define('werwolf fangs', {
    name: 'werewolf fangs',
    character: '^',
    foreground: Game.Palette.bonewhite,
    dice: '1d6',
    attackValue: 0,
    statModifier: 'str',
    type: 'melee',
    slotLocations: ['face'],
    mixins: [Game.ItemMixins.Equippable]
}, {
    disableRandomCreation: true
});
Game.ItemRepository.define('vampire fangs', {
    name: 'vampire fangs',
    character: '^',
    foreground: Game.Palette.bonewhite,
    dice: '1d8',
    attackValue: 0,
    statModifier: 'str',
    type: 'melee',
    slotLocations: ['face'],
    mixins: [Game.ItemMixins.Equippable]
}, {
    disableRandomCreation: true
});

//Artifacts
Game.ItemRepository.define('Cavity Ridden Dragon Tooth', {
    name: 'Cavity Ridden Dragon Tooth',
    description: 'This looks super dangerous. Also kinda gross.', 
    character: ')',
    foreground: Game.Palette.yellow,
    dice: '4d4',
    attackValue: 6,
    statModifier: 'dex',
    type: 'melee',
    hands: 1,
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('wight chill', {
    name: 'wight chill',
    character: '&',
    foreground: Game.Palette.bonewhite,
    dice: '1d8',
    attackValue: 4,
    statModifier: 'str',
    type: 'melee',
    slotLocations: ['body'],
    mixins: [Game.ItemMixins.Equippable]
}, {
    disableRandomCreation: true
});

//Artifacts
Game.ItemRepository.define('Cavity Ridden Dragon Tooth', {
    name: 'Cavity Ridden Dragon Tooth',
    description: 'This looks super dangerous. Also kinda gross.', 
    character: ')',
    foreground: Game.Palette.yellow,
    dice: '4d4',
    attackValue: 6,
    statModifier: 'dex',
    type: 'melee',
    hands: 1,
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('Extra Long Sword', {
    name: 'Extra Long Sword',
    description: 'The mad genius who created this was probably compensating for somethihg', 
    character: '/',
    foreground: Game.Palette.gunmetal,
    dice: '3d8',
    attackValue: 4,
    statModifier: 'str',
    type: 'melee',
    hands: 1,
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable]
}, {
    disableRandomCreation: true
});

// Misc.
Game.ItemRepository.define('rock', {
    name: 'rock',
    character: '*',
    foreground: 'white',
    attackValue: 2,
    throwable: true,
    stackable: true,
    mixins: [Game.ItemMixins.Throwable, Game.ItemMixins.Stackable]
});

Game.ItemRepository.define('apple', {
    name: 'apple',
    character: '%',
    foreground: 'red',
    foodValue: 50,
    stackable: true,
    mixins: [Game.ItemMixins.Edible, Game.ItemMixins.Stackable]
});

Game.ItemRepository.define('melon', {
    name: 'melon',
    character: '%',
    foreground: 'lightgreen',
    foodValue: 35,
    consumptions: 4,
    mixins: [Game.ItemMixins.Edible]
});

Game.ItemRepository.define('corpse', {
    name: 'corpse',
    character: '%',
    foodValue: 75,
    consumptions: 1,
    mixins: [Game.ItemMixins.Edible]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('pumpkin', {
    name: 'pumpkin',
    character: '%',
    foreground: 'orange',
    foodValue: 50,
    attackValue: 2,
    defenseValue: 2,
    wearable: true,
    wieldable: true,
    throwable: true,
    mixins: [Game.ItemMixins.Edible, Game.ItemMixins.Equippable, Game.ItemMixins.Throwable]
});
