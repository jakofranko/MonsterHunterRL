Game.EntityRepository = new Game.Repository('entities', Game.Entity);
Game.EntityRepository.difficulties = false;

Game.EntityRepository.getDifficulties = function() {
    if(this._difficulties)
        return this._difficulties;

    // Note: only returns difficulties for the templates that can be created randomly
    var difficulties = {};
    for(var name in this._randomTemplates)
        difficulties[name] = this._calculateDifficulty(name);

    this._difficulties = difficulties;

    return difficulties;
};
Game.EntityRepository.createRandomByDifficulty = function(difficulty, margin) {
    var difficultyMargin = margin || 0;
    if(!this._difficulties)
        throw new Error("The difficulties for entities need to be initialized via getDifficulties");

    var entities = [];
    for(var name in this._difficulties)
        if(this._difficulties[name] <= difficulty + difficultyMargin && this._difficulties[name] >= difficulty - difficultyMargin)
            entities.push(name);
    if(entities.length <= 0)
        debugger;
    return this.create(entities.random());
};
Game.EntityRepository._calculateDifficulty = function(name) {
    var entity = this.create(name);
    var difficulty = 0;
    var attr = [
        'str',
        'dex',
        'int',
        'will',
        'per',
        'tough',
        'odd',
        'maxHp',
    ];
    for (var i = 0; i < attr.length; i++) {
        // capitalize the attr; \b = word boundary (the beginning of a word)
        var getter = 'get' + attr[i].replace(/\b\w/g, function(word) { return word.toUpperCase(); });
        difficulty += entity[getter]();
    }

    if(entity.hasMixin('MeleeAttacker')) {
        if(entity.getMeleeAttackStyle() == 'slot') {
            var meleeSlots = entity.getMeleeSlots();
            for (var j = 0; j < meleeSlots.length; j++) {
                difficulty += entity.getMeleeAttackValue(meleeSlots[j], true);
            }
        } else {
            difficulty += entity.getMeleeAttackValue(false, true);
        }
    }

    if(entity.hasMixin('RangedAttacker')) {
        if(entity.getRangedAttackStyle() == 'slot') {
            var rangedSlots = entity.getRangedSlots();
            for (var k = 0; k < rangedSlots.length; k++) {
                difficulty += entity.getRangedAttackValue(rangedSlots[k], true);
            }
        } else {
            difficulty += entity.getRangedAttackValue(false, true);
        }
    }

    return difficulty;
};

// Notes:
// - For monsters, if you specify a rangedAttackStyle or meleeAttackStyle of 'all', damage will be calculated by summing ALL equipped items and then adding the meleeAttackValue or rangedAttackValue of the entity. This is useful if you want to make a monster that has 'claws' items and attacks from them just represent them using all of their natural weaponry against you. 
// - If 'slot' is specified instead, they will attack a lot more like the player does. If this is the case, rangedAttackValue or meleeAttackValue is not considered in the damage. PCs will always attack via slots, and thus will never have an attackValue. This is the default style if not specified.

