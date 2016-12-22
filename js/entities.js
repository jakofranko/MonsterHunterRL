Game.EntityRepository = new Game.Repository('entities', Game.Entity);

Game.PlayerTemplate = {
    name: 'human (you)',
    character: '@',
    foreground: 'white',
    maxHp: 40,
    attackValue: 10,
    sightRadius: 6,
    inventorySlots: 22,
    mixins: [
        Game.EntityMixins.Sight, 
        Game.EntityMixins.PlayerActor, 
        Game.EntityMixins.Destructible,
        Game.EntityMixins.Equipper,
        Game.EntityMixins.Attacker,
        Game.EntityMixins.FoodConsumer,
        Game.EntityMixins.InventoryHolder,
        Game.EntityMixins.MessageRecipient,
        Game.EntityMixins.PlayerStatGainer,
        Game.EntityMixins.Thrower,
        Game.EntityMixins.ExperienceGainer
    ]
};

Game.EntityRepository.define('fungus', {
    name: 'fungus',
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
    character: 'g',
    foreground: Game.Palette.yellow,
    maxHp: 5,
    attackValue: 4,
    speed: 2000,
    mixins: [
        Game.EntityMixins.TaskActor, 
        Game.EntityMixins.Attacker, 
        Game.EntityMixins.CorpseDropper, 
        Game.EntityMixins.Destructible, 
        Game.EntityMixins.ExperienceGainer, 
        Game.EntityMixins.RandomStatGainer
    ]
});

Game.EntityRepository.define('bat', {
    name: 'bat',
    character: 'B',
    foreground: 'white',
    maxHp: 5,
    attackValue: 4,
    speed: 2000,
    mixins: [
        Game.EntityMixins.TaskActor, 
        Game.EntityMixins.Attacker, 
        Game.EntityMixins.CorpseDropper, 
        Game.EntityMixins.Destructible, 
        Game.EntityMixins.ExperienceGainer, 
        Game.EntityMixins.RandomStatGainer
    ]
});

Game.EntityRepository.define('zombie', {
    name: 'zombie',
    character: 'z',
    foreground: Game.Palette.green,
    maxHp: 5,
    attackValue: 4,
    speed: 2000,
    mixins: [
        Game.EntityMixins.TaskActor, 
        Game.EntityMixins.Attacker, 
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
    maxHp: 5,
    attackValue: 4,
    speed: 2000,
    mixins: [
        Game.EntityMixins.TaskActor, 
        Game.EntityMixins.Attacker, 
        Game.EntityMixins.CorpseDropper, 
        Game.EntityMixins.Destructible, 
        Game.EntityMixins.ExperienceGainer, 
        Game.EntityMixins.RandomStatGainer
    ]
});

Game.EntityRepository.define('wight', {
    name: 'wight',
    character: 'w',
    foreground: Game.Palette.white,
    maxHp: 5,
    attackValue: 4,
    speed: 2000,
    mixins: [
        Game.EntityMixins.TaskActor, 
        Game.EntityMixins.Attacker, 
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
    maxHp: 5,
    attackValue: 4,
    speed: 2000,
    mixins: [
        Game.EntityMixins.TaskActor, 
        Game.EntityMixins.Attacker, 
        Game.EntityMixins.CorpseDropper, 
        Game.EntityMixins.Destructible, 
        Game.EntityMixins.ExperienceGainer, 
        Game.EntityMixins.RandomStatGainer
    ]
});

Game.EntityRepository.define('werewolf', {
    name: 'werewolf',
    character: 'W',
    foreground: Game.Palette.brown,
    maxHp: 5,
    attackValue: 4,
    speed: 2000,
    mixins: [
        Game.EntityMixins.TaskActor, 
        Game.EntityMixins.Attacker, 
        Game.EntityMixins.CorpseDropper, 
        Game.EntityMixins.Destructible, 
        Game.EntityMixins.ExperienceGainer, 
        Game.EntityMixins.RandomStatGainer
    ]
});

Game.EntityRepository.define('vampire', {
    name: 'vampire',
    character: 'V',
    foreground: Game.Palette.purple,
    maxHp: 5,
    attackValue: 4,
    speed: 2000,
    mixins: [
        Game.EntityMixins.TaskActor, 
        Game.EntityMixins.Attacker, 
        Game.EntityMixins.CorpseDropper, 
        Game.EntityMixins.Destructible, 
        Game.EntityMixins.ExperienceGainer, 
        Game.EntityMixins.RandomStatGainer
    ]
});

Game.EntityRepository.define('slime', {
    name: 'slime',
    character: 's',
    foreground: 'lightGreen',
    maxHp: 10,
    attackValue: 5,
    sightRadius: 3,
    tasks: ['hunt', 'wander'],
    mixins: [
        Game.EntityMixins.TaskActor, 
        Game.EntityMixins.Sight,
        Game.EntityMixins.Attacker, 
        Game.EntityMixins.Destructible,
        Game.EntityMixins.CorpseDropper,
        Game.EntityMixins.ExperienceGainer, 
        Game.EntityMixins.RandomStatGainer
    ]
});