// Player characters
Game.EntityRepository.define('Owen', {
    name: 'Owen',
    type: 'player',
    character: '@',
    foreground: Game.Palette.white,
    str: 2,
    dex: 1,
    int: 1,
    will: 2,
    per: 1,
    tough: 2,
    odd: 1,
    maxHp: 40,
    sightRadius: 6,
    inventorySlots: 22,
    items: ['kukri', 'grenade', 'grenade', 'shotgun shell'],
    equipment: {
        rightHand: 'shotgun'
    },
    mixins: [
        Game.EntityMixins.Sight,
        Game.EntityMixins.PlayerActor,
        Game.EntityMixins.Destructible,
        Game.EntityMixins.Equipper,
        Game.EntityMixins.MeleeAttacker,
        Game.EntityMixins.RangedAttacker,
        Game.EntityMixins.FoodConsumer,
        Game.EntityMixins.InventoryHolder,
        Game.EntityMixins.MessageRecipient,
        Game.EntityMixins.PlayerStatGainer,
        Game.EntityMixins.Thrower,
        Game.EntityMixins.ExperienceGainer
    ]
}, {
    disableRandomCreation: true
});
Game.EntityRepository.define('Julie', {
    name: 'Julie',
    type: 'player',
    character: '@',
    foreground: Game.Palette.blue,
    str: 0,
    dex: 4,
    int: 3,
    will: 1,
    per: 2,
    tough: 0,
    odd: 0,
    maxHp: 40,
    sightRadius: 6,
    inventorySlots: 22,
    items: ['rifle', 'lead bullet'],
    equipment: {
        rightHand: 'pistol',
        leftHand: 'knife'
    },
    mixins: [
        Game.EntityMixins.Sight,
        Game.EntityMixins.PlayerActor,
        Game.EntityMixins.Destructible,
        Game.EntityMixins.Equipper,
        Game.EntityMixins.MeleeAttacker,
        Game.EntityMixins.RangedAttacker,
        Game.EntityMixins.FoodConsumer,
        Game.EntityMixins.InventoryHolder,
        Game.EntityMixins.MessageRecipient,
        Game.EntityMixins.PlayerStatGainer,
        Game.EntityMixins.Thrower,
        Game.EntityMixins.ExperienceGainer
    ]
}, {
    disableRandomCreation: true
});
Game.EntityRepository.define('Franks', {
    name: 'Franks',
    type: 'player',
    character: '@',
    foreground: Game.Palette.green,
    str: 4,
    dex: 1,
    int: 0,
    will: 1,
    per: -1,
    tough: 4,
    odd: 1,
    maxHp: 40,
    sightRadius: 6,
    inventorySlots: 22,
    items: ['lead bullet'],
    equipment: {
        rightHand: 'long sword',
        leftHand: 'pistol',
        body: 'balistic vest'
    },
    mixins: [
        Game.EntityMixins.Sight, 
        Game.EntityMixins.PlayerActor, 
        Game.EntityMixins.Destructible,
        Game.EntityMixins.Equipper,
        Game.EntityMixins.MeleeAttacker,
        Game.EntityMixins.RangedAttacker,
        Game.EntityMixins.FoodConsumer,
        Game.EntityMixins.InventoryHolder,
        Game.EntityMixins.MessageRecipient,
        Game.EntityMixins.PlayerStatGainer,
        Game.EntityMixins.Thrower,
        Game.EntityMixins.ExperienceGainer
    ]
}, {
    disableRandomCreation: true
});
Game.EntityRepository.define('Chastity', {
    name: 'Chastity',
    type: 'player',
    character: '@',
    foreground: Game.Palette.white,
    str: 0,
    dex: 3,
    int: 1,
    will: 1,
    per: 2,
    tough: 0,
    odd: 3,
    maxHp: 40,
    sightRadius: 6,
    inventorySlots: 22,
    items: ['wooden arrow', 'iron arrow'],
    equipment: {
        rightHand: 'bow'
    },
    mixins: [
        Game.EntityMixins.Sight,
        Game.EntityMixins.PlayerActor,
        Game.EntityMixins.Destructible,
        Game.EntityMixins.Equipper,
        Game.EntityMixins.MeleeAttacker,
        Game.EntityMixins.RangedAttacker,
        Game.EntityMixins.FoodConsumer,
        Game.EntityMixins.InventoryHolder,
        Game.EntityMixins.MessageRecipient,
        Game.EntityMixins.PlayerStatGainer,
        Game.EntityMixins.Thrower,
        Game.EntityMixins.ExperienceGainer
    ]
}, {
    disableRandomCreation: true
});
Game.EntityRepository.define('Mitchell', {
    name: 'Mitchell',
    type: 'player',
    character: '@',
    foreground: Game.Palette.white,
    str: 0,
    dex: 0,
    int: 4,
    will: 2,
    per: 0,
    tough: 0,
    odd: 4,
    maxHp: 40,
    sightRadius: 6,
    inventorySlots: 22,
    items: ['lead bullet', 'silver bullet'],
    equipment: {
        rightHand: 'pistol',
        leftHand: 'pistol'
    },
    mixins: [
        Game.EntityMixins.Sight,
        Game.EntityMixins.PlayerActor,
        Game.EntityMixins.Destructible,
        Game.EntityMixins.Equipper,
        Game.EntityMixins.MeleeAttacker,
        Game.EntityMixins.RangedAttacker,
        Game.EntityMixins.FoodConsumer,
        Game.EntityMixins.InventoryHolder,
        Game.EntityMixins.MessageRecipient,
        Game.EntityMixins.PlayerStatGainer,
        Game.EntityMixins.Thrower,
        Game.EntityMixins.ExperienceGainer
    ]
}, {
    disableRandomCreation: true
});

// Monsters
Game.EntityRepository.define('fungus', {
    name: 'fungus',
    type: 'creature',
    character: 'F',
    foreground: 'green',
    maxHp: 10,
    speed: 250,
    mixins: [
        Game.EntityMixins.FungusActor,
        Game.EntityMixins.Destructible,
        Game.EntityMixins.ExperienceGainer,
        Game.EntityMixins.RandomStatGainer
    ]
});

Game.EntityRepository.define('gnome', {
    name: 'gnome',
    type: 'fairy', // right? In Dungeons of Dredmore they are demons though
    character: 'g',
    foreground: Game.Palette.yellow,
    maxHp: 5,
    speed: 1250,
    ai: ['hunt', 'wander'],
    behavior: 'agressive',
    equipment: {
        rightHand: 'dagger'
    },
    mixins: [
        Game.EntityMixins.AIActor,
        Game.EntityMixins.Sight,
        Game.EntityMixins.Equipper,
        Game.EntityMixins.MeleeAttacker,
        Game.EntityMixins.CorpseDropper,
        Game.EntityMixins.Destructible,
        Game.EntityMixins.ExperienceGainer,
        Game.EntityMixins.RandomStatGainer
    ]
});

Game.EntityRepository.define('bat', {
    name: 'bat',
    type: 'creature',
    character: 'B',
    foreground: 'white',
    maxHp: 4,
    meleeAttackValue: 2,
    meleeAttackStyle: 'all',
    speed: 2000,
    mixins: [
        Game.EntityMixins.AIActor,
        Game.EntityMixins.Sight,
        Game.EntityMixins.MeleeAttacker,
        Game.EntityMixins.CorpseDropper,
        Game.EntityMixins.Destructible,
        Game.EntityMixins.ExperienceGainer,
        Game.EntityMixins.RandomStatGainer
    ]
});

Game.EntityRepository.define('zombie', {
    name: 'zombie',
    type: 'undead',
    character: 'z',
    foreground: Game.Palette.green,
    maxHp: 10,
    meleeAttackValue: 3,
    meleeAttackStyle: 'all',
    speed: 750,
    ai: ['hunt', 'wander'],
    behavior: 'agressive',
    equipment: {
        rightHand: 'zombie claw',
        leftHand: 'zombie claw'
    },
    mixins: [
        Game.EntityMixins.AIActor,
        Game.EntityMixins.Sight,
        Game.EntityMixins.Equipper,
        Game.EntityMixins.MeleeAttacker,
        Game.EntityMixins.CorpseDropper,
        Game.EntityMixins.Destructible,
        Game.EntityMixins.ExperienceGainer,
        Game.EntityMixins.RandomStatGainer
    ]
});

Game.EntityRepository.define('orc', {
    name: 'orc',
    character: 'o',
    foreground: Game.Palette.green,
    maxHp: 14,
    ai: ['hunt', 'wander'],
    behavior: 'agressive',
    equipment: {
        rightHand: 'crude axe'
    },
    mixins: [
        Game.EntityMixins.AIActor,
        Game.EntityMixins.Sight,
        Game.EntityMixins.Equipper,
        Game.EntityMixins.MeleeAttacker,
        Game.EntityMixins.CorpseDropper,
        Game.EntityMixins.Destructible,
        Game.EntityMixins.ExperienceGainer,
        Game.EntityMixins.RandomStatGainer
    ]
});

Game.EntityRepository.define('wight', {
    name: 'wight',
    type: 'undead',
    character: 'w',
    foreground: Game.Palette.white,
    maxHp: 20,
    meleeAttackValue: 4,
    meleeAttackStyle: 'all',
    speed: 900,
    ai: ['hunt', 'wander'],
    behavior: 'agressive',
    items: {
        body: 'wight chill'
    },
    mixins: [
        Game.EntityMixins.AIActor,
        Game.EntityMixins.Sight,
        Game.EntityMixins.Equipper,
        Game.EntityMixins.MeleeAttacker,
        Game.EntityMixins.CorpseDropper,
        Game.EntityMixins.Destructible,
        Game.EntityMixins.ExperienceGainer,
        Game.EntityMixins.RandomStatGainer
    ]
});

Game.EntityRepository.define('troll', {
    name: 'troll',
    character: 't',
    foreground: Game.Palette.blue,
    maxHp: 20,
    ai: ['hunt', 'wander'],
    behavior: 'agressive',
    equipment: {
        rightHand: 'oversized club',
        body: 'rotted leather toga'
    },
    mixins: [
        Game.EntityMixins.AIActor,
        Game.EntityMixins.Sight,
        Game.EntityMixins.Equipper,
        Game.EntityMixins.MeleeAttacker,
        Game.EntityMixins.CorpseDropper,
        Game.EntityMixins.Destructible,
        Game.EntityMixins.ExperienceGainer,
        Game.EntityMixins.RandomStatGainer
    ]
});

Game.EntityRepository.define('werewolf', {
    name: 'werewolf',
    type: 'monster',
    character: 'W',
    foreground: Game.Palette.brown,
    maxHp: 30,
    meleeAttackValue: 3,
    meleeAttackStyle: 'all',
    ai: ['hunt', 'wander'],
    behavior: 'agressive',
    equipment: {
        rightHand: 'werewolf claw',
        leftHand: 'werewolf claw',
        face: 'werwolf fangs'
    },
    mixins: [
        Game.EntityMixins.AIActor,
        Game.EntityMixins.Sight,
        Game.EntityMixins.Equipper,
        Game.EntityMixins.MeleeAttacker,
        Game.EntityMixins.CorpseDropper,
        Game.EntityMixins.Destructible,
        Game.EntityMixins.ExperienceGainer,
        Game.EntityMixins.RandomStatGainer
    ]
});

Game.EntityRepository.define('vampire', {
    name: 'vampire',
    type: 'monster',
    character: 'V',
    foreground: Game.Palette.purple,
    maxHp: 22,
    meleeAttackValue: 4,
    meleeAttackStyle: 'all',
    speed: 1500,
    ai: ['hunt', 'wander'],
    behavior: 'agressive',
    equipment: {
        rightHand: 'vampire claw',
        leftHand: 'vampire claw',
        face: 'vampire fangs'
    },
    mixins: [
        Game.EntityMixins.AIActor,
        Game.EntityMixins.Sight,
        Game.EntityMixins.Equipper,
        Game.EntityMixins.MeleeAttacker,
        Game.EntityMixins.CorpseDropper,
        Game.EntityMixins.Destructible,
        Game.EntityMixins.ExperienceGainer,
        Game.EntityMixins.RandomStatGainer
    ]
});

Game.EntityRepository.define('slime', {
    name: 'slime',
    type: 'monster',
    character: 's',
    foreground: 'lightGreen',
    maxHp: 10,
    meleeAttackValue: 4,
    meleeAttackStyle: 'all',
    sightRadius: 3,
    ai: ['hunt', 'wander'],
    behavior: 'agressive',
    mixins: [
        Game.EntityMixins.AIActor,
        Game.EntityMixins.Sight,
        Game.EntityMixins.MeleeAttacker,
        Game.EntityMixins.Destructible,
        Game.EntityMixins.CorpseDropper,
        Game.EntityMixins.ExperienceGainer,
        Game.EntityMixins.RandomStatGainer
    ]
});
